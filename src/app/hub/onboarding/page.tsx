import { Suspense } from 'react';
import { headers } from 'next/headers';
import { getOnboardingData } from '@/server/dto';
import { OnboardingWrapper } from '@/features/user/onboarding/components/onboarding-wrapper';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingSkeleton />}>
      <OnboardingContent />
    </Suspense>
  );
}

async function OnboardingContent() {
  const onboardingData = await getOnboardingData(await headers());
  return <OnboardingWrapper initialData={onboardingData} />;
}

function OnboardingSkeleton() {
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
        <CardContent className='h-[calc(100vh-220px)] space-y-8 md:h-[460px]'>
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
