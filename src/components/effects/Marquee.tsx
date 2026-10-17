import { useRef, useEffect, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';

interface MarqueeProps {
  children: ReactNode;
  speed?: number;
  reversed?: boolean;
  className?: string;
}

export default function Marquee({ children, speed = 30, reversed = false, className = '' }: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    const firstChild = containerRef.current?.children[0] as HTMLElement | undefined;
    if (!firstChild) return;
    const ro = new ResizeObserver(() => setContentWidth(firstChild.offsetWidth));
    ro.observe(firstChild);
    return () => ro.disconnect();
  }, []);

  const duration = contentWidth > 0 ? contentWidth / speed : 20;

  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        ref={containerRef}
        className="flex flex-shrink-0"
        animate={contentWidth > 0 ? { x: reversed ? [0, -contentWidth] : [-contentWidth, 0] } : undefined}
        transition={{
          x: {
            duration,
            repeat: Infinity,
            ease: 'linear',
          },
        }}
      >
        <div className="flex flex-shrink-0">{children}</div>
        <div className="flex flex-shrink-0">{children}</div>
      </motion.div>
    </div>
  );
}
