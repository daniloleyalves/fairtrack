'use client';

import { motion, useReducedMotion } from 'motion/react';

interface DrawPathProps {
  d: string;
  viewBox: string;
  stroke: string;
  strokeWidth: number;
  className?: string;
  delay?: number;
  duration?: number;
}

export function DrawPath({
  d,
  viewBox,
  stroke,
  strokeWidth,
  className,
  delay = 0,
  duration = 1.8,
}: DrawPathProps) {
  const reducedMotion = useReducedMotion();

  return (
    <svg viewBox={viewBox} fill='none' className={className} aria-hidden='true'>
      <motion.path
        d={d}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}
