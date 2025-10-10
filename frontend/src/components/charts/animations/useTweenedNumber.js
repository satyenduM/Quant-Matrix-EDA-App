import { useEffect, useRef, useState } from 'react';

const Easings = {
  linear: (t) => t,
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
};

/**
 * Tween a number from its current value to target over a duration.
 * Commonly used to animate chart axis auto-scaling.
 *
 * @param {number} target - target numeric value
 * @param {number} duration - ms, default 400
 * @param {keyof typeof Easings} easing - easing name, default 'easeOutCubic'
 * @returns {number} animated value
 */
export default function useTweenedNumber(target, duration = 400, easing = 'easeOutCubic') {
  const [value, setValue] = useState(Number(target) || 0);
  const rafRef = useRef(null);
  const startTimeRef = useRef(0);
  const startValueRef = useRef(Number(target) || 0);

  useEffect(() => {
    const to = Number(target) || 0;
    const from = value;
    const easeFn = Easings[easing] || Easings.easeOutCubic;

    if (duration <= 0 || !Number.isFinite(to)) {
      setValue(to);
      return undefined;
    }

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    startValueRef.current = from;
    startTimeRef.current = performance.now();

    const tick = (now) => {
      const elapsed = now - startTimeRef.current;
      const t = Math.min(1, elapsed / duration);
      const eased = easeFn(t);
      const next = startValueRef.current + (to - startValueRef.current) * eased;
      setValue(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // We deliberately depend on [target, duration, easing] and current value to restart smoothly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, easing]);

  return value;
}
