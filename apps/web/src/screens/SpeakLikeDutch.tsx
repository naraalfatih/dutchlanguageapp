import { expressions } from '@praat/content';
import { createEvent, EXPRESSION_CATEGORIES, LEVEL_VALUE, type Expression } from '@praat/core';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useState } from 'react';
import { AudioButton } from '../components/AudioButton';
import { SayIt } from '../components/SayIt';
import { Header, Nl } from '../components/ui';
import { record, useApp } from '../lib/store';

const CATEGORY_LABEL: Record<Expression['category'], string> = {
  greetings: 'Greetings',
  reactions: 'Reactions',
  particles: 'Little words',
  fillers: 'Fillers',
  social: 'Social',
  slang: 'Slang',
  idioms: 'Idioms',
};

function regionRank(e: Expression, region: 'nl' | 'be'): number {
  return e.region === 'both' || e.region === region ? 0 : 1;
}

const REGISTER_LABEL = { formal: 'Formal', neutral: 'Neutral', informal: 'Informal' } as const;

export default function SpeakLikeDutch() {
  const { state, profile } = useApp();
  const [category, setCategory] = useState<Expression['category']>('greetings');
  const [practising, setPractising] = useState<string | null>(null);
  // Your region's expressions first; the others are still worth recognising.
  const list = expressions
    .filter((e) => e.category === category)
    .sort((a, b) => regionRank(a, profile.region) - regionRank(b, profile.region) || LEVEL_VALUE[a.level] - LEVEL_VALUE[b.level]);

  return (
    <div className="stack-lg">
      <Header title="Speak like a Dutch person" subtitle="What people actually say — and when" back="/practice" />
      <div className="row wrap" role="tablist" aria-label="Categories">
        {EXPRESSION_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={c === category}
            className={`chip${c === category ? ' brand' : ''}`}
            onClick={() => setCategory(c)}
          >
            {CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>

      <div className="stack">
        {list.map((e) => {
          const saved = !!state.cards[e.id];
          return (
            <article key={e.id} className="card stack" style={{ gap: 8 }}>
              <div className="row">
                <AudioButton text={e.examples[0]?.nl ?? e.natural} id={`expr-${e.id}`} />
                <div className="grow">
                  <Nl className="big-nl">{e.natural}</Nl>
                  <div className="muted">{e.en}</div>
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={saved ? 'Saved to review' : `Save ${e.natural} for review`}
                  disabled={saved}
                  onClick={() => record(createEvent('card.added', { itemId: e.id, source: 'manual' }))}
                >
                  {saved ? <BookmarkCheck color="var(--brand)" /> : <Bookmark />}
                </button>
              </div>
              {e.textbook && (
                <div className="small">
                  <span className="muted">Textbook: </span>
                  <Nl className="strike">{e.textbook}</Nl>
                </div>
              )}
              <div className="row wrap">
                <span className="chip">{REGISTER_LABEL[e.register]}</span>
                <span className="chip">{e.level}</span>
                {e.region !== 'both' && <span className="chip accent">{e.region === 'be' ? 'Flanders' : 'Netherlands'}</span>}
              </div>
              <p className="small" style={{ margin: 0 }}>
                <strong>Who says it:</strong> {e.whoUses}
              </p>
              <p className="small" style={{ margin: 0 }}>
                <strong>When:</strong> {e.when}
              </p>
              {e.examples.map((ex) => (
                <div key={ex.nl} className="row small">
                  <AudioButton text={ex.nl} id={`ex-${e.id}-${ex.nl}`} />
                  <div>
                    <Nl>{ex.nl}</Nl>
                    <div className="muted">{ex.en}</div>
                  </div>
                </div>
              ))}
              {e.note && (
                <p className="small muted" style={{ margin: 0 }}>
                  {e.note}
                </p>
              )}
              {practising === e.id ? (
                <SayIt target={e.examples[0]?.nl ?? e.natural} en={e.examples[0]?.en} level={e.level} />
              ) : (
                <button type="button" className="btn small" onClick={() => setPractising(e.id)}>
                  Say it out loud
                </button>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
