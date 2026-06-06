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

const PROFILE_FIELD_LABEL_WIDTHS = [
  'w-24',
  'w-24',
  'w-24',
  'w-32',
  'w-28',
  'w-24',
];

function FormFieldRow({ labelWidth }: { labelWidth: string }) {
  return (
    <div className='space-y-2'>
      <Skeleton variant='onCard' className={`h-[14px] ${labelWidth}`} />
      <Skeleton variant='onCard' className='h-9 w-full' />
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
              <div className='h-max'>
                <Skeleton variant='onCard' className='mb-2 h-4 w-24' />
                <div className='flex flex-col gap-2 lg:min-w-[300px]'>
                  <Skeleton
                    variant='onCard'
                    className='relative h-[200px] w-full rounded-lg'
                  />
                  <div className='flex w-full items-center gap-2 self-end sm:max-w-[350px]'>
                    <Skeleton
                      variant='onCard'
                      className='h-9 w-full rounded-lg'
                    />
                    <Skeleton variant='onCard' className='size-10 rounded-lg' />
                  </div>
                </div>
              </div>

              <div className='flex w-full flex-col gap-8'>
                {PROFILE_FIELD_LABEL_WIDTHS.map((labelWidth, i) => (
                  <FormFieldRow key={i} labelWidth={labelWidth} />
                ))}
              </div>
            </div>

            <div className='mt-4 flex w-full justify-end'>
              <Skeleton variant='onCard' className='h-10 w-40' />
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
            <Skeleton variant='onCard' className='h-[22px] w-16' />
            <Skeleton variant='onCard' className='h-[22px] w-12' />
          </div>
          <FormFieldRow labelWidth='w-24' />
        </CardContent>
      </Card>
    </div>
  );
}
