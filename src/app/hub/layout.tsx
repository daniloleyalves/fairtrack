import { Suspense } from 'react';
import { LoadingScreen } from '@components/loading-screen';

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingScreen className='flex-1' />}>
      {children}
    </Suspense>
  );
}
