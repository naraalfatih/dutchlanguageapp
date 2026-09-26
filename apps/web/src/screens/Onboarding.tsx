import { evaluateFreeResponse, turnEvents, type Goal, type Level } from '@praat/core';
import { Briefcase, GraduationCap, Heart, Home as HomeIcon, Landmark, Mic, Plane } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { AudioButton } from '../components/AudioButton';
import { FeedbackCard } from '../components/FeedbackCard';
import { SpeakOrType, type Answer } from '../components/SpeakOrType';
import { Nl, ProgressBar } from '../components/ui';
import { useDocumentTitle } from '../lib/hooks';
import { record, updateProfile, useApp } from '../lib/store';
import { sttSupported } from '../lib/speech';

const GOALS: { id: Goal; label: string; icon: ReactNode }[] = [
  { id: 'moving', label: 'Moving / living here', icon: <HomeIcon size={20} /> },
  { id: 'work', label: 'Work', icon: <Briefcase size={20} /> },
  { id: 'study', label: 'Study', icon: <GraduationCap size={20} /> },
  { id: 'travel', label: 'Travel', icon: <Plane size={20} /> },
  { id: 'partner', label: 'Partner & family', icon: <Heart size={20} /> },
  { id: 'culture', label: 'Culture', icon: <Landmark size={20} /> },
];

const LEVELS: { level: Level; label: string; detail: string }[] = [
  { level: 'A0', label: 'Brand new', detail: 'I know (almost) no Dutch.' },
  { level: 'A1', label: 'I know some words', detail: 'Greetings, numbers, a few phrases.' },
  { level: 'A2', label: 'Simple conversations', detail: 'I can handle shops and small talk, slowly.' },
  { level: 'B1', label: 'I get by', detail: 'Everyday life works; I hesitate and make mistakes.' },
  { level: 'B2', label: 'Fairly fluent', detail: 'I want to sound natural and understand everything.' },
];

const MINUTES = [5, 10, 20, 30] as const;
const STEPS = 6;

const NAME_INTENT = [{ id: 'name', description: 'Say your name', anyOf: [['heet|naam is|ik ben']] }];

export function Onboarding() {
  const navigate = useNavigate();
  const { profile } = useApp();
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState<Goal[]>(profile.goals);
  const [region, setRegion] = useState(profile.region);
  const [level, setLevel] = useState<Level>(profile.level);
  const [minutes, setMinutes] = useState(profile.dailyMinutes);
  const [micResult, setMicResult] = useState<ReturnType<typeof evaluateFreeResponse> | null>(null);
  useDocumentTitle('Welcome');

  const finish = () => {
    updateProfile({ goals, region, level, dailyMinutes: minutes, onboarded: true });
    navigate('/', { replace: true });
  };

  const onMic = (answer: Answer) => {
    const result = evaluateFreeResponse(answer.text, { intents: NAME_INTENT });
    setMicResult(result);
    record(
      turnEvents({
        mode: 'lesson',
        level,
        text: answer.text,
        inputMode: answer.inputMode,
        latencyMs: answer.latencyMs,
        corrections: result.corrections,
      }),
    );
  };

  const next = () => setStep((s) => s + 1);

  return (
    <div className="stack-lg" style={{ paddingTop: 16 }}>
      {step > 0 && <ProgressBar value={step / STEPS} label="Setup progress" />}

      {step === 0 && (
        <section className="stack-lg" style={{ minHeight: '70dvh', justifyContent: 'center' }}>
          <div className="stack">
            <span className="icon-badge" style={{ width: 56, height: 56 }} aria-hidden>
              <img src="/favicon.svg" alt="" width={56} height={56} style={{ borderRadius: 14 }} />
            </span>
            <h1 style={{ fontSize: '2rem' }}>Learn to actually speak Dutch.</h1>
            <p className="muted">
              Real conversations, the Dutch people actually use, and the culture behind it. Two minutes to set up — no account
              needed.
            </p>
          </div>
          <div className="stack">
            <button type="button" className="btn primary block" onClick={next}>
              Start
            </button>
            <Link to="/account?next=/" className="btn ghost block">
              I have an account
            </Link>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="stack">
          <h1>Why are you learning Dutch?</h1>
          <p className="muted">Pick all that apply. We use this to choose real-life situations for you.</p>
          <div className="choice-grid">
            {GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                className="choice"
                aria-pressed={goals.includes(g.id)}
                onClick={() => setGoals(goals.includes(g.id) ? goals.filter((x) => x !== g.id) : [...goals, g.id])}
              >
                {g.icon}
                {g.label}
              </button>
            ))}
          </div>
          <div className="bottom-actions">
            <button type="button" className="btn primary block" onClick={next}>
              {goals.length ? 'Continue' : 'Skip'}
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="stack">
          <h1>Where will you use your Dutch?</h1>
          <p className="muted">This sets the accent you hear, greetings and regional notes. You can change it later.</p>
          {(
            [
              { id: 'nl', label: 'The Netherlands', detail: "Nederlands — 'Hoi', 'lekker', 'gezellig'" },
              { id: 'be', label: 'Flanders (Belgium)', detail: "Vlaams — 'Hallo', 'goesting', 'amai'" },
            ] as const
          ).map((r) => (
            <button key={r.id} type="button" className="choice" aria-pressed={region === r.id} onClick={() => setRegion(r.id)}>
              <div>
                <div>{r.label}</div>
                <div className="small muted">{r.detail}</div>
              </div>
            </button>
          ))}
          <div className="bottom-actions">
            <button type="button" className="btn primary block" onClick={next}>
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="stack">
          <h1>How much Dutch do you know?</h1>
          <p className="muted">A rough guess is fine: your level adjusts as you practise.</p>
          {LEVELS.map((l) => (
            <button
              key={l.level}
              type="button"
              className="choice"
              aria-pressed={level === l.level}
              onClick={() => setLevel(l.level)}
            >
              <div>
                <div>{l.label}</div>
                <div className="small muted">{l.detail}</div>
              </div>
            </button>
          ))}
          <div className="bottom-actions">
            <button type="button" className="btn primary block" onClick={next}>
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="stack">
          <h1>How much time per day?</h1>
          <p className="muted">This sizes your daily plan. There are no streaks to protect — a missed day is fine.</p>
          <div className="choice-grid">
            {MINUTES.map((m) => (
              <button key={m} type="button" className="choice" aria-pressed={minutes === m} onClick={() => setMinutes(m)}>
                {m} min
              </button>
            ))}
          </div>
          <div className="bottom-actions">
            <button type="button" className="btn primary block" onClick={next}>
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 5 && (
        <section className="stack">
          <h1>Your first Dutch sentence</h1>
          <p className="muted">
            Speaking is the point, so let's start now. {sttSupported() ? 'Tap the microphone and say' : 'Type'} your name in
            Dutch:
          </p>
          <div className="card row">
            <AudioButton text="Hallo, ik heet Sam." />
            <Nl className="big-nl">Hallo, ik heet …</Nl>
          </div>
          {sttSupported() && (
            <p className="small muted row">
              <Mic size={16} aria-hidden /> We only listen while the microphone button is on. Your browser turns your speech into
              text (Chrome uses Google's servers for this); Praat never receives or stores recordings.
            </p>
          )}
          {!micResult ? (
            <SpeakOrType onSubmit={onMic} hint="Hallo, ik heet" submitLabel="Check" />
          ) : (
            <FeedbackCard feedback={micResult.feedback} achieved={micResult.achieved} linkPatterns={false} />
          )}
          <div className="bottom-actions">
            {micResult ? (
              <button type="button" className="btn primary block" onClick={next}>
                {micResult.achieved ? 'Goed zo! Continue' : 'Continue'}
              </button>
            ) : (
              <button type="button" className="btn ghost block" onClick={next}>
                Skip for now
              </button>
            )}
          </div>
        </section>
      )}

      {step === 6 && (
        <section className="stack">
          <h1>Your plan is ready</h1>
          <p className="muted">
            Every day: a real situation, a conversation to use it, and a few minutes of review so words stick. We measure one
            thing — can you communicate naturally in Dutch?
          </p>
          <div className="card tint stack">
            <div>
              <strong>{minutes} minutes a day</strong> · {region === 'be' ? 'Flemish' : 'Netherlands'} Dutch · starting at {level}
            </div>
            <div className="small">
              Your progress is saved on this device. Create an account any time to sync and to talk with the AI partner.
            </div>
          </div>
          <div className="bottom-actions">
            <button type="button" className="btn primary block" onClick={finish}>
              Let's go
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
