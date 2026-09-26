import {
  evaluateAnswer,
  evaluateFreeResponse,
  evaluateOrder,
  limitCorrections,
  type AnswerResult,
  type Correction,
  type Exercise,
  type Question,
  type TurnFeedback,
} from '@praat/core';
import { CheckCircle2, CircleAlert, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useApp } from '../lib/store';
import { AudioButton } from './AudioButton';
import { FeedbackCard } from './FeedbackCard';
import { SpeakOrType, type Answer } from './SpeakOrType';
import { Nl } from './ui';

export interface ExerciseOutcome {
  exercise: Exercise;
  score: number;
  correct: boolean;
  /** Free responses: what the learner said, for utterance and diary events. */
  answer?: Answer;
  corrections?: Correction[];
}

function shuffled<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    const j = Math.abs(h) % (i + 1);
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  // Never show the answer already in order.
  if (out.every((v, i) => v === items[i]) && out.length > 1) out.push(out.shift()!);
  return out;
}

function Verdict({ result, expected }: { result: AnswerResult; expected: string }) {
  const icon =
    result.verdict === 'correct' ? (
      <CheckCircle2 size={18} color="var(--ok)" />
    ) : result.verdict === 'almost' ? (
      <CircleAlert size={18} color="var(--warn)" />
    ) : (
      <XCircle size={18} color="var(--bad)" />
    );
  const text = result.verdict === 'correct' ? 'Correct' : result.verdict === 'almost' ? 'Almost' : 'Not quite';
  return (
    <div
      className={`feedback ${result.verdict === 'correct' ? 'ok' : result.verdict === 'almost' ? 'warn' : 'bad'}`}
      aria-live="polite"
    >
      <div className="head">
        {icon} {text}
      </div>
      {result.note && <p className="small">{result.note}</p>}
      {result.verdict !== 'correct' && (
        <div className="row">
          <Nl className="fix">{expected}</Nl>
          <AudioButton text={expected} id={`expected-${expected}`} />
        </div>
      )}
    </div>
  );
}

interface Props {
  exercise: Exercise;
  onDone: (outcome: ExerciseOutcome) => void;
  continueLabel?: string;
}

/** Renders any exercise type; the learner checks, sees feedback, then continues. */
export function ExerciseView({ exercise, onDone, continueLabel = 'Continue' }: Props) {
  const { profile } = useApp();
  const [outcome, setOutcome] = useState<ExerciseOutcome | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [feedback, setFeedback] = useState<{ feedback: TurnFeedback; achieved: boolean } | null>(null);
  const [built, setBuilt] = useState<number[]>([]);
  const [chosen, setChosen] = useState<number | null>(null);
  const tiles = useMemo(() => (exercise.type === 'order' ? shuffled(exercise.words, exercise.id) : []), [exercise]);

  const finishAnswer = (r: AnswerResult, extra: Partial<ExerciseOutcome> = {}) => {
    setResult(r);
    setOutcome({ exercise, score: r.score, correct: r.verdict !== 'incorrect', ...extra });
  };

  const done = outcome && (
    <div className="bottom-actions">
      <button type="button" className="btn primary block" onClick={() => onDone(outcome)} autoFocus>
        {continueLabel}
      </button>
    </div>
  );

  switch (exercise.type) {
    case 'translate':
      return (
        <div className="stack">
          <p className="muted small">Say it in Dutch</p>
          <p className="big-nl" style={{ fontWeight: 600 }}>
            {exercise.prompt}
          </p>
          {exercise.hint && !outcome && <p className="small muted">{exercise.hint}</p>}
          {!outcome && (
            <SpeakOrType
              promptKey={exercise.id}
              onSubmit={(a) => finishAnswer(evaluateAnswer(a.text, exercise.accept), { answer: a })}
            />
          )}
          {result && <Verdict result={result} expected={result.closest} />}
          {done}
        </div>
      );

    case 'fill': {
      const [before, after] = exercise.sentence.split('___');
      return (
        <div className="stack">
          <p className="muted small">Fill the gap</p>
          <p className="big-nl" lang="nl">
            {before}
            <span style={{ borderBottom: '2px solid var(--brand)', padding: '0 12px' }}>{outcome ? result?.closest : ' '}</span>
            {after}
          </p>
          <p className="muted">{exercise.en}</p>
          {!outcome && (
            <SpeakOrType
              promptKey={exercise.id}
              placeholder="Type the missing word(s)"
              onSubmit={(a) => finishAnswer(evaluateAnswer(a.text, exercise.accept))}
            />
          )}
          {result && <Verdict result={result} expected={result.closest} />}
          {done}
        </div>
      );
    }

    case 'order':
      return (
        <div className="stack">
          <p className="muted small">Put the words in order</p>
          <p style={{ fontWeight: 600 }}>{exercise.en}</p>
          <div className="answer-line" lang="nl" aria-label="Your sentence">
            {built.map((index, pos) => (
              <button
                key={`${index}-${pos}`}
                type="button"
                className="tile placed"
                disabled={!!outcome}
                onClick={() => setBuilt(built.filter((_, p) => p !== pos))}
              >
                {tiles[index]}
              </button>
            ))}
          </div>
          <div className="tile-bank" lang="nl" aria-label="Words">
            {tiles.map((word, index) =>
              built.includes(index) ? null : (
                <button
                  key={`${word}-${index}`}
                  type="button"
                  className="tile"
                  disabled={!!outcome}
                  onClick={() => setBuilt([...built, index])}
                >
                  {word}
                </button>
              ),
            )}
          </div>
          {!outcome && (
            <button
              type="button"
              className="btn primary block"
              disabled={built.length !== tiles.length}
              onClick={() =>
                finishAnswer(
                  evaluateOrder(
                    built.map((i) => tiles[i]!),
                    exercise.words,
                    exercise.accept,
                  ),
                )
              }
            >
              Check
            </button>
          )}
          {result && <Verdict result={result} expected={exercise.words.join(' ')} />}
          {exercise.hint && outcome && <p className="small muted">{exercise.hint}</p>}
          {done}
        </div>
      );

    case 'choose':
      return (
        <div className="stack">
          <p className="big-nl" lang="nl" style={{ fontSize: '1.2rem' }}>
            {exercise.prompt}
          </p>
          <div className="stack" role="radiogroup" aria-label="Options">
            {exercise.options.map((option, i) => {
              const state = outcome ? (i === exercise.answer ? ' correct' : i === chosen ? ' wrong' : '') : '';
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={chosen === i}
                  className={`choice${state}`}
                  lang="nl"
                  disabled={!!outcome}
                  onClick={() => {
                    setChosen(i);
                    const correct = i === exercise.answer;
                    setOutcome({ exercise, score: correct ? 1 : 0, correct });
                  }}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {outcome && exercise.explanation && <p className="small">{exercise.explanation}</p>}
          {done}
        </div>
      );

    case 'dictation':
      return (
        <div className="stack">
          <p className="muted small">Listen and type what you hear</p>
          <div className="row">
            <AudioButton text={exercise.nl} id={`dict-${exercise.id}`} label="Play the sentence" />
            <AudioButton text={exercise.nl} id={`dict-slow-${exercise.id}`} label="Play slowly" slow />
            <span className="small muted">normal · slow</span>
          </div>
          {!outcome && (
            <SpeakOrType
              promptKey={exercise.id}
              placeholder="Type what you hear"
              onSubmit={(a) => finishAnswer(evaluateAnswer(a.text, [exercise.nl]))}
            />
          )}
          {result && (
            <>
              <Verdict result={result} expected={exercise.nl} />
              <p className="muted small">{exercise.en}</p>
            </>
          )}
          {done}
        </div>
      );

    case 'respond':
      return (
        <div className="stack">
          <p className="muted small">Respond in Dutch</p>
          <p style={{ fontWeight: 600 }}>{exercise.situation}</p>
          {exercise.npc && (
            <div className="card flat row">
              <AudioButton text={exercise.npc.nl} id={`npc-${exercise.id}`} />
              <div className="grow">
                <Nl>{exercise.npc.nl}</Nl>
                <div className="small muted">{exercise.npc.en}</div>
              </div>
            </div>
          )}
          {!outcome && (
            <SpeakOrType
              promptKey={exercise.id}
              hint={exercise.hint}
              onSubmit={(a) => {
                const r = evaluateFreeResponse(a.text, {
                  intents: exercise.intents,
                  modelAnswers: exercise.modelAnswers,
                  ...(exercise.register ? { register: exercise.register } : {}),
                });
                const corrections = limitCorrections(r.corrections, profile.correctionStyle);
                setFeedback({ feedback: { ...r.feedback, corrections }, achieved: r.achieved });
                setOutcome({ exercise, score: r.score, correct: r.achieved, answer: a, corrections });
              }}
            />
          )}
          {feedback && (
            <>
              <FeedbackCard feedback={feedback.feedback} achieved={feedback.achieved} />
              <div className="card flat">
                <div className="small muted">Model answer</div>
                <div className="row">
                  <Nl>{exercise.modelAnswers[0]}</Nl>
                  <AudioButton text={exercise.modelAnswers[0]!} id={`model-${exercise.id}`} />
                </div>
              </div>
            </>
          )}
          {done}
        </div>
      );
  }
}

/** Comprehension question (listening). */
export function QuestionView({ question, onAnswer }: { question: Question; onAnswer: (correct: boolean) => void }) {
  const [chosen, setChosen] = useState<number | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);

  if (question.type === 'choice') {
    const answered = chosen !== null;
    return (
      <fieldset className="stack" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ fontWeight: 600, marginBottom: 8 }}>{question.prompt}</legend>
        {question.options.map((option, i) => (
          <button
            key={option}
            type="button"
            className={`choice${answered ? (i === question.answer ? ' correct' : i === chosen ? ' wrong' : '') : ''}`}
            disabled={answered}
            aria-pressed={chosen === i}
            onClick={() => {
              setChosen(i);
              onAnswer(i === question.answer);
            }}
          >
            {option}
          </button>
        ))}
        {answered && question.explanation && <p className="small">{question.explanation}</p>}
      </fieldset>
    );
  }

  return (
    <div className="stack">
      <p style={{ fontWeight: 600, margin: 0 }}>{question.prompt}</p>
      {!result ? (
        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault();
            const value = new FormData(e.currentTarget).get('answer')?.toString() ?? '';
            if (!value.trim()) return;
            const r = evaluateAnswer(value, question.accept);
            setResult(r);
            onAnswer(r.verdict !== 'incorrect');
          }}
        >
          <input className="input grow" name="answer" aria-label={question.prompt} autoComplete="off" />
          <button className="btn primary" type="submit">
            Check
          </button>
        </form>
      ) : (
        <Verdict result={result} expected={result.closest} />
      )}
      {result && question.explanation && <p className="small">{question.explanation}</p>}
    </div>
  );
}
