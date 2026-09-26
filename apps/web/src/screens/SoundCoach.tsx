import { getSound } from '@praat/content';
import { createEvent, type Level } from '@praat/core';
import { Shuffle } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router';
import { AudioButton } from '../components/AudioButton';
import { SayIt } from '../components/SayIt';
import { Empty, Header, Nl } from '../components/ui';
import { useVoice } from '../lib/hooks';
import { speak } from '../lib/speech';
import { record, useApp } from '../lib/store';

/** Ear training: hear one of two similar words and pick which it was. */
function PairQuiz({ soundId, pairs }: { soundId: string; pairs: NonNullable<ReturnType<typeof getSound>>['minimalPairs'] }) {
  const voice = useVoice();
  const { profile } = useApp();
  const [round, setRound] = useState<{ pair: number; answer: 'a' | 'b' } | null>(null);
  const [picked, setPicked] = useState<'a' | 'b' | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });

  const play = (r: { pair: number; answer: 'a' | 'b' }) => void speak(pairs[r.pair]![r.answer].nl, voice, `quiz-${soundId}`);
  const newRound = () => {
    const r = { pair: Math.floor(Math.random() * pairs.length), answer: (Math.random() < 0.5 ? 'a' : 'b') as 'a' | 'b' };
    setRound(r);
    setPicked(null);
    play(r);
  };

  const pick = (choice: 'a' | 'b') => {
    if (!round || picked) return;
    setPicked(choice);
    const ok = choice === round.answer;
    setScore((s) => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1 }));
    record(
      createEvent('exercise.attempted', {
        exerciseId: `pair.${soundId}.${round.pair}`,
        skill: 'listening',
        level: profile.level as Level,
        score: ok ? 1 : 0,
        patternId: `pron-${soundId}`,
      }),
    );
  };

  if (!round) {
    return (
      <button type="button" className="btn accent block" onClick={newRound}>
        <Shuffle size={18} /> Test your ear
      </button>
    );
  }
  const pair = pairs[round.pair]!;
  return (
    <div className="card stack">
      <div className="spread">
        <strong>Which one did you hear?</strong>
        <span className="small muted">
          {score.right}/{score.total}
        </span>
      </div>
      <button type="button" className="btn small" onClick={() => play(round)}>
        Play again
      </button>
      <div className="choice-grid">
        {(['a', 'b'] as const).map((k) => (
          <button
            key={k}
            type="button"
            className={`choice${picked ? (k === round.answer ? ' correct' : k === picked ? ' wrong' : '') : ''}`}
            onClick={() => pick(k)}
            lang="nl"
          >
            {pair[k].nl}
            <span className="small muted" lang="en">
              {' '}
              ({pair[k].en})
            </span>
          </button>
        ))}
      </div>
      {picked && (
        <>
          <p className="small" style={{ margin: 0 }}>
            {pair.contrast}
          </p>
          <button type="button" className="btn primary" onClick={newRound}>
            Next
          </button>
        </>
      )}
    </div>
  );
}

export default function SoundCoach() {
  const { soundId = '' } = useParams();
  const sound = getSound(soundId);
  const { profile } = useApp();
  if (!sound) {
    return (
      <>
        <Header title="Sound not found" back="/practice/pronunciation" />
        <Empty title="This sound module doesn't exist." />
      </>
    );
  }
  return (
    <div className="stack-lg">
      <Header title={sound.title} subtitle={`${sound.spelling.join(', ')} · /${sound.ipa}/`} back="/practice/pronunciation" />

      <section className="card tint stack" style={{ gap: 6 }}>
        <strong>How to make it</strong>
        <p style={{ margin: 0 }}>{sound.howTo}</p>
        <p className="small" style={{ margin: 0 }}>
          <strong>For English speakers:</strong> {sound.englishHint}
        </p>
      </section>

      <section className="stack">
        <h2>Hear the difference</h2>
        <ul className="list">
          {sound.minimalPairs.map((p, i) => (
            <li key={i} className="list-item" style={{ cursor: 'default', flexWrap: 'wrap' }}>
              <div className="row grow">
                <AudioButton text={p.a.nl} id={`pair-a-${i}`} />
                <div>
                  <Nl>{p.a.nl}</Nl>
                  <div className="tiny muted">{p.a.en}</div>
                </div>
              </div>
              <div className="row grow">
                <AudioButton text={p.b.nl} id={`pair-b-${i}`} />
                <div>
                  <Nl>{p.b.nl}</Nl>
                  <div className="tiny muted">{p.b.en}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <PairQuiz soundId={sound.id} pairs={sound.minimalPairs} />
      </section>

      <section className="stack">
        <h2>Say it</h2>
        {sound.practice.map((item) => (
          <SayIt key={item.nl} target={item.nl} en={item.en} level={profile.level} />
        ))}
      </section>

      <section className="stack">
        <h2>Watch out for</h2>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {sound.commonMistakes.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
        {sound.regionalNote && <p className="small muted">{sound.regionalNote}</p>}
      </section>
    </div>
  );
}
