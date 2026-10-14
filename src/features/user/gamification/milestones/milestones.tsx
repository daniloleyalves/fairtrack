import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { MilestoneData, MilestoneDisplay } from './milestone-utils';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { formatDate } from 'date-fns';
import { ImageAssets } from '@/lib/assets';

export function Milestones({
  milestoneData,
}: {
  milestoneData: MilestoneData | null;
}) {
  const latestAchieved = milestoneData?.achieved.at(-1);
  const earlierAchieved = milestoneData?.achieved.slice(0, -1) ?? [];

  return (
    <>
      {milestoneData && (
        <div className='h-max w-full rounded-lg bg-white px-2 py-4 shadow-sm'>
          <div
            className={cn(
              'mb-2 flex w-full flex-col gap-2 text-center text-xs font-medium',
            )}
          >
            <span className='truncate xl:overflow-visible'>Meilensteine</span>
            <span className='truncate text-xs font-medium text-secondary-foreground/40'>
              (Abgaben)
            </span>
          </div>
          <div className='mt-4 flex items-center justify-center gap-2 md:flex-col md:gap-0'>
            {earlierAchieved.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger
                    aria-label={`${earlierAchieved.length} frühere Meilensteine`}
                  >
                    <MilestoneStack count={earlierAchieved.length} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <AchievementList milestones={earlierAchieved} />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {latestAchieved && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className='relative'>
                    <MilestoneBadge
                      quantity={latestAchieved.quantity}
                      achieved
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <AchievementList milestones={[latestAchieved]} />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {milestoneData.nextMilestone && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className='relative'>
                    <MilestoneBadge
                      quantity={milestoneData.nextMilestone.quantity}
                    />
                  </TooltipTrigger>
                  <TooltipContent className='text-center'>
                    Nächster Meilenstein: <br />
                    {milestoneData.nextMilestone.quantity} Abgaben
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function AchievementList({ milestones }: { milestones: MilestoneDisplay[] }) {
  return [...milestones].reverse().map((milestone) => (
    <div key={milestone.id}>
      {milestone.quantity} Abgaben:{' '}
      {formatDate(milestone.achievedAt ?? '', 'dd.MM.yyyy')}
    </div>
  ));
}

function MilestoneStack({ count }: { count: number }) {
  const layers = Math.min(count, 3);

  return (
    <div className='relative size-14'>
      {Array.from({ length: layers }, (_, i) => (
        <Image
          key={i}
          src={ImageAssets.raupe}
          alt='Raupe'
          className='absolute size-12 object-contain'
          style={{ left: i * 4, top: (layers - 1 - i) * 4 }}
        />
      ))}
    </div>
  );
}

function MilestoneBadge({
  quantity,
  achieved = false,
}: {
  quantity: number;
  achieved?: boolean;
}) {
  const digits = String(quantity).length;

  return (
    <>
      <Image
        src={ImageAssets.raupe}
        alt='Raupe'
        className={cn(
          'size-14 object-contain',
          !achieved && 'opacity-40 grayscale filter',
        )}
      />
      <div
        className={cn(
          'absolute top-1/2 left-1/2 z-10 flex h-6 min-w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full px-1 font-bold text-white',
          achieved ? 'bg-yellow-400' : 'bg-gray-400/80',
          digits <= 2 ? 'text-lg' : digits === 3 ? 'text-xs' : 'text-[10px]',
        )}
      >
        {quantity}
      </div>
    </>
  );
}
