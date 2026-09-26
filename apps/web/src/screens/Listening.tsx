import { listeningItems } from '@praat/content';
import { LEVEL_VALUE } from '@praat/core';
import { Ear } from 'lucide-react';
import { Header, ListLink } from '../components/ui';
import { useApp } from '../lib/store';

const KIND_LABEL: Record<string, string> = {
  conversation: 'Conversation',
  street: 'On the street',
  news: 'News',
  podcast: 'Podcast',
  workplace: 'At work',
  voicemail: 'Voicemail',
  announcement: 'Announcement',
};

export default function Listening() {
  const { state } = useApp();
  const items = [...listeningItems].sort((a, b) => LEVEL_VALUE[a.level] - LEVEL_VALUE[b.level]);
  return (
    <div className="stack-lg">
      <Header title="Listening Trainer" subtitle="Understand Dutch at real speed" back="/practice" />
      {state.stats.listeningCompleted > 0 && (
        <p className="chip brand">{state.stats.listeningCompleted} listening sessions completed</p>
      )}
      <p className="small muted" style={{ margin: 0 }}>
        Listen at normal speed first (slow is one tap away), answer the questions, then read the transcript with vocabulary and
        slang notes.
      </p>
      <ul className="list">
        {items.map((item) => (
          <ListLink
            key={item.id}
            to={`/practice/listening/${item.id}`}
            icon={
              <span className="icon-badge" aria-hidden>
                <Ear size={20} />
              </span>
            }
            title={item.title}
            meta={`${item.level} · ${KIND_LABEL[item.kind] ?? item.kind} · ${item.description}`}
          />
        ))}
      </ul>
    </div>
  );
}
