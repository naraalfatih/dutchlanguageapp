import { sounds } from '@praat/content';
import { AudioLines } from 'lucide-react';
import { Header, ListLink } from '../components/ui';
import { useApp } from '../lib/store';

export default function Pronunciation() {
  const { state } = useApp();
  const ordered = [...sounds].sort((a, b) => a.priority - b.priority);
  return (
    <div className="stack-lg">
      <Header title="Pronunciation Coach" subtitle="The sounds that make you understood" back="/practice" />
      <p className="small muted" style={{ margin: 0 }}>
        Start with the top ones: they change meaning or make words hard to recognise. Every sound has minimal pairs to train your
        ear and phrases to say out loud.
      </p>
      <ul className="list">
        {ordered.map((s) => {
          const stats = state.patterns[`pron-${s.id}`];
          const accuracy =
            stats && stats.drillAttempts >= 3 ? Math.round((stats.drillCorrect / stats.drillAttempts) * 100) : null;
          return (
            <ListLink
              key={s.id}
              to={`/practice/pronunciation/${s.id}`}
              icon={
                <span className={`icon-badge${s.priority === 1 ? ' accent' : ''}`} aria-hidden>
                  <AudioLines size={20} />
                </span>
              }
              title={s.title}
              meta={`${s.spelling.join(', ')} · /${s.ipa}/`}
              right={
                accuracy !== null ? <span className={`chip ${accuracy >= 80 ? 'ok' : 'warn'}`}>{accuracy}%</span> : undefined
              }
            />
          );
        })}
      </ul>
    </div>
  );
}
