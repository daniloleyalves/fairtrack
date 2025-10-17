import { ProfileFormWrapper } from '@/features/fairteiler/profile/forms/fairteiler-profile-form';
import { BlurFade } from '@components/magicui/blur-fade';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Skeleton } from '@components/ui/skeleton';
import { FormErrorBoundary } from '@components/error-boundary';
import { Suspense } from 'react';

export default function FairteilerProfilePage() {
  return (
    <div className='mx-2 mt-8 mb-64 flex flex-col gap-4 sm:mx-8'>
      <div className='mb-4 flex flex-col gap-2 text-center sm:text-start'>
        <h2 className='font-londrina text-4xl font-bold tracking-wider text-white'>
          Profil
        </h2>
      </div>
      <FormErrorBoundary>
        <Suspense fallback={<FairteilerProfileFormSkeleton />}>
          <BlurFade duration={0.2}>
            <ProfileFormWrapper />
          </BlurFade>
        </Suspense>
      </FormErrorBoundary>
    </div>
  );
}

function FairteilerProfileFormSkeleton() {
  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Fairteilerprofil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-8 text-center'>
            <div className='flex flex-col gap-8 lg:flex-row-reverse'>
              {/* Thumbnail Skeleton */}
              <div className='h-max'>
                <Skeleton className='mb-2 h-4 w-24 bg-secondary' />{' '}
                {/* Label */}
                <div className='flex flex-col gap-2 lg:min-w-[300px]'>
                  <Skeleton className='relative h-[200px] w-full rounded-lg bg-secondary' />{' '}
                  {/* Image area */}
                  <div className='flex w-full items-center gap-2 self-end sm:max-w-[350px]'>
                    <Skeleton className='h-9 w-full rounded-lg bg-secondary' />{' '}
                    {/* File input / filename */}
                    <Skeleton className='size-10 rounded-lg bg-secondary' />{' '}
                    {/* X button */}
                  </div>
                </div>
              </div>

              {/* Form Fields Skeleton */}
              <div className='flex w-full flex-col gap-8'>
                {/* Name field */}
                <div className='space-y-2'>
                  <Skeleton className='h-[14px] w-24 bg-secondary' />{' '}
                  {/* Label */}
                  <Skeleton className='h-9 w-full bg-secondary' /> {/* Input */}
                </div>
                {/* Lat field */}
                <div className='space-y-2'>
                  <Skeleton className='h-[14px] w-24 bg-secondary' />{' '}
                  {/* Label */}
                  <Skeleton className='h-9 w-full bg-secondary' /> {/* Input */}
                </div>
                {/* Lon field */}
                <div className='space-y-2'>
                  <Skeleton className='h-[14px] w-24 bg-secondary' />{' '}
                  {/* Label */}
                  <Skeleton className='h-9 w-full bg-secondary' /> {/* Input */}
                </div>
                {/* Address field */}
                <div className='space-y-2'>
                  <Skeleton className='h-[14px] w-32 bg-secondary' />{' '}
                  {/* Label */}
                  <Skeleton className='h-9 w-full bg-secondary' /> {/* Input */}
                </div>
                {/* GeoLink field */}
                <div className='space-y-2'>
                  <Skeleton className='h-[14px] w-28 bg-secondary' />{' '}
                  {/* Label */}
                  <Skeleton className='h-9 w-full bg-secondary' /> {/* Input */}
                </div>
                {/* Website field */}
                <div className='space-y-2'>
                  <Skeleton className='h-[14px] w-24 bg-secondary' />{' '}
                  {/* Label */}
                  <Skeleton className='h-9 w-full bg-secondary' /> {/* Input */}
                </div>
              </div>
            </div>

            {/* Submit Button Skeleton */}
            <div className='mt-4 flex w-full justify-end'>
              <Skeleton className='h-10 w-40 bg-secondary' /> {/* Button */}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex gap-2'>
            <Skeleton className='h-[22px] w-16 bg-secondary' />
            <Skeleton className='h-[22px] w-12 bg-secondary' />
          </div>
          {/* New Tag field */}
          <div className='space-y-2'>
            <Skeleton className='h-[14px] w-24 bg-secondary' /> {/* Label */}
            <Skeleton className='h-9 w-full bg-secondary' /> {/* Input */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
