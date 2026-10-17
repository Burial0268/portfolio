import { useEffect, useRef, useState } from 'react';
import { animate } from 'motion';

export function useCountUp(target: number, duration: number = 1.2, trigger?: boolean): {
  ref: React.RefObject<HTMLSpanElement | null>;
  value: number;
} {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Prop-driven trigger mode (for fullpage system)
    if (trigger !== undefined) {
      if (trigger) {
        const controls = animate(0, target, {
          duration,
          ease: [0.22, 1, 0.36, 1],
          onUpdate: (latest) => setValue(Math.round(latest)),
        });
        return () => controls.stop();
      }
      setValue(0);
      return;
    }

    // IntersectionObserver mode (original behavior)
    const element = ref.current;
    if (!element || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate(0, target, {
            duration,
            ease: [0.25, 0.1, 0.25, 1],
            onUpdate: (latest) => {
              setValue(Math.round(latest));
            },
          });
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [target, duration, trigger]);

  return { ref, value };
}
