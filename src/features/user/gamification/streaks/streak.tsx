import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react';

export function Streak({
  streak,
}: {
  streak: {
    currentStreak: number;
    longestStreak: number;
    totalWeeksActive: number;
  };
}) {
  return (
    <div
      className={cn(
        streak.currentStreak > 0 ? '' : '',
        'flex h-9 items-center gap-1 rounded-lg bg-white/50 pr-4 text-white',
      )}
    >
      <Flame
        className={cn(
          streak.currentStreak > 0
            ? 'bg-white fill-yellow-400 text-yellow-400'
            : 'bg-secondary fill-muted-foreground text-muted-foreground',
          'size-10 -translate-x-2 rounded-full p-1',
        )}
      />
      {streak.currentStreak > 0 ? (
        <>
          <span className='font-londrina text-3xl font-medium'>
            {streak.currentStreak}
          </span>
          <span className='ml-1 font-medium'>
            {streak.currentStreak === 1 ? 'Woche Streak' : 'Wochen Streak'}
          </span>
        </>
      ) : (
        <span className='text-sm font-medium text-secondary'>Keine Streak</span>
      )}
    </div>
  );
}
