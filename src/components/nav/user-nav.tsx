'use client';

import { User } from '@/server/db/db-types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { UserAvatar } from '../user-avatar';
import { routes } from '@/lib/config/routes';
import Link from 'next/link';
import { useTransition } from 'react';
import { handleAsyncAction } from '@/lib/client-error-handling';
import { signOutAction } from '@/lib/auth/auth-actions';
import { ChevronsUpDown, Loader2, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function UserNav({ user, routeKey }: { user: User; routeKey: string }) {
  return (
    <DropdownMenu>
      <UserNavTrigger user={user} />
      <UserNavContent user={user} routeKey={routeKey} />
    </DropdownMenu>
  );
}

// --- 2. The Trigger Component ---
export function UserNavTrigger({ user }: { user: User }) {
  return (
    <DropdownMenuTrigger className='flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-white px-1'>
      <UserAvatar user={user} className='mx-auto' />
      <div className='hidden flex-1 text-left text-sm leading-tight md:grid'>
        <span className='truncate font-semibold'>{user.name}</span>
        <span className='truncate text-xs text-muted-foreground'>
          {user.email}
        </span>
      </div>
      <ChevronsUpDown className='mx-1 hidden size-4 text-muted-foreground md:block' />
    </DropdownMenuTrigger>
  );
}

// --- 3. The Dropdown Content Component ---
export function UserNavContent({
  user,
  routeKey,
}: {
  user: User;
  routeKey: string;
}) {
  return (
    <DropdownMenuContent
      className='w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 rounded-lg'
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
          <DropdownMenuItem key={route.title} disabled={route.disabled} asChild>
            <Link href={route.url} aria-label={route.title}>
              {route.icon && <route.icon className='mr-2 size-4' />}
              {route.title}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <SignOutMenuItem />
    </DropdownMenuContent>
  );
}

// --- 4. The Sign Out Item Component ---
function SignOutMenuItem() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSignOut = () => {
    startTransition(() => {
      handleAsyncAction(() => signOutAction({}), undefined, {
        showToast: false,
        onSuccess: (result) => {
          if (result.data?.redirectTo) {
            router.push(result.data.redirectTo);
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
