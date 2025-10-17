import { DataErrorBoundary } from '@/components/error-boundary';
import { BlurFade } from '@/components/magicui/blur-fade';
import { UserNav } from '@/components/nav/user-nav';
import { NavButton } from '@/components/ui/nav-button';
import { UnauthorizedAccess } from '@/components/unauthorized-access';
import { FairteilerMapWrapper } from '@/features/fairteiler-map/components/fairteiler-map-wrapper';
import { getFairteilers, getSession } from '@/server/dto';
import { headers } from 'next/headers';
import { Suspense } from 'react';

export default async function FairteilerFinderPage() {
  const fairteilers = await getFairteilers();

  const auth = await getSession(await headers());
  const user = auth?.user;

  if (!user) {
    return <UnauthorizedAccess />;
  }

  return (
    <div className='md:mx-8 md:mt-8'>
      <div className='mb-4 hidden items-end justify-between md:flex'>
        <BlurFade delay={0.1}>
          <h2 className='font-londrina text-4xl font-bold tracking-wider text-white'>
            Fairteiler-Finder
          </h2>
        </BlurFade>
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
              title='Dashboard'
              href='/hub/user/dashboard'
              icon='LayoutDashboard'
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
        <Suspense fallback={<div>Loading...</div>}>
          <FairteilerMapWrapper fairteilers={fairteilers} />
        </Suspense>
      </DataErrorBoundary>
    </div>
  );
}
