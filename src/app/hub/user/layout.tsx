import { Dock } from '@/components/ui/dock';
import { DockButton } from '@/components/ui/dock-button';
import { Separator } from '@/components/ui/separator';
import { AuthProvider } from '@/lib/auth/auth-provider';
import { getSession } from '@/server/dto';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession(await headers());

  // Redirect to onboarding if user hasn't completed it
  if (session?.user?.isFirstLogin) {
    redirect('/hub/onboarding');
  }

  return (
    <AuthProvider>
      <LayoutMain>{children}</LayoutMain>
    </AuthProvider>
  );
}

async function LayoutMain({ children }: { children: React.ReactNode }) {
  const session = await getSession(await headers());
  return (
    <main className='relative flex-1 overflow-y-auto'>
      {/* Decorative background element */}
      <span className='absolute top-0 h-80 w-full rounded-b-lg bg-primary shadow-md'></span>
      {/* Content container */}
      <div className='relative z-10 mx-auto max-w-7xl'>{children}</div>
      <div className='fixed bottom-5 left-1/2 z-50 -translate-x-1/2 md:hidden'>
        {!session?.user.isFirstLogin && (
          <Dock direction='middle' className='flex gap-4'>
            <DockButton href='/hub/user/dashboard' icon='LayoutDashboard' />
            <DockButton href='/hub/user/fairteiler-finder' icon='Map' />
            <DockButton href='/hub/user/settings' icon='Settings2' />
            {session && (
              <>
                <Separator orientation='vertical' />
                <DockButton href='/hub/fairteiler/dashboard' icon='Coffee' />
              </>
            )}
          </Dock>
        )}
      </div>
    </main>
  );
}
