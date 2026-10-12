import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { MilestoneData } from './milestone-utils';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { formatDate } from 'date-fns';
import { ImageAssets } from '@/lib/assets';

export function Milestones({
  milestoneData,
}: {
  milestoneData: MilestoneData | null;
}) {
  // Only the most recent milestone is shown; earlier ones are listed in its
  // tooltip so the widget keeps a fixed size as milestones accumulate.
  const latestAchieved = milestoneData?.achieved.at(-1);

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
                    {[...milestoneData.achieved].reverse().map((milestone) => (
                      <div key={milestone.id}>
                        {milestone.quantity} Abgaben:{' '}
                        {formatDate(milestone.achievedAt ?? '', 'dd.MM.yyyy')}
                      </div>
                    ))}
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
