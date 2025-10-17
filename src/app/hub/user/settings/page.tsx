import { DataErrorBoundary } from '@/components/error-boundary';
import { BlurFade } from '@/components/magicui/blur-fade';
import { UserNav } from '@/components/nav/user-nav';
import { NavButton } from '@/components/ui/nav-button';
import { UnauthorizedAccess } from '@/components/unauthorized-access';
import UserSettingsWrapper from '@/features/user/settings/components/user-settings-wrapper';
import { getSession } from '@/server/dto';
import { headers } from 'next/headers';

export default async function UserSettingsPage() {
  const auth = await getSession(await headers());
  const user = auth?.user;

  if (!user) {
    return <UnauthorizedAccess />;
  }

  return (
    <div className='mx-2 mt-8 mb-64 sm:mx-8'>
      <div className='mb-4 flex items-center justify-between gap-2 md:flex-row'>
        <BlurFade delay={0.1}>
          <h2 className='font-londrina text-4xl font-bold tracking-wider text-white'>
            Einstellungen
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
        <UserSettingsWrapper user={user} />
      </DataErrorBoundary>
    </div>
  );
}
