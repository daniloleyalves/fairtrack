'use client';

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

interface LeafSpec {
  top: string;
  left: number;
  rotate: number;
  /** progress (0-1) at which the leaf unfolds */
  at: number;
  flip?: boolean;
}

const LEAVES: LeafSpec[] = [
  { top: '10%', left: 46, rotate: 35, at: 0.1 },
  { top: '24%', left: 12, rotate: -40, at: 0.24, flip: true },
  { top: '39%', left: 44, rotate: 20, at: 0.39 },
  { top: '54%', left: 10, rotate: -25, at: 0.54, flip: true },
  { top: '70%', left: 46, rotate: 45, at: 0.7 },
  { top: '85%', left: 14, rotate: -35, at: 0.85, flip: true },
];

/**
 * A vine that grows along the page edge as the wrapped content scrolls by.
 * Place inside a `relative` container; spans its full height.
 */
export function GrowingVine({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.75'],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 70, damping: 22 });

  return (
    <div
      ref={ref}
      aria-hidden='true'
      className={cn(
        'pointer-events-none absolute inset-y-0 left-2 hidden w-20 xl:block',
        className,
      )}
    >
      <svg
        className='size-full'
        viewBox='0 0 80 1000'
        preserveAspectRatio='none'
        fill='none'
      >
        <motion.path
          d='M40 0 C 68 90, 12 170, 40 260 S 72 430, 40 510 S 10 670, 40 760 S 66 910, 40 1000'
          stroke='#446622'
          strokeWidth={4}
          strokeLinecap='round'
          style={{ pathLength: reducedMotion ? 1 : progress }}
        />
      </svg>
      {LEAVES.map((leaf) => (
        <Leaf
          key={leaf.top}
          leaf={leaf}
          progress={progress}
          reducedMotion={!!reducedMotion}
        />
      ))}
    </div>
  );
}

function Leaf({
  leaf,
  progress,
  reducedMotion,
}: {
  leaf: LeafSpec;
  progress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const grow = useTransform(progress, [leaf.at, leaf.at + 0.07], [0, 1]);
  const scale = reducedMotion ? 1 : grow;

  return (
    <motion.svg
      viewBox='0 0 24 24'
      className='absolute w-6 origin-bottom'
      style={{
        top: leaf.top,
        left: leaf.left,
        scale,
        rotate: leaf.rotate,
        scaleX: leaf.flip ? -1 : 1,
      }}
    >
      <path
        d='M12 22 C 4 14, 5 5, 12 2 C 19 5, 20 14, 12 22 Z'
        fill='#99BB44'
      />
      <path
        d='M12 20 C 12 14, 12 9, 12 4'
        stroke='#446622'
        strokeWidth={1.2}
        strokeLinecap='round'
        fill='none'
      />
    </motion.svg>
  );
}
