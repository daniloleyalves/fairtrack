import { DataErrorBoundary } from '@/components/error-boundary';
import { BlurFade } from '@/components/magicui/blur-fade';
import { UserNav } from '@/components/nav/user-nav';
import { Skeleton } from '@/components/ui/skeleton';
import { UnauthorizedAccess } from '@/components/unauthorized-access';
import UserDashboardWrapper from '@/features/user/dashboard/user-dashboard-wrapper';
import {
  checkMilestoneProgressForCurrentUser,
  getSession,
  getUserPreferences,
  getUserStreak,
} from '@/server/dto';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { Streak } from '@/features/user/gamification/streaks/streak';
import { NavButton } from '@/components/ui/nav-button';
import { Card } from '@/components/ui/card';

export default async function UserDashboardPage() {
  const nextHeaders = await headers();
  const auth = await getSession(nextHeaders);
  const user = auth?.user;
  if (!user) {
    return <UnauthorizedAccess />;
  }

  const userPreferences = await getUserPreferences(nextHeaders);
  let userStreak = null;

  if (userPreferences?.enableStreaks) {
    userStreak = await getUserStreak(nextHeaders);
  }
  await checkMilestoneProgressForCurrentUser(nextHeaders);

  return (
    <div className='mx-2 mt-8 mb-64 sm:mx-8'>
      <div className='mb-8 flex items-center justify-between gap-2 md:mb-4 md:flex-row'>
        <div className='flex w-full flex-col items-center gap-4 md:flex-row md:gap-6 lg:w-auto'>
          <h2 className='flex items-center gap-2 font-londrina text-4xl font-bold tracking-wider text-white'>
            <BlurFade delay={0.1}>
              <h3>Hallo</h3>
            </BlurFade>
            <BlurFade delay={0.2}>
              <h3>{user.firstName}!</h3>
            </BlurFade>
          </h2>
          {userStreak && (
            <BlurFade delay={0.25}>
              <Streak streak={userStreak} />
            </BlurFade>
          )}
        </div>
        <div className='hidden gap-2 md:flex'>
          {auth.session.activeOrganizationId && (
            <>
              {!user.email.includes('guest') &&
                !user.email.includes('employee') && (
                  <BlurFade delay={0.15}>
                    <div className='hidden lg:block'>
                      <NavButton
                        title='Fairteiler Dashboard'
                        href='/hub/fairteiler/dashboard'
                        icon='Coffee'
                        variant='secondary'
                        size='lg'
                      />
                    </div>
                    <div className='lg:hidden'>
                      <NavButton
                        href='/hub/fairteiler/dashboard'
                        icon='Coffee'
                        variant='secondary'
                        size='icon'
                      />
                    </div>
                  </BlurFade>
                )}

              {(user.email.includes('guest') ||
                user.email.includes('employee')) && (
                <BlurFade delay={0.15}>
                  <div className='hidden lg:block'>
                    <NavButton
                      title='Retteformular'
                      href='/hub/fairteiler/contribution'
                      icon='ClipboardList'
                      variant='secondary'
                      size='lg'
                    />
                  </div>
                  <div className='lg:hidden'>
                    <NavButton
                      href='/hub/fairteiler/contribution'
                      icon='ClipboardList'
                      variant='secondary'
                      size='icon'
                    />
                  </div>
                </BlurFade>
              )}
            </>
          )}
          <BlurFade delay={0.17}>
            <NavButton
              title='Fairteiler finden'
              href='/hub/user/fairteiler-finder'
              icon='Map'
              variant='tertiary'
              size='lg'
            />
          </BlurFade>
          <BlurFade delay={0.2}>
            <UserNav user={user} routeKey='userRoutes' />
          </BlurFade>
        </div>
      </div>
      <DataErrorBoundary>
        <Suspense fallback={<UserDashboardSkeleton />}>
          <UserDashboardWrapper />
        </Suspense>
      </DataErrorBoundary>
    </div>
  );
}

function UserDashboardSkeleton() {
  return (
    <div className='mx-2 mt-8 mb-64 sm:mx-8'>
      <div className='mb-8 flex items-center justify-between gap-2 md:mb-4 md:flex-row'>
        <h2 className='flex items-center gap-2 font-londrina text-4xl font-bold tracking-wider text-white'>
          <Skeleton className='h-9 w-[75px]' />
          <Skeleton className='h-9 w-[250px]' />
        </h2>
        <div className='hidden gap-2 md:flex'>
          <Skeleton className='h-9 w-[160px]' />
          <Skeleton className='h-9 w-[240px]' />
        </div>
      </div>
      <div className='grid grid-cols-12 gap-4'>
        {/* Main Statistics */}
        <div className='md:col-span1 order-1 col-span-12 flex flex-col gap-2 md:flex-row lg:col-span-4 lg:flex-col'>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card
              key={i}
              className='flex h-32 w-full flex-col items-center justify-center p-4'
            >
              <Skeleton className='size-12 rounded-full bg-secondary' />
              <Skeleton className='mt-1 h-6 w-3/4 rounded-md bg-secondary' />
            </Card>
          ))}
        </div>

        {/* Milestones */}
        <div className='order-2 col-span-12 md:order-3 md:col-span-2 lg:col-span-1'>
          <Card className='h-full p-4'>
            <Skeleton className='h-6 rounded-md bg-secondary' />
            <div className='mt-4 space-y-3'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='flex flex-col items-center gap-2'>
                  <Skeleton className='size-8 rounded-full bg-secondary' />
                  <Skeleton className='h-4 w-full rounded-md bg-secondary' />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Distribution Charts */}
        <div className='order-3 col-span-12 w-full md:order-2 md:col-span-10 lg:col-span-7'>
          <Card className='h-full flex-col justify-between gap-4 rounded-lg bg-white p-4 md:gap-0 md:py-2'>
            <Skeleton className='my-auto h-36 w-full rounded-md bg-secondary' />
            <div className='hidden h-px w-full bg-border md:block' />
            <div className='h-full w-px bg-border md:hidden' />
            <Skeleton className='my-auto h-36 w-full rounded-md bg-secondary' />
          </Card>
        </div>

        {/* Bottom Row Content */}
        <div className='order-4 col-span-12 flex flex-col-reverse gap-4 md:col-span-10 lg:col-span-11 lg:flex-row'>
          {/* Recent Contributions */}
          <Card className='w-full flex-col gap-4 rounded-lg p-4'>
            <Skeleton className='h-6 w-1/3 rounded-md bg-secondary' />
            <div className='space-y-3'>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className='flex items-center gap-2'>
                  <Skeleton className='size-8 rounded-md bg-secondary' />
                  <Skeleton className='h-4 w-3/4 rounded-md bg-secondary' />
                  <Skeleton className='ml-auto h-4 w-12 rounded-md bg-secondary' />
                </div>
              ))}
            </div>
          </Card>

          {/* Data Calendar */}
          <Card className='w-full flex-col gap-4 rounded-lg p-4'>
            <Skeleton className='h-6 w-1/3 rounded-md bg-secondary' />
            <div className='grid h-full grid-cols-7 grid-rows-4 gap-1'>
              {Array.from({ length: 28 }).map((_, i) => (
                <Skeleton key={i} className='aspect-square bg-secondary' />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
