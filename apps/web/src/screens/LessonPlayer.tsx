import { getLesson } from '@praat/content';
import {
  createEvent,
  evaluateFreeResponse,
  limitCorrections,
  turnEvents,
  type Exercise,
  type LearningEvent,
  type Lesson,
  type LessonStep,
  type Skill,
  type TurnFeedback,
} from '@praat/core';
import { Bookmark, BookmarkCheck, Eye, EyeOff, Play, Square } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { AudioButton } from '../components/AudioButton';
import { ExerciseView, QuestionView, type ExerciseOutcome } from '../components/ExerciseView';
import { FeedbackCard } from '../components/FeedbackCard';
import { SayIt } from '../components/SayIt';
import { SpeakOrType, type Answer } from '../components/SpeakOrType';
import { Empty, Header, Nl, ProgressBar } from '../components/ui';
import { api } from '../lib/api';
import { useVoice } from '../lib/hooks';
import { speakSequence, stopSpeaking, useSpeakingKey } from '../lib/speech';
import { record, useApp } from '../lib/store';

type PlayerStep = LessonStep | 'summary';
const STEPS: PlayerStep[] = [
  'situation',
  'vocabulary',
  'pronunciation',
  'listening',
  'grammar',
  'speaking',
  'culture',
  'review',
  'summary',
];
const STEP_TITLES: Record<PlayerStep, string> = {
  situation: 'The situation',
  vocabulary: 'Words in context',
  pronunciation: 'Pronunciation',
  listening: 'Listening challenge',
  grammar: 'How it works',
  speaking: 'Your turn to speak',
  culture: 'Culture',
  review: 'Review',
  summary: 'What you can do now',
};

const DEFAULT_SKILL: Record<Exercise['type'], Skill> = {
  translate: 'vocabulary',
  fill: 'grammar',
  order: 'grammar',
  choose: 'grammar',
  respond: 'speaking',
  dictation: 'listening',
};

/** Record the evidence from an exercise (skill model, drill stats, diary). */
export function recordExercise(outcome: ExerciseOutcome, level: Lesson['level']) {
  const { exercise } = outcome;
  const events: LearningEvent[] = [
    createEvent('exercise.attempted', {
      exerciseId: exercise.id,
      skill: exercise.skill ?? DEFAULT_SKILL[exercise.type],
      level,
      score: Math.min(1, Math.max(0, outcome.score)),
      ...(exercise.patternId ? { patternId: exercise.patternId } : {}),
    }),
  ];
  if (outcome.answer && exercise.type === 'respond') {
    events.push(
      ...turnEvents({
        mode: 'lesson',
        level,
        text: outcome.answer.text,
        inputMode: outcome.answer.inputMode,
        latencyMs: outcome.answer.latencyMs,
        corrections: outcome.corrections ?? [],
      }),
    );
  }
  record(events);
}

function Dialogue({ lines, id }: { lines: Lesson['situation']['dialogue']; id: string }) {
  const voice = useVoice();
  const [shown, setShown] = useState<Set<number>>(new Set());
  const [current, setCurrent] = useState(-1);
  const playing = useSpeakingKey() === id;
  const speakers = [...new Set(lines.map((l) => l.speaker))];

  const playAll = (slow: boolean) => {
    if (playing || current >= 0) {
      stopSpeaking();
      setCurrent(-1);
      return;
    }
    void speakSequence(
      lines.map((l) => ({ text: l.nl, speaker: speakers.indexOf(l.speaker) })),
      { ...voice, rate: (voice.rate ?? 1) * (slow ? 0.7 : 1) },
      id,
      setCurrent,
    );
  };

  return (
    <div className="stack">
      <div className="row">
        <button type="button" className="btn small" onClick={() => playAll(false)}>
          {current >= 0 ? <Square size={16} /> : <Play size={16} />} {current >= 0 ? 'Stop' : 'Play all'}
        </button>
        <button type="button" className="btn small" onClick={() => playAll(true)} disabled={current >= 0}>
          Slowly
        </button>
      </div>
      <div className="chat">
        {lines.map((line, i) => {
          const learnerSide = speakers.indexOf(line.speaker) % 2 === 1;
          return (
            <div
              key={i}
              className="bubble character"
              style={{
                alignSelf: learnerSide ? 'flex-end' : 'flex-start',
                outline: current === i ? '2px solid var(--accent)' : undefined,
              }}
            >
              <div className="tiny muted">{line.speaker}</div>
              <Nl>{line.nl}</Nl>
              <div className="actions">
                <AudioButton text={line.nl} id={`${id}-${i}`} speaker={speakers.indexOf(line.speaker)} />
                <button
                  type="button"
                  className="btn ghost small"
                  aria-pressed={shown.has(i)}
                  onClick={() => {
                    const next = new Set(shown);
                    if (next.has(i)) next.delete(i);
                    else next.add(i);
                    setShown(next);
                  }}
                >
                  {shown.has(i) ? <EyeOff size={14} /> : <Eye size={14} />} English
                </button>
              </div>
              {shown.has(i) && <div className="translation">{line.en}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function LessonPlayer() {
  const { lessonId = '' } = useParams();
  const lesson = getLesson(lessonId);
  const navigate = useNavigate();
  const { state, session, online, profile } = useApp();
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState<Set<string>>(() => new Set(lesson?.vocabulary.map((v) => v.id) ?? []));
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [transcript, setTranscript] = useState(false);
  const [speech, setSpeech] = useState<{ feedback: TurnFeedback; achieved: boolean; source: string } | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);

  if (!lesson) {
    return (
      <>
        <Header title="Lesson not found" back="/learn" />
        <Empty title="This lesson doesn't exist (any more)." action={<Link to="/learn">Back to all lessons</Link>} />
      </>
    );
  }

  const step = STEPS[index]!;
  const completed = new Set(state.lessons[lesson.id]?.stepsCompleted ?? []);

  const nextStep = () => {
    if (step !== 'summary') record(createEvent('lesson.step_completed', { lessonId: lesson.id, step }));
    if (step === 'vocabulary') {
      record([...saved].map((itemId) => createEvent('card.added', { itemId, source: 'lesson' as const })));
    }
    setIndex((i) => Math.min(STEPS.length - 1, i + 1));
    window.scrollTo({ top: 0 });
  };

  const finish = () => {
    const score = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 1;
    record(createEvent('lesson.completed', { lessonId: lesson.id, level: lesson.level, score: Math.round(score * 100) / 100 }));
    navigate('/learn');
  };

  const evaluateSpeaking = async (answer: Answer) => {
    setEvaluating(true);
    const task = {
      intents: lesson.speaking.mustInclude,
      modelAnswers: lesson.speaking.modelAnswers,
      ...(lesson.speaking.register ? { register: lesson.speaking.register } : {}),
    };
    const local = evaluateFreeResponse(answer.text, task);
    let feedback: TurnFeedback = { ...local.feedback, corrections: limitCorrections(local.corrections, profile.correctionStyle) };
    let achieved = local.achieved;
    let source = 'offline';
    let score = local.score;
    if (session && online) {
      try {
        const remote = await api.evaluate({
          text: answer.text,
          level: lesson.level,
          task: {
            prompt: lesson.speaking.prompt,
            mustInclude: lesson.speaking.mustInclude,
            modelAnswers: lesson.speaking.modelAnswers,
            ...(lesson.speaking.register ? { register: lesson.speaking.register } : {}),
          },
        });
        feedback = remote.feedback;
        achieved = remote.achieved;
        source = remote.source;
        score = remote.score;
      } catch {
        // Keep the on-device evaluation.
      }
    }
    setSpeech({ feedback, achieved, source });
    setScores((s) => [...s, score]);
    record(
      turnEvents({
        mode: 'lesson',
        level: lesson.level,
        text: answer.text,
        inputMode: answer.inputMode,
        latencyMs: answer.latencyMs,
        corrections: feedback.corrections,
      }),
    );
    setEvaluating(false);
  };

  const listeningDone = Object.keys(answers).length >= lesson.listening.questions.length;
  const reviewExercise = lesson.review[reviewIndex];

  return (
    <div className="stack">
      <Header title={STEP_TITLES[step]} subtitle={`${lesson.level} · ${lesson.title}`} back="/learn" close />
      <ProgressBar value={index / (STEPS.length - 1)} label={`Step ${index + 1} of ${STEPS.length}`} />

      {step === 'situation' && (
        <section className="stack">
          <p>{lesson.situation.setting}</p>
          <Dialogue lines={lesson.situation.dialogue} id={`dialogue-${lesson.id}`} />
        </section>
      )}

      {step === 'vocabulary' && (
        <section className="stack">
          <p className="muted small">
            Phrases you just heard. Saved ones come back in your spaced review, right before you'd forget them.
          </p>
          {lesson.vocabulary.map((phrase) => (
            <article key={phrase.id} className="card stack" style={{ gap: 6 }}>
              <div className="row">
                <AudioButton text={phrase.nl} id={phrase.id} />
                <div className="grow">
                  <Nl className="big-nl">
                    {phrase.article && <span className="muted">{phrase.article} </span>}
                    {phrase.nl}
                  </Nl>
                  <div className="muted">{phrase.en}</div>
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  aria-pressed={saved.has(phrase.id)}
                  aria-label={saved.has(phrase.id) ? `Remove ${phrase.nl} from review` : `Save ${phrase.nl} for review`}
                  onClick={() => {
                    const next = new Set(saved);
                    if (next.has(phrase.id)) next.delete(phrase.id);
                    else next.add(phrase.id);
                    setSaved(next);
                  }}
                >
                  {saved.has(phrase.id) ? <BookmarkCheck color="var(--brand)" /> : <Bookmark />}
                </button>
              </div>
              <div className="row small">
                <AudioButton text={phrase.example.nl} id={`${phrase.id}-ex`} />
                <div>
                  <Nl>{phrase.example.nl}</Nl>
                  <div className="muted">{phrase.example.en}</div>
                </div>
              </div>
              {phrase.note && (
                <p className="small" style={{ margin: 0 }}>
                  {phrase.note}
                </p>
              )}
            </article>
          ))}
        </section>
      )}

      {step === 'pronunciation' && (
        <section className="stack">
          <div className="card tint">
            <strong>{lesson.pronunciation.focus}</strong>
            <p style={{ margin: '4px 0 0' }}>{lesson.pronunciation.tip}</p>
          </div>
          {lesson.pronunciation.items.map((item) => (
            <SayIt key={item.nl} target={item.nl} en={item.en} hint={item.hint} level={lesson.level} />
          ))}
        </section>
      )}

      {step === 'listening' && (
        <section className="stack">
          <p>{lesson.listening.intro}</p>
          <p className="small muted">Listen first — the transcript comes after the questions.</p>
          <ListeningLines lines={lesson.listening.lines} id={`listen-${lesson.id}`} showText={transcript} />
          {lesson.listening.questions.map((q, i) => (
            <div key={i} className="card">
              <QuestionView question={q} onAnswer={(ok) => setAnswers((a) => ({ ...a, [i]: ok }))} />
            </div>
          ))}
          {(listeningDone || transcript) && (
            <button type="button" className="btn" onClick={() => setTranscript(!transcript)}>
              {transcript ? 'Hide transcript' : 'Show transcript'}
            </button>
          )}
        </section>
      )}

      {step === 'grammar' && (
        <section className="stack">
          <h2>{lesson.grammar.title}</h2>
          <p style={{ whiteSpace: 'pre-line' }}>{lesson.grammar.explanation}</p>
          <ul className="list">
            {lesson.grammar.examples.map((ex) => (
              <li key={ex.nl} className="list-item" style={{ cursor: 'default' }}>
                <AudioButton text={ex.nl} id={`gram-${ex.nl}`} />
                <div className="grow">
                  <Nl>{highlight(ex.nl, ex.highlight)}</Nl>
                  <div className="small muted">{ex.en}</div>
                </div>
              </li>
            ))}
          </ul>
          {lesson.grammar.commonMistake && (
            <div className="card accent stack" style={{ gap: 4 }}>
              <strong>Common mistake</strong>
              <div>
                ✗ <Nl className="strike">{lesson.grammar.commonMistake.wrong}</Nl>
              </div>
              <div>
                ✓ <Nl className="fix">{lesson.grammar.commonMistake.right}</Nl>
              </div>
              <p className="small" style={{ margin: 0 }}>
                {lesson.grammar.commonMistake.why}
              </p>
            </div>
          )}
        </section>
      )}

      {step === 'speaking' && (
        <section className="stack">
          <div className="card tint">
            <strong>{lesson.speaking.prompt}</strong>
            {lesson.speaking.context && (
              <p className="small" style={{ margin: '4px 0 0' }}>
                {lesson.speaking.context}
              </p>
            )}
          </div>
          {!speech ? (
            <SpeakOrType
              onSubmit={(a) => void evaluateSpeaking(a)}
              hint={lesson.speaking.hints[0]}
              disabled={evaluating}
              submitLabel={evaluating ? 'Checking…' : 'Check'}
            />
          ) : (
            <>
              <FeedbackCard feedback={speech.feedback} achieved={speech.achieved} />
              <div className="card flat stack" style={{ gap: 6 }}>
                <div className="small muted">How a Dutch speaker might say it</div>
                {lesson.speaking.modelAnswers.map((m) => (
                  <div className="row" key={m}>
                    <AudioButton text={m} id={`model-${m}`} />
                    <Nl>{m}</Nl>
                  </div>
                ))}
              </div>
              <button type="button" className="btn ghost" onClick={() => setSpeech(null)}>
                Try again
              </button>
            </>
          )}
        </section>
      )}

      {step === 'culture' && (
        <section className="stack">
          <h2>{lesson.culture.title}</h2>
          <p style={{ whiteSpace: 'pre-line' }}>{lesson.culture.body}</p>
        </section>
      )}

      {step === 'review' && reviewExercise && (
        <section className="stack">
          <p className="small muted">
            Exercise {reviewIndex + 1} of {lesson.review.length}
          </p>
          <ExerciseView
            key={reviewExercise.id}
            exercise={reviewExercise}
            continueLabel={reviewIndex + 1 < lesson.review.length ? 'Next' : 'Continue'}
            onDone={(outcome) => {
              recordExercise(outcome, lesson.level);
              setScores((s) => [...s, outcome.score]);
              if (reviewIndex + 1 < lesson.review.length) setReviewIndex(reviewIndex + 1);
              else nextStep();
            }}
          />
        </section>
      )}

      {step === 'summary' && (
        <section className="stack">
          <div className="card tint stack">
            <div className="section-title">You can now</div>
            <p className="big-nl" style={{ fontSize: '1.15rem', margin: 0 }}>
              {lesson.canDo}
            </p>
          </div>
          <div className="kv">
            <div className="stat">
              <div className="value">{saved.size}</div>
              <div className="label">phrases in your review</div>
            </div>
            <div className="stat">
              <div className="value">
                {scores.length ? `${Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100)}%` : '—'}
              </div>
              <div className="label">exercise score</div>
            </div>
          </div>
          <p className="small muted">
            Next: use it for real. A short conversation now makes it stick far better than another exercise.
          </p>
          <Link to="/talk/tutor" className="btn block">
            Practise in a conversation
          </Link>
        </section>
      )}

      <div className="bottom-actions">
        {step === 'summary' ? (
          <button type="button" className="btn primary block" onClick={finish}>
            Finish lesson
          </button>
        ) : step !== 'review' ? (
          <button
            type="button"
            className="btn primary block"
            onClick={nextStep}
            disabled={(step === 'speaking' && evaluating) || (step === 'listening' && !listeningDone)}
          >
            {step === 'speaking' && !speech ? 'Skip' : 'Continue'}
          </button>
        ) : null}
        {completed.size > 0 && step === 'situation' && (
          <p className="tiny muted center" style={{ margin: 0 }}>
            {completed.size} of 8 parts done before
          </p>
        )}
      </div>
    </div>
  );
}

function highlight(text: string, part?: string) {
  if (!part) return text;
  const i = text.toLowerCase().indexOf(part.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + part.length)}</mark>
      {text.slice(i + part.length)}
    </>
  );
}

export function ListeningLines({
  lines,
  id,
  showText,
  slow,
}: {
  lines: { speaker: string; nl: string; en: string }[];
  id: string;
  showText: boolean;
  slow?: boolean;
}) {
  const voice = useVoice();
  const [current, setCurrent] = useState(-1);
  const speakers = [...new Set(lines.map((l) => l.speaker))];
  const play = () => {
    if (current >= 0) {
      stopSpeaking();
      setCurrent(-1);
      return;
    }
    void speakSequence(
      lines.map((l) => ({ text: l.nl, speaker: speakers.indexOf(l.speaker) })),
      { ...voice, rate: (voice.rate ?? 1) * (slow ? 0.7 : 1) },
      id,
      setCurrent,
    );
  };
  return (
    <div className="stack">
      <button type="button" className="btn accent block" onClick={play}>
        {current >= 0 ? <Square size={18} /> : <Play size={18} />}{' '}
        {current >= 0 ? `Playing ${current + 1}/${lines.length} — stop` : 'Play the audio'}
      </button>
      {showText && (
        <ol className="list" style={{ listStyle: 'none' }}>
          {lines.map((line, i) => (
            <li
              key={i}
              className="list-item"
              style={{ cursor: 'default', outline: current === i ? '2px solid var(--accent)' : undefined }}
            >
              <AudioButton text={line.nl} id={`${id}-line-${i}`} speaker={speakers.indexOf(line.speaker)} />
              <div className="grow">
                <div className="tiny muted">{line.speaker}</div>
                <Nl>{line.nl}</Nl>
                <div className="small muted">{line.en}</div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
