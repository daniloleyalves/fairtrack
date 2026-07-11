import { UserHistoryWrapper } from '@/features/user/history/components/user-history-wrapper';
import { NavButton } from '@/components/ui/nav-button';
import { UserNav } from '@/components/nav/user-nav';
import { getSession } from '@/server/user/queries';
import { headers } from 'next/headers';
import { UnauthorizedAccess } from '@/components/unauthorized-access';
import { DataErrorBoundary } from '@/components/error-boundary';

export default async function UserHistoryPage() {
  const nextHeaders = await headers();
  const auth = await getSession(nextHeaders);
  const user = auth?.user;

  if (!user) {
    return <UnauthorizedAccess />;
  }

  return (
    <div className='mx-2 mt-8 mb-64 sm:mx-8'>
      <div className='mb-4 flex items-center justify-between gap-2 md:flex-row'>
        <div>
          <h2 className='font-londrina text-4xl font-bold tracking-wider text-white'>
            Meine Beiträge
          </h2>
        </div>

        <div className='hidden gap-2 md:flex'>
          <div>
            <div className='hidden lg:block'>
              <NavButton
                title='Dashboard'
                href='/hub/user/dashboard'
                icon='LayoutDashboard'
                variant='secondary'
                size='lg'
              />
            </div>
            <div className='lg:hidden'>
              <NavButton
                href='/hub/user/dashboard'
                icon='LayoutDashboard'
                variant='secondary'
                size='icon'
              />
            </div>
          </div>

          <div>
            <div className='hidden lg:block'>
              <NavButton
                title='Fairteiler finden'
                href='/hub/user/fairteiler-finder'
                icon='Map'
                variant='tertiary'
                size='lg'
              />
            </div>
            <div className='lg:hidden'>
              <NavButton
                href='/hub/user/fairteiler-finder'
                icon='Map'
                variant='tertiary'
                size='icon'
              />
            </div>
          </div>

          <div>
            <UserNav user={user} routeKey='userRoutes' />
          </div>
        </div>
      </div>

      <DataErrorBoundary>
        <UserHistoryWrapper />
      </DataErrorBoundary>
    </div>
  );
}
