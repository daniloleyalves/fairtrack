import { Skeleton } from '@ui/skeleton';

export default function Loading() {
  return (
    <div className='flex min-h-screen flex-col'>
      {/* Contribution header bar */}
      <div className='flex items-center gap-3 rounded-b-lg border-b bg-card p-4 sm:gap-4'>
        <Skeleton variant='onCard' className='h-8 w-20' />
        <div className='flex-1 space-y-2'>
          <Skeleton variant='onCard' className='h-6 w-48' />
          <Skeleton variant='onCard' className='h-4 w-32' />
        </div>
      </div>

      {/* Retteformular content */}
      <div className='mx-2 mt-8 mb-64 flex flex-col gap-3 sm:mx-8'>
        <div className='mb-4 flex flex-col items-center gap-2 text-center text-white sm:flex-row sm:justify-between sm:text-start'>
          <Skeleton className='h-9 w-[223px]' />
          <div className='mt-2 flex flex-wrap gap-2 self-center sm:self-start'>
            <Skeleton className='h-9 w-[114px]' />
            <Skeleton className='h-9 sm:w-9 md:w-[232px]' />
          </div>
        </div>
        <Skeleton className='mt-2 h-[398px]' />
      </div>
    </div>
  );
}
