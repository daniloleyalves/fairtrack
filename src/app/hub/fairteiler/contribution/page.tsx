import { ContributionProvider } from '@/features/contribution/context/contribution-context';
import { ContributionContent } from '@/features/contribution/components/contribution-content';
import { Suspense } from 'react';
import { Skeleton } from '@ui/skeleton';
import { UserPreferencesProvider } from '@/lib/services/preferences-service';

export default function FairteilerContributionPage() {
  return (
    <Suspense fallback={<ContributionPageSkeleton />}>
      <UserPreferencesProvider>
        <ContributionProvider>
          <ContributionContent />
        </ContributionProvider>
      </UserPreferencesProvider>
    </Suspense>
  );
}

function ContributionPageSkeleton() {
  return (
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
  );
}
