import { CardSkeleton, Skeleton } from '@/components/ui/skeleton';

export default function UserSettingsLoading() {
  return (
    <div className='mx-2 mt-8 mb-64 sm:mx-8'>
      {/* Header Section */}
      <Skeleton variant='onCard' className='mb-4 h-10 w-48 rounded-md' />

      {/* Settings Content */}
      <div className='flex flex-col gap-4'>
        <CardSkeleton variant='onCard' height='h-[453px] w-full' />
        <CardSkeleton variant='onCard' height='h-[662px] w-full' />
      </div>
    </div>
  );
}
