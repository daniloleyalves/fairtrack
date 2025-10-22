import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { MilestoneData } from './milestone-processor';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { formatDate } from 'date-fns';
import { ImageAssets } from '@/lib/assets';

export function Milestones({
  milestoneData,
}: {
  milestoneData: MilestoneData | null;
}) {
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
            {milestoneData?.achieved.map((milestone) => {
              return (
                <TooltipProvider key={milestone.id}>
                  <Tooltip>
                    <TooltipTrigger className='relative'>
                      <Image
                        src={ImageAssets.raupe}
                        alt='Raupe'
                        className='size-14 object-contain'
                      />
                      <div
                        className={cn(
                          'absolute top-1/2 left-1/2 z-10 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-400',
                        )}
                      >
                        <div className='text-lg font-bold text-white lg:-translate-y-[1px]'>
                          {milestone.quantity}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      Abgaben: {milestone.quantity} <br />
                      Erreicht am:{' '}
                      {formatDate(milestone.achievedAt ?? '', 'dd.MM.yyyy')}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className='relative'>
                  <Image
                    src={ImageAssets.raupe}
                    alt='Raupe'
                    className='size-14 object-contain opacity-40 grayscale filter'
                  />
                  <div
                    className={cn(
                      'absolute top-1/2 left-1/2 z-10 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-400/80',
                    )}
                  >
                    <div className='text-lg font-bold text-white lg:-translate-y-[1px]'>
                      {milestoneData?.nextMilestone?.quantity}
                    </div>
                  </div>
                  {/* <span
                    className={cn(
                      'absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-sm font-medium text-white',
                    )}
                  >
                    {milestoneData?.nextMilestone?.quantity}
                  </span>
                  <Badge
                    className={cn(
                      'size-12 fill-gray-500 text-gray-400 opacity-50',
                    )}
                  /> */}
                </TooltipTrigger>
                <TooltipContent className='text-center'>
                  Nächster Meilenstein: <br />
                  {milestoneData?.nextMilestone?.quantity} Abgaben
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}
    </>
  );
}
