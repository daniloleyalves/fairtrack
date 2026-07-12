import { FairteilerDashboardGridSkeleton } from '@/features/fairteiler/dashboard/components/fairteiler-dashboard-grid-skeleton';

export default function FairteilerDashboardLoading() {
  return (
    <div className='mx-2 mt-8 mb-64 flex flex-col gap-4 sm:mx-8'>
      <h2 className='flex justify-center gap-2 font-londrina text-4xl font-bold tracking-wider text-white sm:justify-start'>
        Fairteiler Dashboard
      </h2>

      <FairteilerDashboardGridSkeleton />
    </div>
  );
}
