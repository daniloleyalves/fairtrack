'use client';

import { signOutAction } from '@/lib/auth/auth-actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@components/ui/sidebar';
import { routes } from '@/lib/config/routes';
import { ChevronsUpDown, Loader2, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { LoadingBar } from '@components/ui/loading-bar';
import { UserAvatar } from '../user-avatar';
import { handleAsyncAction } from '@/lib/client-error-handling';
import { User } from '@/server/db/db-types';
import { authClient } from '@/lib/auth/auth-client';

// --- 1. The Main Orchestrator Component ---
export function NavUser({ user, routeKey }: { user: User; routeKey: string }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <UserMenuTrigger user={user} />
          <UserMenuContent user={user} routeKey={routeKey} />
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

// --- 2. The Trigger Component ---
export function UserMenuTrigger({ user }: { user: User }) {
  return (
    <DropdownMenuTrigger asChild>
      <SidebarMenuButton
        size='lg'
        className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
      >
        <UserAvatar user={user} />
        <div className='grid flex-1 text-left text-sm leading-tight'>
          <span className='truncate font-semibold'>{user.name}</span>
          <span className='truncate text-xs text-muted-foreground'>
            {user.email}
          </span>
        </div>
        <ChevronsUpDown className='ml-auto size-4' />
      </SidebarMenuButton>
    </DropdownMenuTrigger>
  );
}

// --- 3. The Dropdown Content Component ---
export function UserMenuContent({
  user,
  routeKey,
}: {
  user: User;
  routeKey: string;
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  const handleMenuClick = () => {
    setIsLoading(true);
    setOpenMobile(false);
  };

  return (
    <>
      <LoadingBar isLoading={isLoading} />
      <DropdownMenuContent
        className='w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 rounded-lg'
        side={isMobile ? 'bottom' : 'right'}
        align='end'
        sideOffset={4}
      >
        <DropdownMenuLabel className='p-0 font-normal'>
          <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
            <UserAvatar user={user} />
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-medium'>{user.name}</span>
              <span className='truncate text-xs'>{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {routes[routeKey].map((route) => (
            <UserMenuLink
              key={route.title}
              route={route}
              onClose={handleMenuClick}
            />
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <SignOutMenuItem />
      </DropdownMenuContent>
    </>
  );
}

// --- Helper Component for User Menu Links ---
function UserMenuLink({
  route,
  onClose,
}: {
  route: {
    title: string;
    url: string;
    icon?: React.ComponentType<{ className?: string }>;
    disabled?: boolean;
  };
  onClose: () => void;
}) {
  return (
    <DropdownMenuItem disabled={route.disabled} asChild>
      <Link href={route.url} aria-label={route.title} onClick={onClose}>
        {route.icon && <route.icon className='mr-2 size-4' />}
        {route.title}
      </Link>
    </DropdownMenuItem>
  );
}

// --- 4. The Sign Out Item Component ---
export function SignOutMenuItem() {
  const [isPending, startTransition] = useTransition();
  const { refetch } = authClient.useSession();
  const router = useRouter();

  const handleSignOut = () => {
    startTransition(() => {
      handleAsyncAction(() => signOutAction({}), undefined, {
        showToast: false,
        onSuccess: (result) => {
          if (result.data?.redirectTo) {
            router.push(result.data.redirectTo);
            refetch();
          }
        },
      });
    });
  };

  return (
    <DropdownMenuItem onClick={handleSignOut} disabled={isPending}>
      {isPending ? (
        <Loader2 className='mr-2 size-4 animate-spin' />
      ) : (
        <LogOut className='mr-2 size-4' />
      )}
      Abmelden
    </DropdownMenuItem>
  );
}
