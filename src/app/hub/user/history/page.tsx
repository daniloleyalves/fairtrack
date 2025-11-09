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
  return (
    <div className='mx-2 mt-8 mb-64 sm:mx-8'>
      <div className='mb-8 flex items-center justify-between gap-2 md:mb-4 md:flex-row'>
        <Skeleton className='h-9 w-[280px] bg-white/20' />
        <div className='hidden gap-2 md:flex'>
          <Skeleton className='h-9 w-[140px] bg-white/20' />
          <Skeleton className='h-9 w-[180px] bg-white/20' />
          <Skeleton className='h-9 w-[40px] bg-white/20' />
        </div>
      </div>

      <Card>
        <CardContent className='p-6'>
          <div className='space-y-4'>
            {/* Filter controls skeleton */}
            <div className='flex flex-wrap gap-2'>
              <Skeleton className='h-9 w-[120px]' />
              <Skeleton className='h-9 w-[140px]' />
              <Skeleton className='h-9 w-[100px]' />
              <Skeleton className='h-9 w-[110px]' />
            </div>

            {/* Table header skeleton */}
            <div className='grid grid-cols-6 gap-4 border-b pb-2'>
              <Skeleton className='h-4 w-[60px]' />
              <Skeleton className='h-4 w-[80px]' />
              <Skeleton className='h-4 w-[70px]' />
              <Skeleton className='h-4 w-[90px]' />
              <Skeleton className='h-4 w-[60px]' />
              <Skeleton className='h-4 w-[50px]' />
            </div>

            {/* Table rows skeleton */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className='grid grid-cols-6 gap-4 py-2'>
                <Skeleton className='h-4 w-[50px]' />
                <Skeleton className='h-4 w-[70px]' />
                <Skeleton className='h-4 w-[60px]' />
                <Skeleton className='h-4 w-[80px]' />
                <Skeleton className='h-4 w-[45px]' />
                <Skeleton className='h-4 w-[40px]' />
              </div>
            ))}

            {/* Loading controls skeleton */}
            <div className='flex flex-col items-center gap-2 pt-4 sm:flex-row'>
              <Skeleton className='h-8 w-[100px]' />
              <Skeleton className='h-4 w-[180px]' />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
