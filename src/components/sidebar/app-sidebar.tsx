import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@components/ui/sidebar';
import * as React from 'react';
import { UnauthorizedAccess } from '@/components/unauthorized-access';
import { NavFairteiler } from './nav-fairteiler';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';
import { headers } from 'next/headers';
import {
  getActiveMembership,
  getActiveFairteiler,
  getSession,
} from '@server/dto';

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const nextHeaders = await headers();
  const fairteiler = await getActiveFairteiler(nextHeaders);
  const membership = await getActiveMembership(nextHeaders);
  const session = await getSession(nextHeaders);

  if (!fairteiler || !membership || !session) {
    return <UnauthorizedAccess variant='minimal' showSignInButton={false} />;
  }
  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <NavFairteiler
          fairteilerTitle={fairteiler.name}
          routeKey='adminRoutes'
          userRole={membership.role}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          title='Fairteiler'
          routeKey='mainRoutes'
          userRole={membership.role}
        />
        <NavMain
          title='Platform'
          routeKey='platformRoutes'
          userRole={membership.role}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser routeKey='userRoutes' user={session.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
