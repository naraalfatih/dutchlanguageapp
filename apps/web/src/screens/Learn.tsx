import { lessonsByLevel } from '@praat/content';
import { LEVELS, type Level } from '@praat/core';
import { CheckCircle2, Circle, CircleDot } from 'lucide-react';
import { useState } from 'react';
import { Header, ListLink } from '../components/ui';
import { LEVEL_NAMES } from '../lib/content';
import { useApp } from '../lib/store';

export default function Learn() {
  const { state, profile } = useApp();
  const [open, setOpen] = useState<Level>(profile.level);

  return (
    <div className="stack-lg">
      <Header title="Learn" subtitle="From first words to natural, fluent Dutch" />
      {LEVELS.map((level) => {
        const lessons = lessonsByLevel(level);
        const done = lessons.filter((l) => state.lessons[l.id]?.status === 'completed').length;
        const units = [...new Set(lessons.map((l) => l.unit))];
        return (
          <details key={level} open={open === level} onToggle={(e) => (e.currentTarget.open ? setOpen(level) : undefined)}>
            <summary className="spread" style={{ cursor: 'pointer', minHeight: 56, listStyle: 'none' }}>
              <div>
                <h2 style={{ margin: 0 }}>
                  {level} · {LEVEL_NAMES[level]}
                </h2>
                <div className="small muted">
                  {done}/{lessons.length} lessons
                </div>
              </div>
              {level === profile.level && <span className="chip brand">Your level</span>}
            </summary>
            <div className="stack" style={{ marginTop: 8 }}>
              {units.map((unit) => (
                <section key={unit} className="stack">
                  <div className="section-title">{unit}</div>
                  <ul className="list">
                    {lessons
                      .filter((l) => l.unit === unit)
                      .map((lesson) => {
                        const progress = state.lessons[lesson.id];
                        const Icon = progress?.status === 'completed' ? CheckCircle2 : progress ? CircleDot : Circle;
                        return (
                          <ListLink
                            key={lesson.id}
                            to={`/learn/${lesson.id}`}
                            icon={
                              <span className={`icon-badge${progress?.status === 'completed' ? ' ok' : ''}`} aria-hidden>
                                <Icon size={20} />
                              </span>
                            }
                            title={lesson.title}
                            meta={`${lesson.subtitle} · ${lesson.minutes} min`}
                            right={
                              <span className="sr-only">
                                {progress?.status === 'completed' ? 'Completed' : progress ? 'In progress' : 'Not started'}
                              </span>
                            }
                          />
                        );
                      })}
                  </ul>
                </section>
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}
