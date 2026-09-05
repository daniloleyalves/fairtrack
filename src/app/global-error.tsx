'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import './globals.css';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang='de'>
      <body className='flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center font-sans antialiased'>
        <h1 className='text-2xl font-semibold'>Etwas ist schiefgelaufen</h1>
        <p className='max-w-md text-muted-foreground'>
          Ein unerwarteter Fehler ist aufgetreten. Bitte laden Sie die Seite neu
          oder kontaktieren Sie den Support, falls das Problem weiterhin
          besteht.
        </p>
        <button
          type='button'
          onClick={() => window.location.reload()}
          className='rounded-md bg-primary px-6 py-2 font-medium text-primary-foreground'
        >
          Seite neu laden
        </button>
      </body>
    </html>
  );
}
