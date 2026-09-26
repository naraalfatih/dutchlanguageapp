import { Lightbulb, Mic, Send, Square } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useApp } from '../lib/store';
import { listen, sttSupported, type Listener } from '../lib/speech';

export interface Answer {
  text: string;
  inputMode: 'text' | 'voice';
  /** Time from the prompt appearing to the learner starting to answer (hesitation). */
  latencyMs: number;
}

interface Props {
  onSubmit: (answer: Answer) => void;
  placeholder?: string;
  disabled?: boolean;
  /** A Dutch starter chunk, revealed on request. */
  hint?: string | undefined;
  /** Chat composer layout (single row). */
  compact?: boolean;
  /** Changes when a new prompt is shown: resets the field and the latency clock. */
  promptKey?: string | number;
  submitLabel?: string;
}

/**
 * Answer by voice or keyboard — both always available. Voice results land in the text
 * field first, so the learner sees what was recognised before sending (a misheard word is
 * also useful pronunciation feedback) and recognition errors never become "mistakes".
 */
export function SpeakOrType({ onSubmit, placeholder, disabled, hint, compact, promptKey, submitLabel = 'Check' }: Props) {
  const { profile } = useApp();
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const [voiceUsed, setVoiceUsed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const readyAt = useRef(Date.now());
  const startedAt = useRef<number | null>(null);
  const listener = useRef<Listener | null>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const canListen = sttSupported();

  useEffect(() => {
    setText('');
    setVoiceUsed(false);
    setShowHint(false);
    setError(null);
    readyAt.current = Date.now();
    startedAt.current = null;
  }, [promptKey]);

  useEffect(() => () => listener.current?.abort(), []);

  const markStart = () => {
    startedAt.current ??= Date.now();
  };

  const toggleMic = () => {
    if (listening) {
      listener.current?.stop();
      return;
    }
    setError(null);
    markStart();
    const l = listen({
      region: profile.region,
      continuous: true,
      onInterim: (t) => setText(t),
      onResult: (result) => {
        setListening(false);
        listener.current = null;
        if (result?.transcript) {
          setText(result.transcript);
          setVoiceUsed(true);
          requestAnimationFrame(() => field.current?.focus());
        }
      },
      onError: (message) => setError(message),
    });
    if (!l) {
      setError('Speech recognition is not available here. You can type instead.');
      return;
    }
    listener.current = l;
    setListening(true);
  };

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const value = text.trim();
    if (!value || disabled) return;
    if (listening) listener.current?.stop();
    onSubmit({
      text: value,
      inputMode: voiceUsed ? 'voice' : 'text',
      latencyMs: Math.max(0, (startedAt.current ?? Date.now()) - readyAt.current),
    });
    if (compact) {
      setText('');
      setVoiceUsed(false);
      readyAt.current = Date.now();
      startedAt.current = null;
    }
  };

  const mic = canListen && (
    <button
      type="button"
      className={`mic-btn${listening ? ' listening' : ''}${compact ? '' : ' big'}`}
      onClick={toggleMic}
      disabled={disabled}
      aria-label={listening ? 'Stop recording' : 'Speak your answer'}
      aria-pressed={listening}
    >
      {listening ? <Square size={compact ? 20 : 26} /> : <Mic size={compact ? 22 : 30} />}
      {listening && <span className="ring" aria-hidden />}
    </button>
  );

  const textarea = (
    <textarea
      ref={field}
      className="textarea"
      lang="nl"
      value={text}
      rows={compact ? 1 : 3}
      placeholder={listening ? 'Luisteren… (listening)' : (placeholder ?? 'Typ of spreek in het Nederlands…')}
      aria-label="Your answer in Dutch"
      disabled={disabled}
      onChange={(e) => {
        markStart();
        setText(e.target.value);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          submit();
        }
      }}
      autoCapitalize="sentences"
      autoCorrect="off"
      spellCheck={false}
    />
  );

  const hintBlock = hint && (
    <div>
      {showHint ? (
        <p className="small">
          <span className="muted">Try starting with: </span>
          <span lang="nl" className="nl">
            {hint}
          </span>
        </p>
      ) : (
        <button type="button" className="btn ghost small" onClick={() => setShowHint(true)}>
          <Lightbulb size={16} /> Hint
        </button>
      )}
    </div>
  );

  const errorBlock = error && (
    <p className="small" role="alert" style={{ color: 'var(--bad)' }}>
      {error}
    </p>
  );

  if (compact) {
    return (
      <form className="composer stack" onSubmit={submit}>
        {errorBlock}
        {hintBlock}
        <div className="composer-row">
          {textarea}
          {text.trim() ? (
            <button
              type="submit"
              className="mic-btn"
              style={{ background: 'var(--brand)', color: 'var(--brand-ink)' }}
              aria-label="Send"
              disabled={disabled}
            >
              <Send size={22} />
            </button>
          ) : (
            mic
          )}
        </div>
      </form>
    );
  }

  return (
    <form className="stack" onSubmit={submit}>
      {mic && (
        <div className="stack center" style={{ alignItems: 'center' }}>
          {mic}
          <span className="small muted">{listening ? 'Tap to stop' : 'Tap to speak'}</span>
        </div>
      )}
      {textarea}
      {errorBlock}
      {hintBlock}
      <button type="submit" className="btn primary block" disabled={disabled || !text.trim()}>
        {submitLabel}
      </button>
    </form>
  );
}
