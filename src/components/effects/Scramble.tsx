import { useEffect, useRef } from 'react';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>_#';
const FRAME = 45; // ms per frame (~22fps) — small glyph churn, not a luminance flash
const STEP = 1.6; // frames per resolved character

interface ScrambleProps {
  text: string;
  /** Changing this (to a truthy value) replays the decode; falsy holds the plain text */
  play: unknown;
  className?: string;
}

/*
 * HUD decode: characters churn through random glyphs and lock in left → right.
 * Written straight to textContent (no React re-render per frame); an invisible copy of the
 * final text reserves the width, so neighbours never jitter while glyph widths change.
 */
export default function Scramble({ text, play, className = '' }: ScrambleProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.textContent = text;
    if (!play || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const total = Math.ceil(text.length * STEP) + 3;
    const timer = setInterval(() => {
      frame++;
      const locked = Math.floor((frame - 3) / STEP); // a few frames of pure noise first
      el.textContent = [...text]
        .map((ch, i) => (ch === ' ' || i < locked ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
        .join('');
      if (frame >= total) {
        clearInterval(timer);
        el.textContent = text;
      }
    }, FRAME);
    return () => clearInterval(timer);
  }, [text, play]);

  return (
    <span className={`relative inline-block whitespace-nowrap ${className}`}>
      <span className="sr-only">{text}</span>
      <span className="invisible" aria-hidden="true">{text}</span>
      <span ref={ref} className="absolute left-0 top-0" aria-hidden="true">{text}</span>
    </span>
  );
}
