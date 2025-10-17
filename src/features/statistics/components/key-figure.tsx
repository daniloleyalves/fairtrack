import { cn } from '@/lib/utils';
import { Card } from '../../../components/ui/card';
import { NumberTicker } from '../../../components/magicui/number-ticker';
import { colorClasses } from '../statistics-config';

export interface KeyFigure {
  value: number;
  description: string;
  color?: keyof typeof colorClasses;
  unit?: string;
  className?: string;
}

export function KeyFigure({
  keyFigure: { value, description, color = 'default', unit, className },
}: {
  keyFigure: KeyFigure;
}) {
  const selectedColor = colorClasses[color] || colorClasses.default;

  return (
    <Card
      className={cn(
        'flex h-full w-full items-center justify-center rounded-lg p-4 shadow-sm',
        'border-4 border-white',
        selectedColor.bg,
        className,
      )}
    >
      <div
        className={cn(
          'flex w-full flex-col items-center justify-center',
          selectedColor.text,
        )}
      >
        <div className='flex items-baseline'>
          <NumberTicker
            value={value}
            className={cn(
              'font-londrina text-5xl font-medium',
              value.toFixed(1).toString().length < 7 && 'md:text-6xl',
            )}
          />
          {unit && <span className='ml-1 font-londrina text-xl'>{unit}</span>}
        </div>
        <span className='text-center text-sm font-semibold'>{description}</span>
      </div>
    </Card>
  );
}
