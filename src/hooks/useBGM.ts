import { useState, useEffect, useRef, useCallback } from 'react';

export function useBGM() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceCreated = useRef(false);
  const [playing, setPlaying] = useState(false);
  const hasInteracted = useRef(false);

  const ensureAudioContext = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || sourceCreated.current) return;

    const ctx = new AudioContext();
    const source = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;

    source.connect(analyser);
    analyser.connect(ctx.destination);

    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    sourceCreated.current = true;
  }, []);

  useEffect(() => {
    const audio = new Audio('/bgm.mp3');
    audio.preload = 'none'; // 7.5MB: fetch on first play, not at page load
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    const startOnInteraction = (e: Event) => {
      if (hasInteracted.current) return;
      hasInteracted.current = true;
      events.forEach(ev => window.removeEventListener(ev, startOnInteraction));
      // The BGM button's own click toggles playback — autoplaying here would make it pause instantly
      if ((e.target as Element | null)?.closest?.('[data-bgm-toggle]')) return;
      ensureAudioContext();
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      audio.play().then(() => setPlaying(true)).catch(() => {});
    };

    // Only events that grant user activation — wheel/scroll would make play() reject
    const events = ['pointerdown', 'keydown', 'touchend'];
    events.forEach(e => window.addEventListener(e, startOnInteraction));

    return () => {
      events.forEach(e => window.removeEventListener(e, startOnInteraction));
      audio.pause();
      audio.src = '';
      audioCtxRef.current?.close();
    };
  }, [ensureAudioContext]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    ensureAudioContext();
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    if (audio.paused) {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setPlaying(false);
    }
  }, [ensureAudioContext]);

  return { playing, toggle, analyserRef };
}
