'use client';

const isDemo = process.env.NEXT_PUBLIC_ENV === 'demo';

export function DemoBanner() {
  if (!isDemo) return null;

  return (
    <div className='bg-amber-500 py-1.5 text-center text-sm font-medium text-white'>
      Demo-Umgebung — Daten werden wöchentlich zurückgesetzt
    </div>
  );
}
