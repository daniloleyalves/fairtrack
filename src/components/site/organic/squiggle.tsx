import { DrawPath } from '../draw-path';

/** Hand-drawn squiggle underline for section headings. */
export function Squiggle({
  className,
  stroke = '#99BB44',
  delay = 0.2,
}: {
  className?: string;
  stroke?: string;
  delay?: number;
}) {
  return (
    <DrawPath
      viewBox='0 0 120 12'
      d='M3 8 C 14 2, 26 2, 36 8 S 58 14, 68 8 S 90 2, 100 8 S 114 11, 117 6'
      stroke={stroke}
      strokeWidth={3}
      className={className}
      duration={1}
      delay={delay}
    />
  );
}
