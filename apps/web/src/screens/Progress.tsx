import { canDos, scenarios } from '@praat/content';
import {
  analyzePatterns,
  currentRetrievability,
  describeSkill,
  dueCardCount,
  LEVELS,
  levelFromValue,
  overallRating,
  SKILLS,
  skillTrend,
  type PatternStatus,
  type Skill,
} from '@praat/core';
import { CheckCircle2, Circle, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router';
import { Header, ProgressBar } from '../components/ui';
import { useApp } from '../lib/store';

const SKILL_LABEL: Record<Skill, string> = {
  speaking: 'Speaking',
  listening: 'Listening',
  vocabulary: 'Vocabulary',
  grammar: 'Grammar',
  pronunciation: 'Pronunciation',
  fluency: 'Fluency',
};

const STATUS_CHIP: Record<PatternStatus, string> = {
  'needs-practice': 'bad',
  improving: 'warn',
  mastered: 'ok',
  new: 'brand',
};

export default function Progress() {
  const { state } = useApp();
  const now = useMemo(() => new Date(), []);
  const overall = overallRating(state.skills);
  const overallLevel = levelFromValue(Math.min(5.999, overall));
  const patterns = useMemo(() => analyzePatterns(state, now), [state, now]);
  const demonstrated = canDos.filter((c) => state.canDo[c.id]);
  const cards = Object.values(state.cards);
  const reviewed = cards.filter((c) => c.lastReview);
  const retention = reviewed.length
    ? Math.round((reviewed.reduce((sum, c) => sum + currentRetrievability(c, now), 0) / reviewed.length) * 100)
    : null;
  const recentDays = state.stats.activeDays.filter((d) => now.getTime() - new Date(d).getTime() < 30 * 86_400_000).length;
  const voiceShare = state.stats.speakingTurns ? Math.round((state.stats.voiceTurns / state.stats.speakingTurns) * 100) : 0;

  return (
    <div className="stack-lg">
      <Header title="Progress" subtitle="Can you communicate naturally in Dutch?" />

      <section className="card tint stack">
        <div className="spread">
          <div>
            <div className="section-title" style={{ margin: 0 }}>
              Overall
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 750 }}>{overallLevel}</div>
          </div>
          <div className="center">
            <div style={{ fontSize: '2rem', fontWeight: 750 }}>{demonstrated.length}</div>
            <div className="small">real-life tasks done</div>
          </div>
        </div>
        <ProgressBar value={overall - Math.floor(overall)} label={`Progress through ${overallLevel}`} />
        <p className="small" style={{ margin: 0 }}>
          Measured by what you can do in conversation, not by lessons clicked. Speaking and listening count most.
        </p>
      </section>

      <section className="stack">
        <h2>Your common mistakes</h2>
        {patterns.length ? (
          <ol className="list" style={{ listStyle: 'none' }}>
            {patterns.slice(0, 8).map((p, i) => (
              <li key={p.patternId}>
                <div className="list-item" style={{ cursor: 'default' }}>
                  <span className="small muted" style={{ width: 16 }}>
                    {i + 1}.
                  </span>
                  <Link
                    to={`/progress/diary/${encodeURIComponent(p.patternId)}`}
                    className="grow"
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    <div className="title">{p.title}</div>
                    <div className="meta">
                      {p.recentErrors} in the last 2 weeks · {p.occurrences} total
                    </div>
                  </Link>
                  <span className={`chip ${STATUS_CHIP[p.status]}`}>{p.label}</span>
                  {p.status !== 'mastered' && (
                    <Link to={`/practice/drill/${encodeURIComponent(p.patternId)}`} className="btn small">
                      Practise
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="card flat small muted">
            No mistakes recorded yet. Have a conversation in Talk and we'll collect them for you — with your own sentences and how
            to fix them.
          </p>
        )}
      </section>

      <section className="stack">
        <h2>Skills</h2>
        <div className="card stack">
          {SKILLS.map((skill) => {
            const s = describeSkill(state.skills[skill]);
            const trend = skillTrend(state.skills[skill], now);
            return (
              <div key={skill} className="skill-row">
                <span className="small" style={{ fontWeight: 600 }}>
                  {SKILL_LABEL[skill]}
                </span>
                <div>
                  <ProgressBar value={s.progress} label={`${SKILL_LABEL[skill]}: ${s.level}`} />
                  {!s.confident && <div className="tiny muted">estimate — more practice sharpens it</div>}
                </div>
                <span className="small row" style={{ gap: 2, fontWeight: 650 }}>
                  {s.level}
                  {trend > 0.05 && <TrendingUp size={14} color="var(--ok)" aria-label="improving" />}
                  {trend < -0.05 && <TrendingDown size={14} color="var(--warn)" aria-label="slipping" />}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="stack">
        <h2>Speaking and memory</h2>
        <div className="kv">
          <div className="stat">
            <div className="value">{state.stats.sentencesProduced}</div>
            <div className="label">sentences you produced</div>
          </div>
          <div className="stat">
            <div className="value">{voiceShare}%</div>
            <div className="label">of turns spoken aloud</div>
          </div>
          <div className="stat">
            <div className="value">{retention === null ? '—' : `${retention}%`}</div>
            <div className="label">of reviewed phrases you'd recall now</div>
          </div>
          <div className="stat">
            <div className="value">{dueCardCount(state, now)}</div>
            <div className="label">phrases due for review</div>
          </div>
          <div className="stat">
            <div className="value">{state.stats.listeningCompleted}</div>
            <div className="label">listening sessions</div>
          </div>
          <div className="stat">
            <div className="value">{recentDays}</div>
            <div className="label">days practised (last 30)</div>
          </div>
        </div>
      </section>

      <section className="stack">
        <h2>What you can do</h2>
        {LEVELS.map((level) => {
          const list = canDos.filter((c) => c.level === level);
          if (!list.length) return null;
          return (
            <details key={level} className="card" open={list.some((c) => state.canDo[c.id])}>
              <summary className="spread" style={{ cursor: 'pointer', fontWeight: 650 }}>
                {level}
                <span className="small muted">
                  {list.filter((c) => state.canDo[c.id]).length}/{list.length}
                </span>
              </summary>
              <ul className="stack" style={{ listStyle: 'none', padding: 0, margin: '8px 0 0' }}>
                {list.map((c) => {
                  const done = state.canDo[c.id];
                  const scenario = scenarios.find((s) => c.scenarioIds.includes(s.id));
                  return (
                    <li key={c.id} className="row" style={{ alignItems: 'flex-start' }}>
                      {done ? (
                        <CheckCircle2 size={18} color="var(--ok)" aria-label="Demonstrated" />
                      ) : (
                        <Circle size={18} color="var(--ink-2)" aria-label="Not yet" />
                      )}
                      <div className="grow small">
                        {c.text}
                        {!done && scenario && (
                          <>
                            {' '}
                            <Link to={`/talk/scenario/${scenario.id}`}>Try it</Link>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </section>
    </div>
  );
}
