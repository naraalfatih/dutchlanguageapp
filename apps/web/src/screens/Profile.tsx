import { GOALS, LEVELS, type Goal } from '@praat/core';
import { Download, LogOut, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { Header, Segmented } from '../components/ui';
import { api } from '../lib/api';
import { LEVEL_NAMES } from '../lib/content';
import { useVoice } from '../lib/hooks';
import { speak, ttsSupported, useDutchVoices } from '../lib/speech';
import {
  deleteAccount,
  exportLocal,
  resetLocal,
  signOut,
  sync,
  updateProfile,
  updateSettings,
  useApp,
  type Theme,
} from '../lib/store';

const GOAL_LABEL: Record<Goal, string> = {
  moving: 'Living here',
  work: 'Work',
  study: 'Study',
  travel: 'Travel',
  partner: 'Partner & family',
  culture: 'Culture',
};

function download(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Profile() {
  const { profile, user, settings, outbox, lastSyncAt, syncing, syncError, session, online } = useApp();
  const voices = useDutchVoices();
  const voice = useVoice();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="stack-lg">
      <Header title="Profile" />

      <section className="card stack">
        <div className="section-title" style={{ margin: 0 }}>
          Account
        </div>
        {user ? (
          <>
            <div>
              <strong>{user.displayName}</strong>
              <div className="small muted">{user.email}</div>
            </div>
            <div className="small muted" aria-live="polite">
              {syncing
                ? 'Syncing…'
                : syncError
                  ? `Sync problem: ${syncError}`
                  : outbox.length
                    ? `${outbox.length} change${outbox.length === 1 ? '' : 's'} waiting to sync`
                    : lastSyncAt
                      ? `Synced ${new Date(lastSyncAt).toLocaleString()}`
                      : 'Not synced yet'}
              {!session && online && ' · session expired — sign in again to sync'}
            </div>
            <div className="row wrap">
              <button type="button" className="btn small" onClick={() => void sync()} disabled={syncing || !online}>
                <RefreshCw size={16} /> Sync now
              </button>
              <button type="button" className="btn small" onClick={() => void signOut()}>
                <LogOut size={16} /> Sign out
              </button>
            </div>
            {!session && (
              <Link to="/account" className="btn small primary">
                Sign in again
              </Link>
            )}
          </>
        ) : (
          <>
            <p className="small" style={{ margin: 0 }}>
              You're learning as a guest: progress is saved on this device only. Create a free account to sync it and to talk with
              the AI partner.
            </p>
            <div className="row wrap">
              <Link to="/account?mode=register" className="btn primary small">
                Create account
              </Link>
              <Link to="/account" className="btn small">
                Sign in
              </Link>
            </div>
          </>
        )}
      </section>

      <section className="stack">
        <h2>Learning</h2>
        <div className="field">
          <label htmlFor="level">Level</label>
          <select
            id="level"
            className="select"
            value={profile.level}
            onChange={(e) => updateProfile({ level: e.target.value as typeof profile.level })}
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l} — {LEVEL_NAMES[l]}
              </option>
            ))}
          </select>
          <span className="tiny muted">Your skill estimates adjust automatically as you practise.</span>
        </div>
        <div className="field">
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Goals</span>
          <div className="row wrap">
            {GOALS.map((g) => (
              <button
                key={g}
                type="button"
                className={`chip${profile.goals.includes(g) ? ' brand' : ''}`}
                aria-pressed={profile.goals.includes(g)}
                onClick={() =>
                  updateProfile({
                    goals: profile.goals.includes(g) ? profile.goals.filter((x) => x !== g) : [...profile.goals, g],
                  })
                }
              >
                {GOAL_LABEL[g]}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Dutch of</span>
          <Segmented
            label="Region"
            value={profile.region}
            onChange={(region) => updateProfile({ region })}
            options={[
              { value: 'nl', label: 'Netherlands' },
              { value: 'be', label: 'Flanders' },
            ]}
          />
        </div>
        <div className="field">
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Daily time</span>
          <Segmented
            label="Daily minutes"
            value={profile.dailyMinutes}
            onChange={(dailyMinutes) => updateProfile({ dailyMinutes })}
            options={[5, 10, 20, 30].map((m) => ({ value: m as 5 | 10 | 20 | 30, label: `${m} min` }))}
          />
        </div>
        <div className="field">
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Corrections</span>
          <Segmented
            label="Correction style"
            value={profile.correctionStyle}
            onChange={(correctionStyle) => updateProfile({ correctionStyle })}
            options={[
              { value: 'gentle', label: 'Gentle' },
              { value: 'thorough', label: 'Thorough' },
            ]}
          />
          <span className="tiny muted">
            {profile.correctionStyle === 'gentle'
              ? 'The three most important corrections per message — keeps conversations flowing.'
              : 'Up to six corrections per message, including small details.'}
          </span>
        </div>
      </section>

      <section className="stack">
        <h2>Voice</h2>
        {ttsSupported() ? (
          <>
            <div className="field">
              <label htmlFor="rate">Speaking speed: {profile.speechRate.toFixed(1)}×</label>
              <input
                id="rate"
                type="range"
                min={0.6}
                max={1.2}
                step={0.1}
                value={profile.speechRate}
                onChange={(e) => updateProfile({ speechRate: Number(e.target.value) })}
              />
              <span className="tiny muted">Real speed (1.0×) is best in the long run; hold any ▶ button for slow.</span>
            </div>
            {voices.length > 0 ? (
              <div className="field">
                <label htmlFor="voice">Voice</label>
                <select
                  id="voice"
                  className="select"
                  value={settings.voiceURI ?? ''}
                  onChange={(e) => updateSettings({ voiceURI: e.target.value || null })}
                >
                  <option value="">Automatic ({profile.region === 'be' ? 'Flemish' : 'Dutch'} if available)</option>
                  {voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="notice small">
                No Dutch voice found on this device. On iPhone: Settings → Accessibility → Spoken Content → Voices → Dutch. On
                Android: Settings → Text-to-speech → install Dutch voice data. Transcripts are always shown.
              </div>
            )}
            <button
              type="button"
              className="btn small"
              onClick={() => void speak('Hoi! Zo klink ik. Lekker weertje vandaag, hè?', voice, 'test')}
            >
              Test voice
            </button>
          </>
        ) : (
          <p className="small muted">This browser can't play synthesized speech; transcripts are shown instead.</p>
        )}
      </section>

      <section className="stack">
        <h2>Appearance</h2>
        <Segmented
          label="Theme"
          value={settings.theme}
          onChange={(theme: Theme) => updateSettings({ theme })}
          options={[
            { value: 'system', label: 'System' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
        />
      </section>

      <section className="stack">
        <h2>Your data</h2>
        <p className="small muted" style={{ margin: 0 }}>
          We store your learning activity to personalise practice. We never receive or store your voice: your browser's speech
          recognition turns it into text (some browsers, like Chrome, do this on their own servers).
        </p>
        <div className="row wrap">
          <button
            type="button"
            className="btn small"
            onClick={async () => {
              if (user && session) {
                try {
                  download('praat-export.json', JSON.stringify(await api.exportData(), null, 2));
                  return;
                } catch {
                  setMessage('Could not export from the server; exporting this device instead.');
                }
              }
              download('praat-export.json', exportLocal());
            }}
          >
            <Download size={16} /> Export my data
          </button>
          {user ? (
            <button type="button" className="btn small danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={16} /> Delete account
            </button>
          ) : (
            <button
              type="button"
              className="btn small danger"
              onClick={() => {
                if (window.confirm('Delete all progress on this device and start over?')) void resetLocal();
              }}
            >
              <Trash2 size={16} /> Start over
            </button>
          )}
        </div>
        {confirmDelete && (
          <div className="card stack" role="alertdialog" aria-labelledby="del-title">
            <strong id="del-title">Delete your account?</strong>
            <p className="small" style={{ margin: 0 }}>
              This permanently deletes your account, progress, conversations and mistake history. It can't be undone.
            </p>
            <div className="row">
              <button
                type="button"
                className="btn small danger"
                onClick={async () => {
                  try {
                    await deleteAccount();
                  } catch {
                    setMessage('Could not delete the account. Check your connection and try again.');
                  }
                  setConfirmDelete(false);
                }}
              >
                Yes, delete everything
              </button>
              <button type="button" className="btn small" onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
        {message && (
          <p className="small" role="status">
            {message}
          </p>
        )}
      </section>

      <p className="tiny muted center">Praat · learn to actually speak Dutch</p>
    </div>
  );
}
