import { Suspense } from 'react';
import { IdleReload } from '@components/idle-reload';
import { LoadingScreen } from '@components/loading-screen';
import { ServerFunctionRegistry } from '@components/server-function-registry';

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <IdleReload />
      <ServerFunctionRegistry />
      <Suspense fallback={<LoadingScreen className='flex-1' />}>
        {children}
      </Suspense>
    </>
  );
}
