import { Suspense } from 'react';
import { headers } from 'next/headers';
import { getOnboardingData } from '@/server/user/queries';
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
            <Skeleton variant='onCard' className='h-4 w-20' />
          </div>
          <Skeleton variant='onCard' className='h-2 w-full rounded-full' />
        </CardHeader>
        <Separator />
        <CardContent className='h-[calc(100vh-220px)] space-y-8 md:h-[460px]'>
          <Skeleton variant='onCard' className='mx-auto mt-4 h-10 w-3/4' />

          <div className='mx-auto max-w-2xl space-y-2'>
            <Skeleton variant='onCard' className='h-4 w-full' />
            <Skeleton variant='onCard' className='mx-auto h-4 w-5/6' />
          </div>

          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='space-y-3'>
                  <Skeleton
                    variant='onCard'
                    className='h-32 w-full rounded-lg'
                  />
                  <Skeleton variant='onCard' className='h-4 w-3/4' />
                  <Skeleton variant='onCard' className='h-3 w-1/2' />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <Separator />
        <CardFooter className='z-50 flex justify-between'>
          <Skeleton variant='onCard' className='h-10 w-20' />
          <div className='flex gap-2'>
            <Skeleton variant='onCard' className='h-10 w-24' />
            <Skeleton variant='onCard' className='h-10 w-16' />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
