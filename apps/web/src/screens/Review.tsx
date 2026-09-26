import { createEvent, evaluateAnswer, isDue, previewIntervals, RATING_LABELS, type AnswerResult, type Rating } from '@praat/core';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { AudioButton } from '../components/AudioButton';
import { SpeakOrType } from '../components/SpeakOrType';
import { Empty, Header, Nl, ProgressBar } from '../components/ui';
import { cardInfo } from '../lib/content';
import { record, useApp } from '../lib/store';

const SESSION_LIMIT = 20;

/**
 * Spaced review with production first: see the meaning, say or type the Dutch, then
 * rate how it went. FSRS schedules the next review just before you'd forget.
 */
export default function Review() {
  const { state } = useApp();
  const [queue] = useState(() => {
    const now = new Date();
    return Object.values(state.cards)
      .filter((c) => isDue(c, now) && cardInfo(c.itemId))
      .sort((a, b) => a.due.localeCompare(b.due))
      .slice(0, SESSION_LIMIT)
      .map((c) => c.itemId);
  });
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState<AnswerResult | 'skipped' | null>(null);
  const [done, setDone] = useState(0);

  const itemId = queue[index];
  const info = useMemo(() => (itemId ? cardInfo(itemId) : null), [itemId]);
  const card = itemId ? state.cards[itemId] : undefined;

  if (!queue.length || !info || !card) {
    return (
      <>
        <Header title="Review" back="/practice" />
        {done ? (
          <Empty
            title={`Klaar! ${done} phrase${done === 1 ? '' : 's'} reviewed.`}
            action={
              <Link className="btn primary" to="/">
                Back to today
              </Link>
            }
          >
            Each one is now scheduled to come back right before you'd forget it.
          </Empty>
        ) : (
          <Empty
            title="Nothing to review right now"
            action={
              <Link className="btn" to="/learn">
                Go to lessons
              </Link>
            }
          >
            Phrases you save in lessons come back here at the right moment.
          </Empty>
        )}
      </>
    );
  }

  const intervals = previewIntervals(card, new Date());
  const suggested: Rating | null =
    revealed && revealed !== 'skipped' ? (revealed.verdict === 'correct' ? 3 : revealed.verdict === 'almost' ? 2 : 1) : null;

  const rate = (rating: Rating) => {
    record(createEvent('card.reviewed', { itemId: info.itemId, rating, ...(info.level ? { level: info.level } : {}) }));
    setDone((d) => d + 1);
    setRevealed(null);
    setIndex((i) => i + 1);
  };

  return (
    <div className="stack">
      <Header title="Review" subtitle={`${index + 1} of ${queue.length}`} back="/practice" close />
      <ProgressBar value={index / queue.length} label="Review progress" />

      <section className="card stack">
        <div className="small muted">Say it in Dutch</div>
        <p className="big-nl" style={{ margin: 0 }}>
          {info.en}
        </p>
        {info.example && !revealed && (
          <p className="small muted" style={{ margin: 0 }}>
            Context: {info.example.en}
          </p>
        )}
      </section>

      {!revealed ? (
        <>
          <SpeakOrType
            promptKey={info.itemId}
            onSubmit={(a) => setRevealed(evaluateAnswer(a.text, [info.nl]))}
            submitLabel="Check"
          />
          <button type="button" className="btn ghost" onClick={() => setRevealed('skipped')}>
            I don't know — show me
          </button>
        </>
      ) : (
        <section className="card stack" aria-live="polite">
          {revealed !== 'skipped' && (
            <div className={`chip ${revealed.verdict === 'correct' ? 'ok' : revealed.verdict === 'almost' ? 'warn' : 'bad'}`}>
              {revealed.verdict === 'correct' ? 'Correct' : revealed.verdict === 'almost' ? 'Almost' : 'Not quite'}
            </div>
          )}
          <div className="row">
            <AudioButton text={info.nl} id={`card-${info.itemId}`} />
            <Nl className="big-nl">
              {info.article && <span className="muted">{info.article} </span>}
              {info.nl}
            </Nl>
          </div>
          {info.example && (
            <div className="row small">
              <AudioButton text={info.example.nl} id={`card-ex-${info.itemId}`} />
              <div>
                <Nl>{info.example.nl}</Nl>
                <div className="muted">{info.example.en}</div>
              </div>
            </div>
          )}
          {info.note && (
            <p className="small" style={{ margin: 0 }}>
              {info.note}
            </p>
          )}
          <div className="tiny muted">From: {info.origin}</div>
        </section>
      )}

      {revealed && (
        <div className="bottom-actions">
          <div className="small muted center">How well did you know it?</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {([1, 2, 3, 4] as Rating[]).map((r) => (
              <button
                key={r}
                type="button"
                className={`btn small${suggested === r ? ' primary' : ''}`}
                style={{ flexDirection: 'column', gap: 0, minHeight: 56, borderRadius: 12 }}
                onClick={() => rate(r)}
              >
                <span>{RATING_LABELS[r]}</span>
                <span className="tiny" style={{ opacity: 0.8 }}>
                  {intervals[r]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
