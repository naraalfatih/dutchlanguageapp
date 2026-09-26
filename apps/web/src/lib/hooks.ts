import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from './store';
import type { SpeakOptions } from './speech';

/** Voice settings from the learner's profile (region and speed) and chosen voice. */
export function useVoice(): SpeakOptions {
  const { profile, settings } = useApp();
  return { rate: profile.speechRate, region: profile.region, voiceURI: settings.voiceURI };
}

/** A short-lived status message ("Saved to review"). */
export function useToast(): [string | null, (message: string) => void] {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((text: string) => {
    setMessage(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 2500);
  }, []);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return [message, show];
}

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · Praat` : 'Praat: speak Dutch';
  }, [title]);
}
