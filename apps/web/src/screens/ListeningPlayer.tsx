import { getListeningItem } from '@praat/content';
import { createEvent } from '@praat/core';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { QuestionView } from '../components/ExerciseView';
import { Empty, Header, Nl, Segmented } from '../components/ui';
import { record } from '../lib/store';
import { ListeningLines } from './LessonPlayer';

export default function ListeningPlayer() {
  const { itemId = '' } = useParams();
  const item = getListeningItem(itemId);
  const navigate = useNavigate();
  const [speed, setSpeed] = useState<'normal' | 'slow'>('normal');
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [showTranscript, setShowTranscript] = useState(false);

  if (!item) {
    return (
      <>
        <Header title="Not found" back="/practice/listening" />
        <Empty title="This listening item doesn't exist." />
      </>
    );
  }
  const answered = Object.keys(answers).length;
  const allAnswered = answered >= item.questions.length;
  const correct = Object.values(answers).filter(Boolean).length;

  const finish = () => {
    record(
      createEvent('listening.completed', {
        itemId: item.id,
        level: item.level,
        speed,
        score: item.questions.length ? correct / item.questions.length : 1,
      }),
    );
    navigate('/practice/listening');
  };

  return (
    <div className="stack">
      <Header
        title={item.title}
        subtitle={`${item.level} · ${item.speakers.map((s) => s.name).join(', ')}`}
        back="/practice/listening"
      />
      <p style={{ margin: 0 }}>{item.description}</p>
      <Segmented
        label="Playback speed"
        value={speed}
        onChange={setSpeed}
        options={[
          { value: 'normal', label: 'Normal speed' },
          { value: 'slow', label: 'Slow' },
        ]}
      />
      <ListeningLines lines={item.lines} id={`li-${item.id}`} showText={showTranscript} slow={speed === 'slow'} />

      <section className="stack">
        <h2>Questions</h2>
        {item.questions.map((q, i) => (
          <div key={i} className="card">
            <QuestionView question={q} onAnswer={(ok) => setAnswers((a) => ({ ...a, [i]: ok }))} />
          </div>
        ))}
      </section>

      {(allAnswered || showTranscript) && (
        <section className="stack">
          {allAnswered && (
            <p className="chip ok" role="status">
              {correct} of {item.questions.length} correct
            </p>
          )}
          <button type="button" className="btn" onClick={() => setShowTranscript(!showTranscript)}>
            {showTranscript ? 'Hide transcript' : 'Show transcript'}
          </button>
          <div className="card stack" style={{ gap: 6 }}>
            <strong>Vocabulary</strong>
            {item.vocab.map((v) => (
              <div key={v.term} className="small">
                <Nl>{v.term}</Nl> — {v.meaning}
              </div>
            ))}
          </div>
          {item.slang.length > 0 && (
            <div className="card accent stack" style={{ gap: 6 }}>
              <strong>Slang and spoken Dutch</strong>
              {item.slang.map((s) => (
                <div key={s.term} className="small">
                  <Nl>{s.term}</Nl> — {s.meaning}. <span className="muted">{s.note}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <div className="bottom-actions">
        <button type="button" className="btn primary block" onClick={finish} disabled={!allAnswered}>
          {allAnswered ? 'Done' : `Answer the questions (${answered}/${item.questions.length})`}
        </button>
      </div>
    </div>
  );
}
