import { ContributionProvider } from '@/features/contribution/context/contribution-context';
import { ContributionContent } from '@/features/contribution/components/contribution-content';
import { ContributionPageSkeleton } from '@/features/contribution/components/contribution-page-skeleton';
import { Suspense } from 'react';
import { UserPreferencesProvider } from '@/lib/services/preferences-service';
import { DataErrorBoundary } from '@/components/error-boundary';
import { headers } from 'next/headers';
import { getSession } from '@/server/user/queries';

export default async function FairteilerContributionPage() {
  const session = await getSession(await headers());
  return (
    <DataErrorBoundary>
      <Suspense fallback={<ContributionPageSkeleton />}>
        <UserPreferencesProvider>
          <ContributionProvider
            user={session ? session.user : null}
            pendingFallback={<ContributionPageSkeleton />}
          >
            <ContributionContent />
          </ContributionProvider>
        </UserPreferencesProvider>
      </Suspense>
    </DataErrorBoundary>
  );
}
