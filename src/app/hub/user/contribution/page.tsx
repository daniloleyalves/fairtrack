import {
  getFairteilerBySlug,
  getFairteilerTutorialWithSteps,
} from '@/server/dto';
import { notFound } from 'next/navigation';
import { ContributionProvider } from '@/features/contribution/context/contribution-context';
import { ContributionHeader } from '@/features/contribution/components/contribution-header';
import { ContributionContent } from '@/features/contribution/components/contribution-content';
import { UserPreferencesProvider } from '@/lib/services/preferences-service';
import {
  getUserPreferences,
  getContributionTutorialProgress,
} from '@/server/dto';
import { headers } from 'next/headers';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import { UnauthorizedAccess } from '@/components/unauthorized-access';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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

  const userPreferences = await getUserPreferences(nextHeaders);

  if (!userPreferences?.userId) {
    return <UnauthorizedAccess />;
  }

  const fairteilerData = await getFairteilerBySlug(fairteilerSlug);

  const tutorial = await getFairteilerTutorialWithSteps(
    nextHeaders,
    fairteilerData.fairteiler.id,
  );

  const tutorialProgress = await getContributionTutorialProgress(
    nextHeaders,
    fairteilerData.fairteiler.id,
  );

  return (
    <Suspense
      fallback={
        tutorialProgress && tutorialProgress?.progress === 100 ? (
          <ContributionPageSkeleton />
        ) : (
          <ContributionTutorialSkeleton />
        )
      }
    >
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
    </Suspense>
  );
}

function ContributionPageSkeleton() {
  return (
    <>
      <Skeleton className='h-[81px] w-full rounded-none' />
      <div className='m-8'>
        <div className='mb-4 flex flex-col items-center gap-2 text-center text-white sm:flex-row sm:justify-between sm:text-start'>
          <Skeleton className='h-9 w-[223px]' />

          <div className='mt-2 flex flex-wrap gap-2 self-center sm:self-start'>
            <Skeleton className='h-9 w-[114px]' />
            <Skeleton className='h-9 sm:w-9 md:w-[232px]' />
          </div>
        </div>
        <Skeleton className='mt-2 h-[398px] flex-1' />
      </div>
    </>
  );
}

function ContributionTutorialSkeleton() {
  return (
    <div className='flex min-h-screen justify-center p-2 sm:items-center'>
      <Card className='w-full max-w-4xl'>
        <CardHeader className='space-y-4 text-center'>
          <div className='flex items-center justify-between text-sm text-muted-foreground'>
            <Skeleton className='h-4 w-20 bg-secondary' />
          </div>
          <Skeleton className='h-2 w-full rounded-full bg-secondary' />
        </CardHeader>
        <Separator />
        <CardContent className='h-[calc(100vh-220px)] space-y-8 md:h-[400px]'>
          {/* Title skeleton */}
          <Skeleton className='mx-auto mt-4 h-10 w-3/4 bg-secondary' />

          {/* Description skeleton */}
          <div className='mx-auto max-w-2xl space-y-2'>
            <Skeleton className='h-4 w-full bg-secondary' />
            <Skeleton className='mx-auto h-4 w-5/6 bg-secondary' />
          </div>

          {/* Content area skeleton */}
          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='space-y-3'>
                  <Skeleton className='h-32 w-full rounded-lg bg-secondary' />
                  <Skeleton className='h-4 w-3/4 bg-secondary' />
                  <Skeleton className='h-3 w-1/2 bg-secondary' />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <Separator />
        <CardFooter className='z-50 flex justify-between'>
          {/* Back button skeleton */}
          <Skeleton className='h-10 w-20 bg-secondary' />

          <div className='flex gap-2'>
            {/* Skip button skeleton */}
            <Skeleton className='h-10 w-24 bg-secondary' />
            {/* Next button skeleton */}
            <Skeleton className='h-10 w-16 bg-secondary' />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
