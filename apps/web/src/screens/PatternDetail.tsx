import { analyzePattern, getPattern, patternTitle } from '@praat/core';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { AudioButton } from '../components/AudioButton';
import { Empty, Header, Nl } from '../components/ui';
import { useApp } from '../lib/store';

export default function PatternDetail() {
  const { patternId = '' } = useParams();
  const { state } = useApp();
  const pattern = getPattern(patternId);
  const stats = state.patterns[patternId];
  const insight = useMemo(() => (stats ? analyzePattern(state, stats, new Date()) : null), [state, stats]);
  const own = state.recentMistakes.filter((m) => m.patternId === patternId).slice(0, 10);

  if (!pattern && !stats) {
    return (
      <>
        <Header title="Mistake Diary" back="/progress" />
        <Empty title="Nothing recorded for this pattern." />
      </>
    );
  }

  return (
    <div className="stack-lg">
      <Header title={pattern?.title ?? patternTitle(patternId)} subtitle={insight?.label} back="/progress" />
      {pattern && (
        <section className="card tint stack" style={{ gap: 6 }}>
          <strong>{pattern.rule}</strong>
          <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{pattern.explanation}</p>
        </section>
      )}

      {insight && (
        <section className="kv">
          <div className="stat">
            <div className="value">{insight.recentRate === null ? insight.recentErrors : insight.recentRate}</div>
            <div className="label">
              {insight.recentRate === null ? 'times in the last 2 weeks' : 'per 100 sentences (last 2 weeks)'}
            </div>
          </div>
          <div className="stat">
            <div className="value">{insight.drillAccuracy === null ? '—' : `${Math.round(insight.drillAccuracy * 100)}%`}</div>
            <div className="label">right in drills</div>
          </div>
        </section>
      )}

      {own.length > 0 && (
        <section className="stack">
          <h2>Your sentences</h2>
          <ul className="list">
            {own.map((m) => (
              <li key={m.id} className="list-item" style={{ cursor: 'default', alignItems: 'flex-start' }}>
                <div className="grow stack" style={{ gap: 2 }}>
                  <Nl className="strike">{m.original}</Nl>
                  <div className="row">
                    <Nl className="fix">{m.correction}</Nl>
                    <AudioButton text={m.correction} id={`own-${m.id}`} />
                  </div>
                  <div className="small muted">{m.explanation}</div>
                  <div className="tiny muted">
                    {new Date(m.occurredAt).toLocaleDateString()} · {m.source}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {pattern && pattern.examples.length > 0 && (
        <section className="stack">
          <h2>Examples</h2>
          {pattern.examples.map((ex) => (
            <div key={ex.wrong} className="card flat stack" style={{ gap: 2 }}>
              <div>
                ✗ <Nl className="strike">{ex.wrong}</Nl>
              </div>
              <div>
                ✓ <Nl className="fix">{ex.right}</Nl>
              </div>
            </div>
          ))}
        </section>
      )}

      <div className="bottom-actions">
        <Link to={`/practice/drill/${encodeURIComponent(patternId)}`} className="btn primary block">
          Practise with your own sentences
        </Link>
      </div>
    </div>
  );
}
