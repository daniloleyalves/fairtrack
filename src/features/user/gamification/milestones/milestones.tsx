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
                    <MilestoneStack milestones={earlierAchieved} />
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
                  <TooltipTrigger>
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
                  <TooltipTrigger>
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

const STACK_OFFSET_PX = 14;

function MilestoneStack({ milestones }: { milestones: MilestoneDisplay[] }) {
  const layers = milestones.slice(-3);

  return (
    <div
      className='relative h-14'
      style={{ width: 56 + (layers.length - 1) * STACK_OFFSET_PX }}
    >
      {layers.map((milestone, i) => (
        <div
          key={milestone.id}
          className='absolute top-0'
          style={{ left: i * STACK_OFFSET_PX }}
        >
          <MilestoneBadge
            quantity={i === layers.length - 1 ? milestone.quantity : undefined}
            achieved
          />
        </div>
      ))}
    </div>
  );
}

function MilestoneBadge({
  quantity,
  achieved = false,
}: {
  quantity?: number;
  achieved?: boolean;
}) {
  const digits = String(quantity ?? '').length;

  return (
    <div className='relative'>
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
          'absolute top-1/2 left-1/2 z-10 flex h-6 min-w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full px-1 font-bold text-white ring-2 ring-white',
          achieved ? 'bg-yellow-400' : 'bg-gray-400/80',
          digits <= 2 ? 'text-lg' : digits === 3 ? 'text-xs' : 'text-[10px]',
        )}
      >
        {quantity}
      </div>
    </div>
  );
}
