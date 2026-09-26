/**
 * Audio services on top of the platform: speech synthesis (Dutch voices), speech
 * recognition (nl-NL / nl-BE) and a recorder for shadowing. Everything degrades
 * gracefully: no voice → show text and explain; no recognizer → type instead.
 */
import { useSyncExternalStore } from 'react';

export type Region = 'nl' | 'be';

// ---------- Text-to-speech ----------

let voices: SpeechSynthesisVoice[] = [];
const voiceListeners = new Set<() => void>();

function synth(): SpeechSynthesis | null {
  return typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
}

function loadVoices() {
  const s = synth();
  if (!s) return;
  voices = s.getVoices();
  voiceListeners.forEach((l) => l());
}

if (synth()) {
  loadVoices();
  synth()!.addEventListener?.('voiceschanged', loadVoices);
}

export function ttsSupported(): boolean {
  return synth() !== null;
}

export function dutchVoices(): SpeechSynthesisVoice[] {
  return voices.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith('nl'));
}

/** Re-renders when the platform finishes loading voices (async on Chrome). */
export function useDutchVoices(): SpeechSynthesisVoice[] {
  return useSyncExternalStore(
    (l) => {
      voiceListeners.add(l);
      return () => voiceListeners.delete(l);
    },
    () => voices,
    () => voices,
  ).filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith('nl'));
}

function pickVoice(region: Region, preferredURI: string | null, variant = 0): SpeechSynthesisVoice | undefined {
  const dutch = dutchVoices();
  if (preferredURI && variant === 0) {
    const preferred = dutch.find((v) => v.voiceURI === preferredURI);
    if (preferred) return preferred;
  }
  const regional = dutch.filter((v) => v.lang.toLowerCase().endsWith(region === 'be' ? 'be' : 'nl'));
  const pool = regional.length ? regional : dutch;
  // Prefer higher-quality voices when the platform marks them.
  const ranked = [...pool].sort((a, b) => quality(b) - quality(a));
  return ranked[variant % Math.max(1, ranked.length)];
}

function quality(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  return (
    (name.includes('natural') || name.includes('neural') ? 2 : 0) +
    (name.includes('premium') || name.includes('enhanced') ? 1 : 0) +
    (v.localService ? 0.5 : 0)
  );
}

export interface SpeakOptions {
  rate?: number;
  region?: Region;
  voiceURI?: string | null;
  /** Use a different voice for another speaker in a dialogue. */
  speaker?: number;
}

let speakingKey: string | null = null;
const speakingListeners = new Set<() => void>();
function setSpeaking(key: string | null) {
  speakingKey = key;
  speakingListeners.forEach((l) => l());
}

/** The key of the utterance currently playing (for ▶/■ button state). */
export function useSpeakingKey(): string | null {
  return useSyncExternalStore(
    (l) => {
      speakingListeners.add(l);
      return () => speakingListeners.delete(l);
    },
    () => speakingKey,
    () => speakingKey,
  );
}

let queueToken = 0;

/** Speak Dutch text. Resolves when finished (or immediately when unsupported). */
export function speak(text: string, options: SpeakOptions = {}, key: string = text): Promise<void> {
  const s = synth();
  if (!s) return Promise.resolve();
  s.cancel();
  return speakOne(s, text, options, key);
}

function speakOne(s: SpeechSynthesis, text: string, options: SpeakOptions, key: string): Promise<void> {
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    const voice = pickVoice(options.region ?? 'nl', options.voiceURI ?? null, options.speaker ?? 0);
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? (options.region === 'be' ? 'nl-BE' : 'nl-NL');
    u.rate = Math.min(1.5, Math.max(0.4, options.rate ?? 1));
    const done = () => {
      if (speakingKey === key) setSpeaking(null);
      resolve();
    };
    u.onend = done;
    u.onerror = done;
    setSpeaking(key);
    s.speak(u);
  });
}

/** Play several lines in order (dialogues, listening items). Cancelling stops the sequence. */
export async function speakSequence(
  lines: { text: string; speaker?: number }[],
  options: SpeakOptions,
  key: string,
  onLine?: (index: number) => void,
): Promise<void> {
  const s = synth();
  if (!s) return;
  s.cancel();
  const token = ++queueToken;
  for (let i = 0; i < lines.length; i++) {
    if (token !== queueToken) return;
    onLine?.(i);
    await speakOne(s, lines[i]!.text, { ...options, speaker: lines[i]!.speaker ?? 0 }, key);
    await new Promise((r) => setTimeout(r, 250));
  }
  if (token === queueToken) onLine?.(-1);
}

export function stopSpeaking() {
  queueToken++;
  synth()?.cancel();
  setSpeaking(null);
}

// ---------- Speech recognition ----------

interface RecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface RecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: RecognitionAlternative;
}
interface RecognitionEvent {
  resultIndex: number;
  results: { length: number; [index: number]: RecognitionResult };
}
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function sttSupported(): boolean {
  return recognitionCtor() !== null;
}

export interface ListenResult {
  transcript: string;
  /** Whole-utterance alternatives (best first), for pronunciation scoring. */
  alternatives: string[];
  confidence: number;
}

export interface Listener {
  stop(): void;
  abort(): void;
}

export interface ListenOptions {
  region?: Region;
  /** Keep listening across pauses until stop() (conversation); otherwise stop at the first pause. */
  continuous?: boolean;
  onInterim?: (text: string) => void;
  onResult: (result: ListenResult | null) => void;
  onError?: (message: string) => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  'not-allowed': 'Microphone access is blocked. Allow it in your browser settings, or type instead.',
  'service-not-allowed': 'Speech recognition is not available in this browser. You can type instead.',
  'no-speech': "We didn't hear anything. Try again a little closer to the microphone.",
  'audio-capture': 'No microphone found. You can type instead.',
  network: 'Speech recognition needs a connection in this browser. You can type instead.',
  'language-not-supported': 'Dutch speech recognition is not available on this device. You can type instead.',
};

export function listen(options: ListenOptions): Listener | null {
  const Ctor = recognitionCtor();
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.lang = options.region === 'be' ? 'nl-BE' : 'nl-NL';
  rec.continuous = options.continuous ?? false;
  rec.interimResults = true;
  rec.maxAlternatives = 5;

  let finals: RecognitionResult[] = [];
  let interim = '';
  let failed = false;

  rec.onresult = (event) => {
    finals = [];
    interim = '';
    for (let i = 0; i < event.results.length; i++) {
      const r = event.results[i]!;
      if (r.isFinal) finals.push(r);
      else interim += r[0]?.transcript ?? '';
    }
    const text = [...finals.map((r) => r[0]?.transcript ?? ''), interim].join(' ').replace(/\s+/g, ' ').trim();
    options.onInterim?.(text);
  };
  rec.onerror = (event) => {
    if (event.error === 'aborted') return;
    failed = event.error !== 'no-speech';
    options.onError?.(ERROR_MESSAGES[event.error] ?? 'Speech recognition stopped unexpectedly. You can type instead.');
  };
  rec.onend = () => {
    if (failed) return options.onResult(null);
    const head = finals
      .slice(0, -1)
      .map((r) => r[0]?.transcript ?? '')
      .join(' ');
    const last = finals.at(-1);
    if (!last && !interim.trim()) return options.onResult(null);
    const lastAlternatives: RecognitionAlternative[] = last
      ? Array.from({ length: last.length }, (_, i) => last[i]!).filter(Boolean)
      : [{ transcript: interim, confidence: 0.5 }];
    const alternatives = lastAlternatives.map((a) => `${head} ${a.transcript}`.replace(/\s+/g, ' ').trim()).filter(Boolean);
    options.onResult({
      transcript: alternatives[0] ?? '',
      alternatives,
      confidence: lastAlternatives[0]?.confidence ?? 0,
    });
  };
  try {
    rec.start();
  } catch {
    return null;
  }
  return { stop: () => rec.stop(), abort: () => rec.abort() };
}

// ---------- Recorder (shadowing: record yourself, compare with the model) ----------

export function recorderSupported(): boolean {
  return typeof window !== 'undefined' && 'MediaRecorder' in window && !!navigator.mediaDevices?.getUserMedia;
}

export interface Recording {
  stop(): Promise<string | null>;
}

/** Record from the microphone; `onLevel` receives 0–1 input levels for a meter. */
export async function startRecording(onLevel?: (level: number) => void): Promise<Recording> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  const recorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };

  let raf = 0;
  let ctx: AudioContext | null = null;
  if (onLevel && 'AudioContext' in window) {
    ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let peak = 0;
      for (const v of data) peak = Math.max(peak, Math.abs(v - 128) / 128);
      onLevel(Math.min(1, peak * 1.8));
      raf = requestAnimationFrame(tick);
    };
    tick();
  }

  recorder.start();
  return {
    stop: () =>
      new Promise((resolve) => {
        recorder.onstop = () => {
          cancelAnimationFrame(raf);
          void ctx?.close();
          stream.getTracks().forEach((t) => t.stop());
          resolve(chunks.length ? URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType })) : null);
        };
        if (recorder.state !== 'inactive') recorder.stop();
        else resolve(null);
      }),
  };
}
