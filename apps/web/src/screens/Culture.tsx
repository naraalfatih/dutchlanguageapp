import { cultureArticles } from '@praat/content';
import { Landmark } from 'lucide-react';
import { Header, ListLink } from '../components/ui';

const TOPIC_LABEL: Record<string, string> = {
  communication: 'Communication',
  cycling: 'Cycling',
  social: 'Social life',
  humor: 'Humour',
  regions: 'Regions',
  traditions: 'Traditions',
  food: 'Food',
  history: 'History',
  work: 'Work',
  housing: 'Housing',
};

export default function Culture() {
  return (
    <div className="stack-lg">
      <Header title="Culture" subtitle="Why Dutch people say what they say" />
      <p className="small muted" style={{ margin: 0 }}>
        Directness, gezelligheid, birthdays, cycling, work culture, Flanders — the context that makes conversations make sense.
      </p>
      <ul className="list">
        {cultureArticles.map((a) => (
          <ListLink
            key={a.id}
            to={`/culture/${a.id}`}
            icon={
              <span className="icon-badge" aria-hidden>
                <Landmark size={20} />
              </span>
            }
            title={a.title}
            meta={`${TOPIC_LABEL[a.topic] ?? a.topic} · ${a.minutes} min · ${a.summary}`}
          />
        ))}
      </ul>
    </div>
  );
}
