'use client';

import { checkAccess } from '@/lib/auth/auth-helpers';
import { MemberRoles } from '@/lib/auth/auth-permissions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@components/ui/sidebar';
import { Route, routes } from '@/lib/config/routes';
import { ChevronsUpDown, Coffee } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function NavFairteiler({
  fairteilerTitle,
  routeKey,
  userRole,
}: {
  fairteilerTitle: string;
  routeKey: string;
  userRole: MemberRoles;
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const [canAccessSettings, setCanAccessSettings] = useState<boolean | null>(
    null,
  );
  const [accessibleRoutes, setAccessibleRoutes] = useState<Route[]>([]);

  useEffect(() => {
    const checkPermissions = () => {
      try {
        // Check settings access
        const settingsAccess = checkAccess(
          { section: 'organization', permissions: ['read', 'update'] },
          userRole,
        );
        setCanAccessSettings(settingsAccess);

        // Filter accessible routes
        if (settingsAccess) {
          const filteredRoutes = [];
          for (const route of routes[routeKey]) {
            const hasAccess = checkAccess(route.reqPermissions, userRole);
            if (hasAccess) {
              filteredRoutes.push(route);
            }
          }
          setAccessibleRoutes(filteredRoutes);
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        setCanAccessSettings(false);
      }
    };

    checkPermissions();
  }, [userRole, routeKey]);

  // Show loading state while checking permissions
  if (canAccessSettings === null) {
    return (
      <SidebarMenuButton
        size='lg'
        className='cursor-default hover:bg-white active:bg-white'
      >
        <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
          <Coffee className='size-4' />
        </div>
        <div className='grid flex-1 text-left text-sm leading-tight'>
          <span className='truncate font-semibold'>{fairteilerTitle}</span>
        </div>
      </SidebarMenuButton>
    );
  }

  if (!canAccessSettings) {
    return (
      <SidebarMenuButton
        size='lg'
        className='cursor-default hover:bg-white active:bg-white'
      >
        <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
          <Coffee className='size-4' />
        </div>
        <div className='grid flex-1 text-left text-sm leading-tight'>
          <span className='truncate font-semibold'>{fairteilerTitle}</span>
        </div>
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                <Coffee className='size-4' />
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>
                  {fairteilerTitle}
                </span>
              </div>
              <ChevronsUpDown className='ml-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-xs text-muted-foreground'>
              Einstellungen
            </DropdownMenuLabel>
            {accessibleRoutes.map((route) => (
              <DropdownMenuItem
                key={route.title}
                disabled={route.disabled}
                className='gap-2 p-2'
                asChild
              >
                <Link href={route.url} onClick={() => setOpenMobile(false)}>
                  <div className='flex size-6 items-center justify-center rounded-lg border'>
                    {route.icon && <route.icon className='size-3.5' />}
                  </div>
                  {route.title}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
