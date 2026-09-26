import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Header, Segmented } from '../components/ui';
import { api, ApiError } from '../lib/api';
import { signIn, useApp } from '../lib/store';

export default function Account() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const { user, online } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>(search.get('mode') === 'register' ? 'register' : 'login');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const next = search.get('next') ?? '/profile';

  if (user) {
    return (
      <>
        <Header title="Account" back="/profile" />
        <p>
          You're signed in as <strong>{user.email}</strong>.
        </p>
      </>
    );
  }

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') ?? '');
    const password = String(form.get('password') ?? '');
    setBusy(true);
    setError(null);
    try {
      if (mode === 'register') {
        const auth = await api.register({
          email,
          password,
          displayName: String(form.get('displayName') ?? '').trim() || 'Learner',
        });
        await signIn(auth, true);
      } else {
        const auth = await api.login({ email, password });
        await signIn(auth, false);
      }
      navigate(next, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        const issues = (err.details as { issues?: { message: string }[] } | undefined)?.issues;
        setError(issues?.length ? issues.map((i) => i.message).join(' ') : err.message);
      } else setError('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="stack-lg">
      <Header title={mode === 'register' ? 'Create account' : 'Sign in'} back={-1} />
      <p className="muted small" style={{ margin: 0 }}>
        An account syncs your progress across devices and unlocks the AI conversation partner. Progress you made on this device is
        kept.
      </p>
      <Segmented
        label="Account"
        value={mode}
        onChange={(m) => {
          setMode(m);
          setError(null);
        }}
        options={[
          { value: 'login', label: 'Sign in' },
          { value: 'register', label: 'Create account' },
        ]}
      />
      {!online && <div className="notice">You're offline. Connect to sign in.</div>}
      <form className="stack" onSubmit={(e) => void submit(e)}>
        {mode === 'register' && (
          <div className="field">
            <label htmlFor="displayName">Your first name</label>
            <input id="displayName" name="displayName" className="input" autoComplete="given-name" maxLength={60} required />
          </div>
        )}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="input" autoComplete="email" inputMode="email" required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className="input"
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            minLength={mode === 'register' ? 10 : 1}
            maxLength={200}
            required
          />
          {mode === 'register' && <span className="tiny muted">At least 10 characters. A short sentence works well.</span>}
        </div>
        {error && (
          <p role="alert" className="small" style={{ color: 'var(--bad)', margin: 0 }}>
            {error}
          </p>
        )}
        <button type="submit" className="btn primary block" disabled={busy || !online}>
          {busy ? 'One moment…' : mode === 'register' ? 'Create account' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
