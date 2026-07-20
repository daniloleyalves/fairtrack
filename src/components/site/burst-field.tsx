'use client';

import { useLayoutEffect, useRef } from 'react';

/**
 * Explodes its absolutely-positioned children outward from the container
 * center to their layout positions once on mount. Children keep their own
 * classes and CSS animations; the burst only borrows the transform for its
 * short flight. Hidden until mount so the first paint starts centered.
 */
export function BurstField({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = ref.current;
    if (!container) return;
    container.style.opacity = '1';
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cx = container.clientWidth / 2;
    const cy = container.clientHeight / 2;
    Array.from(container.children).forEach((child, i) => {
      const el = child as HTMLElement;
      if (!el.offsetWidth) return;
      const dx = cx - (el.offsetLeft + el.offsetWidth / 2);
      const dy = cy - (el.offsetTop + el.offsetHeight / 2);
      // CSS animations (float/sway) outrank script animations for the
      // transform property, so silence them for the flight. The flight
      // animates the individual translate/scale properties, which compose
      // BEFORE the rotate property — using `transform` instead would move
      // rotated items (leaves, diamonds) along their rotated axes.
      el.style.animationName = 'none';
      // data-spin items tumble into their final orientation while flying.
      const rot = parseFloat(getComputedStyle(el).rotate) || 0;
      const spin = 'spin' in el.dataset ? (i % 2 ? 200 : -200) : 0;
      const flight = el.animate(
        [
          {
            translate: `${dx}px ${dy}px`,
            scale: '0.2',
            rotate: `${rot - spin}deg`,
            opacity: 0,
          },
          { opacity: 1, offset: 0.25 },
          {
            translate: '0px 0px',
            scale: '1',
            rotate: `${rot}deg`,
            opacity: 1,
          },
        ],
        {
          delay: i * 35,
          duration: 600,
          easing: 'cubic-bezier(0.2, 1.4, 0.4, 1)',
          fill: 'backwards',
        },
      );
      flight.onfinish = () => {
        el.style.animationName = '';
      };
    });
  }, []);

  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute inset-0 opacity-0 ${className ?? ''}`}
    >
      {children}
    </div>
  );
}
