import { Skeleton } from '@components/ui/skeleton';

export default function FairteilerProfileLoading() {
  return (
    <div className='mx-2 mt-8 mb-64 flex flex-col gap-4 sm:mx-8'>
      <div className='mb-4 flex flex-col gap-2 text-center text-white sm:text-start'>
        <h2 className='font-londrina text-4xl font-bold tracking-wider'>
          Profil
        </h2>
      </div>

      <Skeleton className='h-[484px] w-full' />
    </div>
  );
}
