import { Suspense } from 'react';
import { IdleReload } from '@components/idle-reload';
import { LoadingScreen } from '@components/loading-screen';

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <IdleReload />
      <Suspense fallback={<LoadingScreen className='flex-1' />}>
        {children}
      </Suspense>
    </>
  );
}
