'use client';

import { useSession } from '@/lib/auth/auth-hooks';
import { isGuestOrEmployeeEmail } from '@/lib/auth/auth-helpers';
import { routes } from '@/lib/config/routes';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings2 } from 'lucide-react';
import { NavButton } from '../ui/nav-button';
import { UserAvatar } from '../user-avatar';
import { Skeleton } from '../ui/skeleton';
import { SignOutMenuItem } from '../sidebar/nav-user';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export function UserHubNav() {
  const { user, session, isLoading } = useSession();

  return (
    <div className='mx-2 hidden items-center justify-between gap-2 pt-4 sm:mx-8 md:flex'>
      {isLoading || !user ? (
        <UserHubNavSkeleton />
      ) : (
        <>
          <UserHubTabs />
          <div className='flex items-center gap-2'>
            {!!session?.activeOrganizationId &&
              (isGuestOrEmployeeEmail(user.email) ? (
                <NavButton
                  title='Retteformular'
                  href='/hub/fairteiler/contribution'
                  icon='ClipboardList'
                  variant='secondary'
                  size='lg'
                  responsiveTitle
                />
              ) : (
                <NavButton
                  title='Fairteiler Dashboard'
                  href='/hub/fairteiler/dashboard'
                  icon='Coffee'
                  variant='secondary'
                  size='lg'
                  responsiveTitle
                />
              ))}
            <UserHubAccountMenu
              user={{ ...user, avatar: user.image ?? null }}
            />
          </div>
        </>
      )}
    </div>
  );
}

function UserHubNavSkeleton() {
  return (
    <>
      <nav
        aria-hidden
        className='flex items-center gap-1 rounded-lg bg-white/10 p-1'
      >
        {routes.userHubTabs
          .filter((tab) => !tab.disabled)
          .map((tab) => (
            <Skeleton
              key={tab.title}
              className='flex h-8 items-center gap-2 rounded-md px-3'
            >
              <Skeleton variant='onCard' className='size-4 rounded-sm' />
              <Skeleton
                variant='onCard'
                className='hidden h-3 lg:block'
                style={{ width: `${tab.title.length * 7}px` }}
              />
            </Skeleton>
          ))}
      </nav>
      <div className='flex items-center gap-2'>
        <Skeleton variant='onCard' className='hidden h-10 w-48 lg:block' />
        <Skeleton variant='onCard' className='size-8 rounded-lg' />
      </div>
    </>
  );
}

function UserHubTabs() {
  const pathname = usePathname();

  return (
    <nav className='flex items-center gap-1 rounded-lg bg-white/10 p-1'>
      {routes.userHubTabs
        .filter((tab) => !tab.disabled)
        .map((tab) => {
          const isActive = pathname.startsWith(tab.url);
          return (
            <Link
              key={tab.title}
              href={tab.url}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex h-8 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-white hover:bg-white/10',
              )}
            >
              {tab.icon && <tab.icon className='size-4' />}
              <span className='hidden lg:inline'>{tab.title}</span>
            </Link>
          );
        })}
    </nav>
  );
}

function UserHubAccountMenu({
  user,
}: {
  user: {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string | null;
    isAnonymous: boolean;
    isFirstLogin: boolean;
  };
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='cursor-pointer rounded-lg'>
        <UserAvatar user={user} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' sideOffset={4}>
        <DropdownMenuLabel className='p-2 font-normal'>
          <div className='flex items-center gap-2 text-left text-sm'>
            <UserAvatar user={user} />
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-semibold'>{user.name}</span>
              <span className='truncate text-xs leading-none text-muted-foreground'>
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href='/hub/user/settings' aria-label='Einstellungen'>
              <Settings2 className='mr-2 size-4' />
              Einstellungen
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <SignOutMenuItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
