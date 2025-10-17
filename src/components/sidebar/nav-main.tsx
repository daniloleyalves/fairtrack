'use client';

import { checkAccess } from '@/lib/auth/auth-helpers';
import { MemberRoles } from '@/lib/auth/auth-permissions';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@components/ui/sidebar';
import { Route, routes } from '@/lib/config/routes';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { LoadingBar } from '@components/ui/loading-bar';

function RouteItem({
  route,
  onClick,
}: {
  route: Route;
  onClick: (href: string) => void;
}) {
  // Case 1: The route has sub-routes (render a collapsible menu)
  if (route.routes) {
    return (
      <Collapsible asChild className='group/collapsible'>
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={route.title}>
              {route.icon && <route.icon />}
              <span>{route.title}</span>
              <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {route.routes?.map((subRoute) => (
                <SidebarMenuSubItem key={subRoute.title}>
                  <SidebarMenuSubButton asChild>
                    <Link
                      href={subRoute.url}
                      onClick={() => onClick(subRoute.url)}
                    >
                      <span>{subRoute.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  // Case 2: The route is disabled
  if (route.disabled) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton disabled tooltip={route.title}>
          {route.icon && <route.icon />}
          <span>{route.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  // Case 3: The route is a simple, active link
  return (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip={route.title} asChild>
        <Link href={route.url} onClick={() => onClick(route.url)}>
          {route.icon && <route.icon />}
          <span>{route.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function NavMain({
  title,
  routeKey,
  userRole,
}: {
  title: string;
  routeKey: string;
  userRole: MemberRoles;
}) {
  const { setOpenMobile } = useSidebar();
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

  // 1. Filter routes based on permissions first for clarity and efficiency.
  const accessibleRoutes = routes[routeKey].filter((route) =>
    checkAccess(route.reqPermissions, userRole),
  );

  const handleRouteClick = (href: string) => {
    // Only show loading if navigating to a different route
    const targetUrl = new URL(href, window.location.origin);
    const currentUrl = new URL(window.location.href);

    if (
      targetUrl.pathname !== currentUrl.pathname ||
      targetUrl.search !== currentUrl.search
    ) {
      setIsLoading(true);
    }
    setOpenMobile(false);
  };

  return (
    <>
      <LoadingBar isLoading={isLoading} />
      <SidebarGroup>
        <SidebarGroupLabel>{title}</SidebarGroupLabel>
        <SidebarMenu>
          {accessibleRoutes.map((route) => (
            <RouteItem
              key={route.title}
              route={route}
              onClick={handleRouteClick}
            />
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
