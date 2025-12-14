import { Illustrations } from '@/lib/assets/illustrations';
import { Button } from '@components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

function NotFoundContent() {
  return (
    <div className='mt-8 flex flex-col items-center justify-center gap-8'>
      <Image
        src={Illustrations.noPageFoundIllustration}
        priority={true}
        alt='no page found illustration'
        loading='eager'
        decoding='sync'
        height={300}
        width={694}
      />

      <p className='text-center text-xl font-semibold'>
        Diese Seite existiert nicht oder wurde verschoben
      </p>

      <Button asChild>
        <Link href='/'>Zur Startseite zurückkehren</Link>
      </Button>
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  );
}
