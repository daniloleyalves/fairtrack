import { getFairteilerBySlug } from '@/server/fairteiler/queries';
import { getUserPreferences } from '@/server/user/queries';
import {
  getFairteilerTutorialWithSteps,
  getContributionTutorialProgress,
} from '@/server/tutorial/queries';
import { notFound } from 'next/navigation';
import { ContributionProvider } from '@/features/contribution/context/contribution-context';
import { ContributionHeader } from '@/features/contribution/components/contribution-header';
import { ContributionContent } from '@/features/contribution/components/contribution-content';
import { UserPreferencesProvider } from '@/lib/services/preferences-service';
import { DataErrorBoundary } from '@/components/error-boundary';
import { headers } from 'next/headers';
import { UnauthorizedAccess } from '@/components/unauthorized-access';
import { ContributionTutorial } from '@/features/contribution/tutorial/components/contribution-tutorial';

interface UserContributionPageProps {
  searchParams: Promise<{
    fairteilerSlug?: string;
  }>;
}

export default async function UserContributionPage({
  searchParams,
}: UserContributionPageProps) {
  const { fairteilerSlug } = await searchParams;

  if (!fairteilerSlug) {
    notFound();
  }

  const nextHeaders = await headers();

  const userPreferences = await getUserPreferences();

  if (!userPreferences?.userId) {
    return <UnauthorizedAccess />;
  }

  const fairteilerData = await getFairteilerBySlug(fairteilerSlug);

  const tutorial = await getFairteilerTutorialWithSteps(
    fairteilerData.fairteiler.id,
  );

  const tutorialProgress = await getContributionTutorialProgress(
    nextHeaders,
    fairteilerData.fairteiler.id,
  );

  return (
    <DataErrorBoundary>
      <UserPreferencesProvider initialData={userPreferences}>
        <ContributionProvider
          initialData={fairteilerData}
          trackUserLocation={true}
        >
          {!tutorial ||
          (tutorialProgress && tutorialProgress?.progress === 100) ? (
            <div className='flex min-h-screen flex-col'>
              <ContributionHeader />
              <ContributionContent />
            </div>
          ) : (
            <ContributionTutorial
              userId={userPreferences?.userId}
              fairteilerId={fairteilerData.fairteiler.id}
              initialProgress={tutorialProgress}
              steps={fairteilerData.tutorial?.steps ?? []}
            />
          )}
        </ContributionProvider>
      </UserPreferencesProvider>
    </DataErrorBoundary>
  );
}
