import { planCatalog } from '@praat/content';
import { generatePlan, type PlanItem } from '@praat/core';
import { BookOpen, CloudOff, Dumbbell, Ear, MessageCircle, MessagesSquare, RotateCcw, UserRound, Wrench } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router';
import { AudioButton } from '../components/AudioButton';
import { Header, Nl } from '../components/ui';
import { expressionOfTheDay, greeting } from '../lib/content';
import { useApp } from '../lib/store';

const catalog = planCatalog();

const ICONS: Record<PlanItem['kind'], typeof BookOpen> = {
  review: RotateCcw,
  lesson: BookOpen,
  scenario: MessagesSquare,
  friend: MessageCircle,
  drill: Wrench,
  pronunciation: Dumbbell,
  listening: Ear,
};

export function planItemLink(item: PlanItem): string {
  switch (item.kind) {
    case 'review':
      return '/practice/review';
    case 'lesson':
      return `/learn/${item.refId}`;
    case 'scenario':
      return `/talk/scenario/${item.refId}`;
    case 'friend':
      return '/talk/friend';
    case 'drill':
      return `/practice/drill/${encodeURIComponent(item.refId ?? '')}`;
    case 'pronunciation':
      return `/practice/pronunciation/${item.refId}`;
    case 'listening':
      return `/practice/listening/${item.refId}`;
  }
}

export function Home() {
  const { state, profile, user, online } = useApp();
  const now = new Date();
  const day = now.toDateString();
  const plan = useMemo(() => generatePlan(state, profile, catalog, new Date()), [state, profile]);
  const expression = useMemo(
    () => expressionOfTheDay(new Date(day), profile.level, profile.region),
    [day, profile.level, profile.region],
  );
  const name = user?.displayName;

  return (
    <div className="stack-lg">
      <Header
        title={`${greeting(now)}${name ? `, ${name}` : ''}`}
        subtitle={`Today · ${plan.totalMinutes} min`}
        actions={
          <Link
            to="/profile"
            className="icon-btn"
            aria-label="Profile"
            style={{ background: 'var(--brand-soft)', color: 'var(--brand)', fontWeight: 700 }}
          >
            {name ? name.slice(0, 1).toUpperCase() : <UserRound size={22} aria-hidden />}
          </Link>
        }
      />

      {!online && (
        <div className="notice info" role="status">
          <CloudOff size={18} aria-hidden /> You're offline. Lessons, practice and practice conversations still work; progress
          syncs later.
        </div>
      )}

      <section className="card tint stack" aria-labelledby="why">
        <h2 id="why" style={{ fontSize: '1.05rem' }}>
          {plan.headline}
        </h2>
        <p style={{ margin: 0 }}>{plan.rationale}</p>
      </section>

      <section aria-label="Today's plan">
        <ul className="list">
          {plan.items.map((item) => {
            const Icon = ICONS[item.kind];
            return (
              <li key={`${item.kind}-${item.refId}`}>
                <Link to={planItemLink(item)} className="list-item">
                  <span
                    className={`icon-badge${item.kind === 'scenario' || item.kind === 'friend' ? ' accent' : ''}`}
                    aria-hidden
                  >
                    <Icon size={20} />
                  </span>
                  <div className="grow">
                    <div className="title">{item.title}</div>
                    <div className="meta">{item.reason}</div>
                  </div>
                  <span className="small muted">{item.minutes}m</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card stack" aria-labelledby="expr">
        <div className="section-title" id="expr">
          Expression of the day
        </div>
        <div className="row">
          <AudioButton text={expression.examples[0]?.nl ?? expression.natural} id="expr-of-day" />
          <div className="grow">
            <Nl className="big-nl">{expression.natural}</Nl>
            <div className="muted">{expression.en}</div>
          </div>
        </div>
        {expression.textbook && (
          <p className="small" style={{ margin: 0 }}>
            Instead of the textbook <span lang="nl">“{expression.textbook}”</span>. {expression.when}
          </p>
        )}
        <Link to="/practice/natural" className="small">
          More natural Dutch →
        </Link>
      </section>

      {!user && (
        <section className="card flat stack">
          <strong>Talk with an AI partner</strong>
          <p className="small muted" style={{ margin: 0 }}>
            Practice conversations work offline. Create a free account to chat with the AI partner, which understands whatever you
            say, and to sync your progress across devices.
          </p>
          <Link to="/account" className="btn block">
            Create account
          </Link>
        </section>
      )}
    </div>
  );
}
