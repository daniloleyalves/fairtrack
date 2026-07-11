import { DataErrorBoundary } from '@/components/error-boundary';
import { UserNav } from '@/components/nav/user-nav';
import { NavButton } from '@/components/ui/nav-button';
import { UnauthorizedAccess } from '@/components/unauthorized-access';
import UserSettingsWrapper from '@/features/user/settings/components/user-settings-wrapper';
import { getSession } from '@/server/user/queries';
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
        <div>
          <h2 className='font-londrina text-4xl font-bold tracking-wider text-white'>
            Einstellungen
          </h2>
        </div>

        <div className='hidden gap-2 md:flex'>
          {auth.session.activeOrganizationId && (
            <>
              {!user.email.includes('guest') &&
                !user.email.includes('employee') && (
                  <div>
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
                  </div>
                )}

              {(user.email.includes('guest') ||
                user.email.includes('employee')) && (
                <div>
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
                </div>
              )}
            </>
          )}
          <div>
            <NavButton
              title='Dashboard'
              href='/hub/user/dashboard'
              icon='LayoutDashboard'
              variant='tertiary'
              size='lg'
            />
          </div>
          <div>
            <UserNav user={user} routeKey='userRoutes' />
          </div>
        </div>
      </div>
      <DataErrorBoundary>
        <UserSettingsWrapper user={user} />
      </DataErrorBoundary>
    </div>
  );
}
