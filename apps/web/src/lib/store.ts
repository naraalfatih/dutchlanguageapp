/**
 * Local-first learner store. Every learning action becomes an event that is applied to the
 * local learner state immediately (the same reducer the server uses) and queued in an
 * outbox. When the learner has an account and a connection, the outbox is pushed to the
 * API; the server's state then becomes the base, with any still-unsent events on top.
 */
import { get, set } from 'idb-keyval';
import { useSyncExternalStore } from 'react';
import {
  applyEvents,
  DEFAULT_PROFILE,
  initialLearnerState,
  reseedSkills,
  SYNC_BATCH_LIMIT,
  type AuthResponse,
  type LearnerState,
  type LearningEvent,
  type Profile,
  type ProfileInput,
  type PublicUser,
} from '@praat/core';
import { api, ApiError, hasAccessToken, onSessionEnded, refreshSession, setAccessToken } from './api';

const STORAGE_KEY = 'praat:v1';

export type Theme = 'system' | 'light' | 'dark';

export interface Settings {
  theme: Theme;
  /** Preferred speech-synthesis voice (voiceURI), or null for automatic. */
  voiceURI: string | null;
}

export interface AppData {
  version: 1;
  deviceId: string;
  profile: Profile;
  /** Local profile edits not yet saved to the account. */
  profileDirty: boolean;
  state: LearnerState;
  outbox: LearningEvent[];
  user: PublicUser | null;
  lastSyncAt: string | null;
  settings: Settings;
}

export interface Snapshot extends AppData {
  hydrated: boolean;
  online: boolean;
  syncing: boolean;
  /** Signed in with a live access token (AI conversations available). */
  session: boolean;
  syncError: string | null;
}

function randomId(): string {
  return crypto.randomUUID();
}

function defaults(): AppData {
  return {
    version: 1,
    deviceId: randomId(),
    profile: DEFAULT_PROFILE,
    profileDirty: false,
    state: initialLearnerState(DEFAULT_PROFILE.level),
    outbox: [],
    user: null,
    lastSyncAt: null,
    settings: { theme: 'system', voiceURI: null },
  };
}

let snapshot: Snapshot = {
  ...defaults(),
  hydrated: false,
  online: typeof navigator === 'undefined' ? true : navigator.onLine,
  syncing: false,
  session: false,
  syncError: null,
};
const listeners = new Set<() => void>();

function emit(next: Partial<Snapshot>, save = true) {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((l) => l());
  if (save) schedulePersist();
}

export function getSnapshot(): Snapshot {
  return snapshot;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useApp(): Snapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// ---------- Persistence ----------

let writing = false;
let dirty = false;

function persistable(s: Snapshot): AppData {
  const { version, deviceId, profile, profileDirty, state, outbox, user, lastSyncAt, settings } = s;
  return { version, deviceId, profile, profileDirty, state, outbox, user, lastSyncAt, settings };
}

/**
 * Write-behind persistence: every change is written right away (so a reload or a killed
 * tab never loses progress), and bursts of changes coalesce into one write.
 */
async function flush() {
  if (writing) return;
  writing = true;
  try {
    while (dirty) {
      dirty = false;
      try {
        await set(STORAGE_KEY, persistable(snapshot));
      } catch (error) {
        console.warn('Could not save progress locally', error);
      }
    }
  } finally {
    writing = false;
  }
}

function schedulePersist() {
  if (!snapshot.hydrated) return;
  dirty = true;
  void flush();
}

async function persistNow() {
  dirty = true;
  await flush();
}

export async function hydrate(): Promise<void> {
  let stored: AppData | undefined;
  try {
    stored = await get<AppData>(STORAGE_KEY);
  } catch {
    stored = undefined; // Private mode or blocked storage: run in memory.
  }
  const base = defaults();
  const data: AppData = stored?.version === 1 ? { ...base, ...stored, settings: { ...base.settings, ...stored.settings } } : base;
  emit({ ...data, hydrated: true }, false);
  applyTheme(data.settings.theme);

  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      emit({ online: true }, false);
      void sync();
    });
    window.addEventListener('offline', () => emit({ online: false }, false));
    window.addEventListener('pagehide', () => void persistNow());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') void persistNow();
      else void sync();
    });
  }
  onSessionEnded(() => emit({ session: false }, false));

  if (data.user && snapshot.online) {
    const refreshed = await refreshSession();
    if (refreshed) {
      emit({ session: true, user: refreshed.user });
      void sync();
    }
  }
}

// ---------- Learning events ----------

let syncTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSync(delay = 1500) {
  if (!snapshot.user) return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => void sync(), delay);
}

/** Record learner activity: applied locally now, synced later. */
export function record(events: LearningEvent | LearningEvent[]) {
  const list = Array.isArray(events) ? events : [events];
  if (!list.length) return;
  emit({ state: applyEvents(snapshot.state, list), outbox: [...snapshot.outbox, ...list] });
  scheduleSync();
}

/** Events the server already stored (e.g. from an AI conversation turn): apply, don't queue. */
export function applyRemote(events: LearningEvent[]) {
  if (!events.length) return;
  emit({ state: applyEvents(snapshot.state, events) });
}

export function updateProfile(input: ProfileInput) {
  const profile: Profile = { ...snapshot.profile, ...input };
  const state =
    input.level && input.level !== snapshot.profile.level ? reseedSkills(snapshot.state, input.level) : snapshot.state;
  emit({ profile, state, profileDirty: true });
  scheduleSync(500);
}

export function updateSettings(input: Partial<Settings>) {
  const settings = { ...snapshot.settings, ...input };
  emit({ settings });
  if (input.theme) applyTheme(input.theme);
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  if (theme === 'system') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', theme);
}

// ---------- Sync ----------

let syncing: Promise<void> | null = null;

export function sync(): Promise<void> {
  if (!snapshot.user || !snapshot.online || !hasAccessToken()) return Promise.resolve();
  syncing ??= runSync().finally(() => {
    syncing = null;
  });
  return syncing;
}

async function runSync() {
  emit({ syncing: true, syncError: null }, false);
  try {
    if (snapshot.profileDirty) {
      const sent = snapshot.profile;
      const { profile } = await api.updateProfile(sent);
      // Only clear the flag if nothing changed while the request was in flight.
      emit({ profile: snapshot.profile === sent ? profile : snapshot.profile, profileDirty: snapshot.profile !== sent });
    }
    let pushed = false;
    while (snapshot.outbox.length) {
      const batch = snapshot.outbox.slice(0, SYNC_BATCH_LIMIT);
      const sent = new Set(batch.map((e) => e.id));
      const result = await api.pushEvents(batch, snapshot.deviceId);
      const remaining = snapshot.outbox.filter((e) => !sent.has(e.id));
      emit({ outbox: remaining, state: applyEvents(result.state, remaining) });
      pushed = true;
    }
    if (!pushed) {
      // Nothing to send: pull, so progress from other devices shows up here.
      const server = await api.state();
      emit({ state: applyEvents(server, snapshot.outbox) });
    }
    emit({ lastSyncAt: new Date().toISOString(), syncing: false });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'Sync failed.';
    emit({ syncing: false, syncError: message }, false);
  }
}

// ---------- Account ----------

/**
 * After sign-in or sign-up: keep the richer profile (a guest who just onboarded keeps
 * their answers), upload guest progress, then adopt the account's state.
 */
export async function signIn(auth: AuthResponse, isNewAccount: boolean) {
  setAccessToken(auth.accessToken);
  emit({ user: auth.user, session: true });
  try {
    const me = await api.me();
    const keepLocal = isNewAccount || (snapshot.profile.onboarded && (!me.profile.onboarded || snapshot.profileDirty));
    if (keepLocal) emit({ profileDirty: true });
    else emit({ profile: me.profile, profileDirty: false, state: reseedSkills(snapshot.state, me.profile.level) });
  } catch {
    // Profile reconciliation retries on the next sync.
  }
  await sync();
}

export async function signOut() {
  await sync();
  try {
    await api.logout();
  } catch {
    // Offline: the refresh cookie expires on its own; local data is cleared below either way.
  }
  setAccessToken(null);
  const fresh = defaults();
  emit({ ...fresh, settings: snapshot.settings, session: false, syncError: null });
  await persistNow();
}

export async function deleteAccount() {
  await api.deleteAccount();
  setAccessToken(null);
  emit({ ...defaults(), settings: snapshot.settings, session: false });
  await persistNow();
}

/** Guest reset ("start over"): wipes local progress on this device. */
export async function resetLocal() {
  emit({ ...defaults(), settings: snapshot.settings, session: false });
  await persistNow();
}

export function exportLocal(): string {
  return JSON.stringify({ exportedAt: new Date().toISOString(), ...persistable(snapshot) }, null, 2);
}
