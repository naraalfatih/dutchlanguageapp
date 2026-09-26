import { createEvent, scorePronunciation, soundOutcomes, type Level, type PronunciationResult } from '@praat/core';
import { Circle, Mic, Play, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { record, useApp } from '../lib/store';
import { listen, recorderSupported, startRecording, sttSupported, type Listener, type Recording } from '../lib/speech';
import { AudioButton } from './AudioButton';
import { Nl } from './ui';

interface Props {
  target: string;
  en?: string | undefined;
  hint?: string | undefined;
  level: Level;
  onResult?: (result: PronunciationResult) => void;
}

/**
 * Listen → say it → feedback, per word. The phone's recogniser is the judge: if it
 * understood you, most Dutch listeners will too. Shadowing (record yourself and compare
 * with the model) works even where speech recognition is unavailable.
 */
export function SayIt({ target, en, hint, level, onResult }: Props) {
  const { profile } = useApp();
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState<Recording | null>(null);
  const [level01, setLevel01] = useState(0);
  const [clip, setClip] = useState<string | null>(null);
  const listener = useRef<Listener | null>(null);

  useEffect(() => {
    setResult(null);
    setError(null);
    setClip(null);
  }, [target]);
  useEffect(() => () => listener.current?.abort(), []);
  useEffect(() => () => void (clip && URL.revokeObjectURL(clip)), [clip]);

  const say = () => {
    if (listening) return listener.current?.stop();
    setError(null);
    const l = listen({
      region: profile.region,
      continuous: false,
      onResult: (r) => {
        setListening(false);
        if (!r) return;
        const scored = scorePronunciation(target, r.alternatives.length ? r.alternatives : [r.transcript]);
        setResult(scored);
        onResult?.(scored);
        record(
          createEvent('speech.attempted', {
            target: target.slice(0, 500),
            transcript: scored.transcript.slice(0, 500),
            score: scored.score,
            level,
            sounds: soundOutcomes(scored).slice(0, 50),
          }),
        );
      },
      onError: setError,
    });
    if (l) {
      listener.current = l;
      setListening(true);
    }
  };

  const toggleRecording = async () => {
    if (recording) {
      const url = await recording.stop();
      setRecording(null);
      setLevel01(0);
      if (url) setClip(url);
      return;
    }
    try {
      setRecording(await startRecording(setLevel01));
    } catch {
      setError('Microphone access is blocked. Allow it in your browser settings to record yourself.');
    }
  };

  return (
    <div className="card stack">
      <div className="row">
        <AudioButton text={target} id={`say-${target}`} />
        <div className="grow">
          <Nl className="big-nl">{target}</Nl>
          {en && <div className="muted small">{en}</div>}
          {hint && <div className="small">{hint}</div>}
        </div>
      </div>

      <div className="row wrap">
        {sttSupported() && (
          <button type="button" className={`btn ${listening ? 'danger' : 'accent'}`} onClick={say} aria-pressed={listening}>
            {listening ? <Square size={18} /> : <Mic size={18} />} {listening ? 'Listening… tap to stop' : 'Say it'}
          </button>
        )}
        {recorderSupported() && (
          <button type="button" className="btn" onClick={() => void toggleRecording()} aria-pressed={!!recording}>
            {recording ? <Square size={16} /> : <Circle size={16} color="var(--bad)" />} {recording ? 'Stop' : 'Record yourself'}
            {recording && (
              <span
                aria-hidden
                style={{ width: 40, height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}
              >
                <span
                  style={{ display: 'block', height: '100%', width: `${Math.round(level01 * 100)}%`, background: 'var(--bad)' }}
                />
              </span>
            )}
          </button>
        )}
        {clip && (
          <button type="button" className="btn" onClick={() => void new Audio(clip).play()}>
            <Play size={16} /> Play mine
          </button>
        )}
      </div>

      {error && (
        <p className="small" role="alert" style={{ color: 'var(--bad)', margin: 0 }}>
          {error}
        </p>
      )}

      {result && (
        <div className="stack" aria-live="polite">
          <div lang="nl">
            {result.words.map((w, i) => (
              <span key={`${w.word}-${i}`} className={`word ${w.status}`} title={w.heard ? `heard: ${w.heard}` : 'not heard'}>
                {w.word}
              </span>
            ))}
          </div>
          <div className="small">
            {result.score >= 0.85
              ? 'Clear — a Dutch listener would understand you.'
              : result.score >= 0.6
                ? 'Mostly clear. Listen again to the orange and red words and try once more.'
                : 'Hard to understand yet. Play it slowly (hold ▶), then try again in small pieces.'}
          </div>
          <div className="tiny muted">Heard: “{result.transcript}”</div>
        </div>
      )}
    </div>
  );
}
