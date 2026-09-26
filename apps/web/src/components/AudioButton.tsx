import { Pause, Volume2 } from 'lucide-react';
import { useRef } from 'react';
import { useVoice } from '../lib/hooks';
import { speak, stopSpeaking, ttsSupported, useSpeakingKey } from '../lib/speech';

interface Props {
  text: string;
  /** Distinguishes identical texts on one screen (for the playing state). */
  id?: string;
  label?: string;
  speaker?: number;
  slow?: boolean;
}

/**
 * ▶ Tap to play at the learner's speed; long-press (or `slow`) plays slowly.
 * Real speed is the default: learners must get used to how Dutch actually sounds.
 */
export function AudioButton({ text, id, label, speaker, slow }: Props) {
  const voice = useVoice();
  const key = id ?? text;
  const playing = useSpeakingKey() === key;
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);

  if (!ttsSupported()) return null;

  const play = (slowly: boolean) => {
    if (playing) return stopSpeaking();
    const rate = (voice.rate ?? 1) * (slowly ? 0.7 : 1);
    void speak(text, { ...voice, rate, ...(speaker !== undefined ? { speaker } : {}) }, key);
  };

  return (
    <button
      type="button"
      className={`icon-btn play${playing ? ' playing' : ''}`}
      aria-label={playing ? 'Stop' : (label ?? `Play: ${text}`)}
      title="Tap to play · hold for slow"
      onPointerDown={() => {
        longPressed.current = false;
        pressTimer.current = setTimeout(() => {
          longPressed.current = true;
          play(true);
        }, 450);
      }}
      onPointerUp={() => pressTimer.current && clearTimeout(pressTimer.current)}
      onPointerLeave={() => pressTimer.current && clearTimeout(pressTimer.current)}
      onContextMenu={(e) => e.preventDefault()}
      onClick={() => {
        if (longPressed.current) return;
        play(slow ?? false);
      }}
    >
      {playing ? <Pause size={18} /> : <Volume2 size={18} />}
    </button>
  );
}
