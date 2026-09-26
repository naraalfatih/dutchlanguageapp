import { buildDrill, getPattern } from '@praat/core';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ExerciseView } from '../components/ExerciseView';
import { Empty, Header, ProgressBar } from '../components/ui';
import { useApp } from '../lib/store';
import { recordExercise } from './LessonPlayer';

/** Mistake drill: your own past sentences to fix, interleaved with targeted practice. */
export default function Drill() {
  const { patternId = '' } = useParams();
  const { state, profile } = useApp();
  const pattern = getPattern(patternId);
  const [exercises] = useState(() => buildDrill(state, patternId, 6));
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const exercise = exercises[index];
  const accuracy = useMemo(
    () => (scores.length ? Math.round((scores.filter((s) => s >= 0.8).length / scores.length) * 100) : 0),
    [scores],
  );

  if (!exercises.length) {
    return (
      <>
        <Header title={pattern?.title ?? 'Drill'} back="/practice" />
        <Empty title="No drill available for this pattern yet." action={<Link to="/progress">Open your Mistake Diary</Link>} />
      </>
    );
  }

  if (!exercise) {
    return (
      <>
        <Header title={pattern?.title ?? 'Drill'} back="/practice" />
        <Empty
          title={`Done — ${accuracy}% right`}
          action={
            <div className="stack">
              <Link className="btn primary" to={`/progress/diary/${encodeURIComponent(patternId)}`}>
                See your progress on this pattern
              </Link>
              <Link className="btn ghost" to="/talk/tutor">
                Use it in a conversation
              </Link>
            </div>
          }
        >
          The real test is conversation: your Mistake Diary tracks whether this mistake shows up less when you speak.
        </Empty>
      </>
    );
  }

  return (
    <div className="stack">
      <Header title={pattern?.title ?? 'Drill'} subtitle={pattern?.rule} back="/practice" close />
      <ProgressBar value={index / exercises.length} label="Drill progress" />
      <ExerciseView
        key={exercise.id}
        exercise={exercise}
        continueLabel={index + 1 < exercises.length ? 'Next' : 'Finish'}
        onDone={(outcome) => {
          recordExercise(outcome, profile.level);
          setScores((s) => [...s, outcome.score]);
          setIndex(index + 1);
        }}
      />
    </div>
  );
}
