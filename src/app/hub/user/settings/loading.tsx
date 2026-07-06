import { CardSkeleton, Skeleton } from '@/components/ui/skeleton';

export default function UserSettingsLoading() {
  return (
    <div className='mx-2 mt-8 mb-64 sm:mx-8'>
      {/* Header Section */}
      <div className='mb-4 flex items-center justify-between gap-2 md:flex-row'>
        <Skeleton variant='onCard' className='h-10 w-48 rounded-md' />
        <div className='hidden gap-2 md:flex'>
          <Skeleton variant='onCard' className='h-10 w-40 rounded-md' />
          <Skeleton variant='onCard' className='h-10 w-24 rounded-md' />
          <Skeleton variant='onCard' className='size-10 rounded-md' />
        </div>
      </div>

      {/* Settings Content */}
      <div className='flex flex-col gap-4'>
        <CardSkeleton variant='onCard' height='h-[453px] w-full' />
        <CardSkeleton variant='onCard' height='h-[662px] w-full' />
      </div>
    </div>
  );
}
