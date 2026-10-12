import { Suspense } from 'react';
import { Skeleton } from '@components/ui/skeleton';
import { ScanInvalid } from '@/features/qr-code/components/scan-invalid';
import { QrGuestContribution } from '@/features/qr-code/components/qr-guest-contribution';
import { loadScanContext } from '@/server/qr-code/scan-context';
import { getFairteilerBySlug } from '@/server/fairteiler/queries';

export default function ScanGuestPage() {
  return (
    <div className='m-2 mb-32 flex flex-col gap-4 sm:m-8'>
      <Suspense fallback={<Skeleton className='h-96 w-full bg-secondary' />}>
        <GuestContribution />
      </Suspense>
    </div>
  );
}

async function GuestContribution() {
  const scan = await loadScanContext();

  if (!scan?.guestAccessViewId) {
    return (
      <div className='mx-auto w-full max-w-lg'>
        <ScanInvalid />
      </div>
    );
  }

  const { fairteiler, origins, categories, companies, tutorial } =
    await getFairteilerBySlug(scan.fairteiler.slug);

  return (
    <QrGuestContribution
      initialData={{ fairteiler, origins, categories, companies, tutorial }}
    />
  );
}
