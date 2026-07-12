import { UserHubNav } from '@/components/nav/user-hub-nav';
import { Dock } from '@/components/ui/dock';
import { DockButton } from '@/components/ui/dock-button';
import { Separator } from '@/components/ui/separator';

// The onboarding gate lives in `src/proxy.ts`, so this layout stays static
// and can prerender its PPR shell. The middleware guarantees any request that
// reaches here is authenticated and past onboarding, so the dock renders
// unconditionally.
export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className='relative flex-1 overflow-y-auto'>
      {/* Decorative background element */}
      <span className='absolute top-0 h-80 w-full rounded-b-lg bg-primary shadow-md'></span>
      {/* Content container */}
      <div className='relative z-10 mx-auto max-w-7xl'>
        <UserHubNav />
        {children}
      </div>
      <div className='fixed bottom-5 left-1/2 z-50 -translate-x-1/2 md:hidden'>
        <Dock direction='middle' className='flex gap-4'>
          <DockButton href='/hub/user/dashboard' icon='LayoutDashboard' />
          <DockButton href='/hub/user/fairteiler-finder' icon='Map' />
          <DockButton href='/hub/user/history' icon='History' />
          <DockButton href='/hub/user/feedback' icon='MessageCircle' />
          <DockButton href='/hub/user/settings' icon='Settings2' />
          <Separator orientation='vertical' />
          <DockButton href='/hub/fairteiler/dashboard' icon='Coffee' />
        </Dock>
      </div>
    </main>
  );
}
