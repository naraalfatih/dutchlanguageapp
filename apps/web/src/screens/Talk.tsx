import { personas, scenarios } from '@praat/content';
import { LEVEL_VALUE, SCENARIO_CATEGORIES, type ScenarioCategory } from '@praat/core';
import { GraduationCap, MessageCircle, MessagesSquare, Sparkles, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Header, ListLink } from '../components/ui';
import { api, type ConversationSummary } from '../lib/api';
import { useApp } from '../lib/store';

const CATEGORY_LABEL: Record<ScenarioCategory, string> = {
  living: 'Living',
  social: 'Social life',
  daily: 'Daily life',
  work: 'Work',
};

export default function Talk() {
  const { session, online, state, profile } = useApp();
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [recent, setRecent] = useState<ConversationSummary[]>([]);
  const ai = session && online;

  useEffect(() => {
    if (!ai) return;
    api
      .conversations()
      .then((r) => setRecent(r.conversations.filter((c) => !c.completed).slice(0, 3)))
      .catch(() => setRecent([]));
  }, [ai]);

  const friends = personas.filter((p) => p.kind === 'friend');
  const tutor = personas.find((p) => p.kind === 'tutor');

  return (
    <div className="stack-lg">
      <Header title="Talk" subtitle="Real conversations — the fastest way to speak" />

      {ai ? (
        <div className="notice info">
          <Sparkles size={18} aria-hidden />
          <span>AI partner on: say anything — it replies naturally and corrects you gently.</span>
        </div>
      ) : (
        <div className="notice">
          {online ? <MessagesSquare size={18} aria-hidden /> : <WifiOff size={18} aria-hidden />}
          <span>
            Practice mode: a scripted partner with rule-based feedback{online ? '' : ' (works offline)'}.{' '}
            {online && <Link to="/account">Sign in</Link>}
            {online && ' for the AI partner that understands whatever you say.'}
          </span>
        </div>
      )}

      {recent.length > 0 && (
        <section className="stack">
          <div className="section-title">Continue</div>
          <ul className="list">
            {recent.map((c) => (
              <ListLink
                key={c.id}
                to={`/talk/c/${c.id}`}
                title={c.title}
                meta={`${c.level} · ${new Date(c.updatedAt).toLocaleDateString()}`}
              />
            ))}
          </ul>
        </section>
      )}

      <section className="card stack">
        <div className="row">
          <span className="icon-badge" aria-hidden>
            <GraduationCap size={20} />
          </span>
          <div className="grow">
            <h2 style={{ margin: 0 }}>AI Tutor{tutor ? ` · ${tutor.name}` : ''}</h2>
            <div className="small muted">A patient teacher who adapts to your level.</div>
          </div>
        </div>
        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`/talk/tutor${topic.trim() ? `?topic=${encodeURIComponent(topic.trim())}` : ''}`);
          }}
        >
          <input
            className="input grow"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic (optional): my job, weekend…"
            aria-label="Conversation topic"
            maxLength={200}
          />
          <button type="submit" className="btn primary">
            Start
          </button>
        </form>
      </section>

      <section className="stack">
        <div className="section-title">Dutch Friend Mode</div>
        <p className="small muted" style={{ margin: 0 }}>
          Casual chat like with a friend: slang, particles like <span lang="nl">toch, hoor, gewoon</span> — explained as you go.
        </p>
        <ul className="list">
          {friends.map((p) => (
            <ListLink
              key={p.id}
              to={`/talk/friend/${p.id}`}
              icon={
                <span className="icon-badge accent" aria-hidden>
                  <MessageCircle size={20} />
                </span>
              }
              title={`${p.name}, ${p.age}`}
              meta={`${p.city} · ${p.interests.slice(0, 3).join(', ')}`}
            />
          ))}
        </ul>
      </section>

      <section className="stack">
        <div className="section-title">Dutch Life Simulator</div>
        <p className="small muted" style={{ margin: 0 }}>
          Real situations with a goal. Get the task done — mistakes are fine as long as you're understood.
        </p>
        {SCENARIO_CATEGORIES.map((category) => (
          <div key={category} className="stack" style={{ gap: 6 }}>
            <h3 style={{ margin: '8px 0 0' }}>{CATEGORY_LABEL[category]}</h3>
            <ul className="list">
              {scenarios
                .filter((s) => s.category === category)
                .sort((a, b) => LEVEL_VALUE[a.level] - LEVEL_VALUE[b.level])
                .map((s) => (
                  <ListLink
                    key={s.id}
                    to={`/talk/scenario/${s.id}`}
                    done={!!(s.canDoId && state.canDo[s.canDoId])}
                    title={s.title}
                    meta={`${s.level} · ${s.goal}`}
                    right={
                      LEVEL_VALUE[s.level] > LEVEL_VALUE[profile.level] + 1 ? (
                        <span className="chip warn">stretch</span>
                      ) : undefined
                    }
                  />
                ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
