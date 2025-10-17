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
    <div>
      <Skeleton className='w-full' />
      <Skeleton className='w-full' />
    </div>
  );
}
