import { Dock } from '@/components/ui/dock';
import { DockButton } from '@/components/ui/dock-button';
import { FairteilerDockButton } from './fairteiler-dock-button';

// The onboarding gate lives in `src/proxy.ts`, so this shell stays static
// and can prerender its PPR shell. The middleware guarantees any request that
// reaches here is authenticated and past onboarding.
export function UserHubShell({
  children,
  nav,
  showDock = true,
}: {
  children: React.ReactNode;
  nav?: React.ReactNode;
  showDock?: boolean;
}) {
  return (
    <main className='relative flex-1 overflow-y-auto'>
      {/* Decorative background element */}
      <span className='absolute top-0 h-80 w-full rounded-b-lg bg-primary shadow-md'></span>
      {/* Content container */}
      <div className='relative z-10 mx-auto max-w-7xl'>
        {nav}
        {children}
      </div>
      {showDock && (
        <div className='fixed bottom-5 left-1/2 z-50 -translate-x-1/2 md:hidden'>
          <Dock direction='middle' className='flex gap-4'>
            <DockButton href='/hub/user/dashboard' icon='LayoutDashboard' />
            <DockButton href='/hub/user/fairteiler-finder' icon='Map' />
            <DockButton href='/hub/user/history' icon='History' />
            <DockButton href='/hub/user/feedback' icon='MessageCircle' />
            <DockButton href='/hub/user/settings' icon='Settings2' />
            <FairteilerDockButton />
          </Dock>
        </div>
      )}
    </main>
  );
}
