import { Skeleton } from '@/components/ui/skeleton';

export default function UserSettingsLoading() {
  return (
    <div className='mx-2 mt-8 mb-64 sm:mx-8'>
      {/* Header Section */}
      <div className='mb-4 flex items-center justify-between gap-2 md:flex-row'>
        <Skeleton className='h-10 w-48 rounded-md bg-secondary' />
        <div className='hidden gap-2 md:flex'>
          <Skeleton className='h-10 w-40 rounded-md bg-secondary' />
          <Skeleton className='h-10 w-24 rounded-md bg-secondary' />
          <Skeleton className='size-10 rounded-md bg-secondary' />
        </div>
      </div>

      {/* Settings Content */}
      <div className='flex flex-col gap-4'>
        {/* User Preferences Card */}
        <Skeleton className='h-[453px] w-full rounded-lg bg-secondary' />

        {/* User Account Card */}
        <Skeleton className='h-[662px] w-full rounded-lg bg-secondary' />
      </div>
    </div>
  );
}
