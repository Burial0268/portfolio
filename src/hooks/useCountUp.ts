import { useEffect, useState } from 'react';
import { animate } from 'motion';

// Counts 0 → target while `trigger` is true; resets to 0 when it turns false
export function useCountUp(target: number, duration: number, trigger: boolean): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!trigger) {
      setValue(0);
      return;
    }
    const controls = animate(0, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [target, duration, trigger]);

  return value;
}
