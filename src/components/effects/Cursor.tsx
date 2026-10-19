import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useMotionValue, useSpring } from 'motion/react';

export default function Cursor() {
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);

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
    const handleOver = (e: Event) => {
      setHovering(!!(e.target as HTMLElement).closest?.('a, button, .interactive'));
    };

    window.addEventListener('pointermove', handleMove);
    document.documentElement.addEventListener('mouseleave', handleLeave);
    document.addEventListener('mouseover', handleOver);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      document.documentElement.removeEventListener('mouseleave', handleLeave);
      document.removeEventListener('mouseover', handleOver);
    };
  }, [hasFinePointer, x, y]);

  // Don't render on touch devices
  if (!hasFinePointer) return null;

  // Portal to body: App's fixed wrapper is its own stacking context, which would put the cursor under body-level overlays (lightbox)
  return createPortal(
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
    />,
    document.body,
  );
}
