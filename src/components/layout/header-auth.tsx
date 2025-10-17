'use client';

import { useSession } from '@/lib/auth/auth-hooks';
import { UserAvatar } from '../user-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { routes } from '@/lib/config/routes';
import { UserNavButton } from './user-nav-button';
import { Skeleton } from '../ui/skeleton';
import { NavButton } from '../ui/nav-button';
import { SignOutMenuItem } from '../sidebar/nav-user';

export function HeaderAuth() {
  const { user, session, isLoading } = useSession();
  if (isLoading) {
    return <Skeleton className='h-8 w-[153px] bg-secondary' />;
  }

  return user ? (
    <UserMenu
      user={user}
      hasActiveMembership={!!session?.activeOrganizationId}
    />
  ) : (
    <SignInButton />
  );
}

function UserMenu({
  user,
  hasActiveMembership,
}: {
  user: {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    isFirstLogin: boolean;
    isAnonymous: boolean;
    image?: string | null;
  };
  hasActiveMembership: boolean;
}) {
  return (
    <div className='flex items-center gap-2'>
      {hasActiveMembership && (
        <>
          <div className='hidden size-8 md:block md:w-auto'>
            <NavButton
              title='Fairteiler Dashboard'
              href='/hub/fairteiler/dashboard'
              icon='Coffee'
              variant='secondary'
              size='sm'
            />
          </div>
          <div className='size-8 md:hidden md:w-auto'>
            <NavButton
              href='/hub/fairteiler/dashboard'
              icon='Coffee'
              variant='secondary'
              size='sm'
            />
          </div>
        </>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger>
          <UserAvatar user={{ ...user, avatar: user.image }} />
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end'>
          <DropdownMenuLabel className='p-2 font-normal'>
            <div className='flex items-center gap-2 text-left text-sm'>
              <UserAvatar user={{ ...user, avatar: user.image }} />
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
            {routes.userRoutes
              .filter((route) => !route.disabled && route.reqPermissions)
              .map((route) => (
                <UserNavButton route={route} key={route.title}>
                  {route.title}
                </UserNavButton>
              ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <SignOutMenuItem />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function SignInButton() {
  return <NavButton title='Anmelden' href='/sign-in' icon='LogIn' size='sm' />;
}
