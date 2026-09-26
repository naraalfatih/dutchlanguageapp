import { patternTitle, type GlossaryItem, type TurnFeedback } from '@praat/core';
import { CheckCircle2, CircleAlert, MessageCircleQuestion, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { AudioButton } from './AudioButton';
import { Nl } from './ui';

interface Props {
  feedback: TurnFeedback;
  /** For tasks: did the learner achieve the communicative goal? */
  achieved?: boolean | undefined;
  /** Show links to the Mistake Diary pattern pages. */
  linkPatterns?: boolean;
}

/**
 * Communication first: first say whether the message landed, then what to fix and a more
 * natural way to say it, then one specific piece of praise.
 */
export function FeedbackCard({ feedback, achieved, linkPatterns = true }: Props) {
  const tone = achieved === false || !feedback.understood ? 'bad' : feedback.corrections.length ? 'warn' : 'ok';
  const headline =
    achieved === true
      ? 'Task done — you got your message across'
      : achieved === false
        ? 'Not quite there yet'
        : feedback.understood
          ? feedback.corrections.length
            ? 'Understood'
            : 'Understood — and correct'
          : 'Hard to understand';

  return (
    <section className={`feedback ${tone}`} aria-live="polite" aria-label="Feedback">
      <div className="head">
        {tone === 'ok' ? (
          <CheckCircle2 size={18} color="var(--ok)" />
        ) : tone === 'warn' ? (
          <CircleAlert size={18} color="var(--warn)" />
        ) : (
          <MessageCircleQuestion size={18} color="var(--bad)" />
        )}
        <span>{headline}</span>
      </div>

      {feedback.corrections.map((c, i) => (
        <div className="correction" key={`${c.patternId}-${i}`}>
          <div>
            <Nl className="strike">{c.original}</Nl>
          </div>
          <div className="row">
            <span aria-hidden>→</span>
            <Nl className="fix">{c.corrected}</Nl>
            <AudioButton text={c.corrected} id={`fix-${i}-${c.corrected}`} label="Play the correction" />
          </div>
          <p className="small" style={{ margin: '4px 0 0' }}>
            {c.explanation}
          </p>
          {linkPatterns && c.patternId !== 'other' && (
            <Link className="tiny" to={`/progress/diary/${encodeURIComponent(c.patternId)}`}>
              {patternTitle(c.patternId)} · see in your Mistake Diary
            </Link>
          )}
        </div>
      ))}

      {feedback.natural && (
        <div className="correction">
          <div className="small muted">More natural</div>
          <div className="row">
            <Nl className="fix">{feedback.natural.nl}</Nl>
            <AudioButton text={feedback.natural.nl} id={`natural-${feedback.natural.nl}`} label="Play the natural version" />
          </div>
          <div className="small muted">{feedback.natural.en}</div>
          {feedback.natural.note && (
            <p className="small" style={{ margin: '4px 0 0' }}>
              {feedback.natural.note}
            </p>
          )}
        </div>
      )}

      {feedback.praise && (
        <p className="small row" style={{ margin: '10px 0 0' }}>
          <Sparkles size={16} color="var(--accent)" aria-hidden /> {feedback.praise}
        </p>
      )}
    </section>
  );
}

export function Glossary({ items }: { items: GlossaryItem[] }) {
  if (!items.length) return null;
  return (
    <details className="disclosure small">
      <summary>Words in this reply ({items.length})</summary>
      <ul className="stack" style={{ paddingLeft: 18, margin: 0 }}>
        {items.map((g) => (
          <li key={g.term}>
            <Nl>{g.term}</Nl> — {g.meaning}
            {g.note && <span className="muted"> · {g.note}</span>}
          </li>
        ))}
      </ul>
    </details>
  );
}
