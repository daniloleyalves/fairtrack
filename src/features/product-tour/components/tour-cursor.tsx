import { motion } from 'motion/react';
import { tourTime, type PointerKind, type TourStep } from '../tour-steps';
import { useTourFilter } from './svg-primitives';

const POINTER_PATH =
  'M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L6.35 2.85a.5.5 0 0 0-.85.36Z';

export function TourCursor({
  step,
  pointer,
}: {
  step: TourStep;
  pointer: PointerKind;
}) {
  const { cursor, clicks, duration } = step;
  const shadowFilter = useTourFilter('shadow');
  const times = cursor.times.map((t) => t / duration);

  return (
    <g>
      {clicks.map((click, i) => (
        <motion.circle
          key={`${step.id}-${i}`}
          cx={click.x}
          cy={click.y}
          fill='none'
          stroke='var(--primary)'
          strokeWidth={3}
          initial={{ r: 6, opacity: 0 }}
          animate={{ r: [6, 24, 32], opacity: [0, 0.6, 0] }}
          transition={{
            delay: tourTime(click.t),
            duration: 0.3,
            times: [0, 0.4, 1],
          }}
        />
      ))}
      <motion.g
        key={step.id}
        initial={{ x: cursor.xs[0], y: cursor.ys[0] }}
        animate={{ x: cursor.xs, y: cursor.ys }}
        transition={{
          duration: tourTime(duration),
          times,
          ease: 'easeInOut',
        }}
      >
        {pointer === 'arrow' ? (
          <path
            d={POINTER_PATH}
            transform='scale(1.15)'
            fill='var(--foreground)'
            stroke='var(--card)'
            strokeWidth={1.5}
            filter={shadowFilter}
          />
        ) : (
          <g>
            <circle
              r={13}
              fill='var(--foreground)'
              opacity={0.3}
              filter={shadowFilter}
            />
            <circle r={13} fill='none' stroke='var(--card)' strokeWidth={2} />
          </g>
        )}
      </motion.g>
    </g>
  );
}
