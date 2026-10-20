import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import Typed from './Typed';

/*
 * HUD cursor: a square reticle that turns 45° over anything clickable. Elements can name their action with
 * `data-cursor="VIEW"` — the label rides beside the reticle in an accent tag and is typed in, like everything else.
 * An empty `data-cursor=""` blocks a label inherited from an ancestor (e.g. the photo inside the closable lightbox).
 */
export default function Cursor() {
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState('');

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 900, damping: 50, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 900, damping: 50, mass: 0.4 });

  useEffect(() => {
    // Only show custom cursor on devices with a fine pointer (mouse)
    const mq = window.matchMedia('(pointer: fine)');
    setHasFinePointer(mq.matches);

    const handler = (e: MediaQueryListEvent) => setHasFinePointer(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!hasFinePointer) return;

    // Show on first move — `mouseenter` never fires on document, which left the cursor invisible
    const handleMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    const handleLeave = () => setVisible(false);
    const read = (t: HTMLElement | null) => {
      if (!t) return;
      const action = t.closest?.('a, button, .interactive, [data-cursor]') as HTMLElement | null;
      setHovering(!!action && !action.matches(':disabled'));
      const tagged = t.closest?.('[data-cursor]') as HTMLElement | null;
      setLabel(tagged && !tagged.matches(':disabled') ? tagged.dataset.cursor ?? '' : '');
    };
    const handleOver = (e: Event) => read(e.target as HTMLElement);
    // A page turn / slide swap can pull the element out from under a still pointer without any mouseover,
    // so re-read whatever is under the pointer now and then
    const recheck = setInterval(() => {
      const px = x.get(), py = y.get();
      if (px >= 0) read(document.elementFromPoint(px, py) as HTMLElement | null);
    }, 300);

    window.addEventListener('pointermove', handleMove);
    document.documentElement.addEventListener('mouseleave', handleLeave);
    document.addEventListener('mouseover', handleOver);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      document.documentElement.removeEventListener('mouseleave', handleLeave);
      document.removeEventListener('mouseover', handleOver);
      clearInterval(recheck);
    };
  }, [hasFinePointer, x, y]);

  // Don't render on touch devices
  if (!hasFinePointer) return null;

  // Portal to body: App's fixed wrapper is its own stacking context, which would put the cursor under body-level overlays (lightbox)
  return createPortal(
    <>
      <motion.div
        className="fixed left-0 top-0 w-4 h-4 border border-[#6CE5E8] pointer-events-none z-[9999] mix-blend-difference"
        style={{ x: springX, y: springY, translateX: '-50%', translateY: '-50%' }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: hovering ? 1.6 : 1,
          rotate: hovering ? 45 : 0,
          backgroundColor: hovering ? 'rgba(108,229,232,0.2)' : 'rgba(108,229,232,0)',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      />
      {/* Action tag — hangs off the reticle's lower-right corner; the label is typed in */}
      <motion.div className="fixed left-0 top-0 pointer-events-none z-[9999]" style={{ x: springX, y: springY }}>
        <AnimatePresence>
          {visible && label && (
            <motion.div
              key={label}
              className="absolute left-4 top-4 bg-[#6CE5E8] px-1.5 py-1 font-bebas text-[12px] leading-none tracking-[0.12em] text-[#0A0A0A] whitespace-nowrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Typed text={label} caretClass="bg-[#0A0A0A]" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>,
    document.body,
  );
}
