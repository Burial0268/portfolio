import { useEffect, useRef, useState } from 'react';
import { TYPE_MS, DELETE_MS, CARET_HOLD_MS, sleep } from '@/lib/typewriter';

interface TypedProps {
  text: string;
  /** false clears the line (so the next entrance types it again); true types it */
  play?: boolean;
  /** ms to wait before the first key when the line is blank (entrance stagger); swaps start at once */
  delay?: number;
  className?: string;
  caretClass?: string;
}

/*
 * The watermark's typewriter, at text size. When `text` changes it backspaces only to the
 * common prefix and types the rest ("CASE 01" → "CASE 02" retypes one key), behind the
 * same accent caret. Screen readers get the full text at once.
 */
export default function Typed({ text, play = true, delay = 0, className = '', caretClass = 'bg-[#6CE5E8]' }: TypedProps) {
  const [shown, setShown] = useState('');
  const [caret, setCaret] = useState(false);
  const shownRef = useRef('');

  useEffect(() => {
    let alive = true;
    const show = (s: string) => { shownRef.current = s; setShown(s); };
    if (!play) { show(''); setCaret(false); return; }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { show(text); return; }
    (async () => {
      if (delay && !shownRef.current) await sleep(delay);
      if (!alive) return;
      setCaret(true);
      let cur = shownRef.current;
      while (alive && !text.startsWith(cur)) {
        cur = cur.slice(0, -1);
        show(cur);
        await sleep(DELETE_MS);
      }
      for (let i = cur.length + 1; alive && i <= text.length; i++) {
        show(text.slice(0, i));
        await sleep(TYPE_MS);
      }
      await sleep(CARET_HOLD_MS);
      if (alive) setCaret(false);
    })();
    return () => { alive = false; };
  }, [text, play, delay]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{shown}</span>
      {caret && (
        <span aria-hidden="true" className={`inline-block w-[0.07em] min-w-[2px] h-[0.72em] ml-[0.06em] animate-blink ${caretClass}`} />
      )}
    </span>
  );
}
