import { analyzePatterns, dueCardCount } from '@praat/core';
import { AudioLines, Ear, MessageSquareQuote, RotateCcw, Wrench } from 'lucide-react';
import { useMemo } from 'react';
import { Header, ListLink } from '../components/ui';
import { useApp } from '../lib/store';

export default function Practice() {
  const { state } = useApp();
  const now = new Date();
  const due = dueCardCount(state, now);
  const total = Object.keys(state.cards).length;
  const patterns = useMemo(() => analyzePatterns(state, new Date()).filter((p) => p.status !== 'mastered'), [state]);

  return (
    <div className="stack-lg">
      <Header title="Practice" subtitle="Short, focused sessions that make Dutch stick" />
      <ul className="list">
        <ListLink
          to="/practice/review"
          icon={
            <span className="icon-badge" aria-hidden>
              <RotateCcw size={20} />
            </span>
          }
          title="Review"
          meta={
            total
              ? due
                ? `${due} phrase${due === 1 ? '' : 's'} due now`
                : `All ${total} phrases are fresh — nothing due`
              : 'Phrases you save in lessons appear here'
          }
          right={due ? <span className="chip accent">{due}</span> : undefined}
        />
        <ListLink
          to="/practice/pronunciation"
          icon={
            <span className="icon-badge" aria-hidden>
              <AudioLines size={20} />
            </span>
          }
          title="Pronunciation Coach"
          meta="G, CH, UI, EU, R and the vowels — listen, say it, get feedback"
        />
        <ListLink
          to="/practice/listening"
          icon={
            <span className="icon-badge" aria-hidden>
              <Ear size={20} />
            </span>
          }
          title="Listening Trainer"
          meta="Real-speed Dutch: conversations, voicemails, news, Flemish"
        />
        <ListLink
          to="/practice/natural"
          icon={
            <span className="icon-badge accent" aria-hidden>
              <MessageSquareQuote size={20} />
            </span>
          }
          title="Speak like a Dutch person"
          meta="“Hoe gaat-ie?” instead of “Hoe gaat het met jou?”"
        />
      </ul>

      <section className="stack">
        <div className="section-title">Mistake drills</div>
        {patterns.length ? (
          <ul className="list">
            {patterns.slice(0, 5).map((p) => (
              <ListLink
                key={p.patternId}
                to={`/practice/drill/${encodeURIComponent(p.patternId)}`}
                icon={
                  <span className="icon-badge accent" aria-hidden>
                    <Wrench size={20} />
                  </span>
                }
                title={p.title}
                meta={p.label}
              />
            ))}
          </ul>
        ) : (
          <p className="small muted card flat">
            No mistakes recorded yet. Have a conversation in Talk and we'll collect them for you — then practise them here with
            your own sentences.
          </p>
        )}
      </section>
    </div>
  );
}
