import { Suspense } from 'react';
import { UserHistoryWrapper } from '@/features/user/history/components/user-history-wrapper';
import { BlurFade } from '@/components/magicui/blur-fade';
import { NavButton } from '@/components/ui/nav-button';
import { UserNav } from '@/components/nav/user-nav';
import { getSession } from '@/server/dto';
import { headers } from 'next/headers';
import { UnauthorizedAccess } from '@/components/unauthorized-access';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

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
        <BlurFade delay={0.1}>
          <h2 className='font-londrina text-4xl font-bold tracking-wider text-white'>
            Meine Beiträge
          </h2>
        </BlurFade>

        <div className='hidden gap-2 md:flex'>
          <BlurFade delay={0.15}>
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
          </BlurFade>

          <BlurFade delay={0.17}>
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
          </BlurFade>

          <BlurFade delay={0.2}>
            <UserNav user={user} routeKey='userRoutes' />
          </BlurFade>
        </div>
      </div>

      <Suspense fallback={<UserHistorySkeleton />}>
        <UserHistoryWrapper />
      </Suspense>
    </div>
  );
}

function UserHistorySkeleton() {
  const rowCount = 8;
  const colCount = 6;

  return (
    <Card>
      <CardContent>
        <div className='mb-4 flex flex-1 flex-col flex-wrap gap-2 md:flex-row md:items-center md:gap-4'>
          <Skeleton className='h-9 w-[250px] bg-secondary' />

          <Skeleton className='h-9 w-[200px] bg-secondary' />

          <div className='flex flex-wrap gap-2'>
            <Skeleton className='h-9 w-[120px] bg-secondary' />
            <Skeleton className='h-9 w-[100px] bg-secondary' />
            <Skeleton className='h-9 w-[110px] bg-secondary' />
            <Skeleton className='h-9 w-[90px] bg-secondary' />
          </div>
        </div>

        <div className='rounded-md border'>
          <table className='w-full'>
            <thead>
              <tr className='border-b'>
                {Array.from({ length: colCount }).map((_, i) => (
                  <th
                    key={i}
                    className='h-12 px-4 text-left align-middle font-medium text-muted-foreground'
                  >
                    <Skeleton className='h-5 w-3/4 bg-secondary' />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rowCount }).map((_, rowIndex) => (
                <tr key={rowIndex} className='border-b transition-colors'>
                  {Array.from({ length: colCount }).map((_, colIndex) => (
                    <td key={colIndex} className='p-4 align-middle'>
                      <Skeleton className='h-6 w-full bg-secondary' />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='flex flex-col items-center justify-between gap-6 pt-4 sm:flex-row'>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-8 w-[100px] bg-secondary' />
          </div>

          <div className='flex items-center gap-2'>
            <Skeleton className='h-8 w-[70px] bg-secondary' />
            <Skeleton className='h-5 w-[120px] bg-secondary' />
            <Skeleton className='h-8 w-[70px] bg-secondary' />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
