import { Suspense } from 'react';
import { ContributionPageSkeleton } from '@/features/contribution/components/contribution-page-skeleton';
import { ScanInvalid } from '@/features/qr-code/components/scan-invalid';
import { QrGuestContribution } from '@/features/qr-code/components/qr-guest-contribution';
import { loadScanContext } from '@/server/qr-code/scan-context';
import { getFairteilerBySlug } from '@/server/fairteiler/queries';

export default function ScanGuestPage() {
  return (
    <Suspense fallback={<ContributionPageSkeleton />}>
      <GuestContribution />
    </Suspense>
  );
}

async function GuestContribution() {
  const scan = await loadScanContext();

  if (!scan?.guestAccessViewId) {
    return (
      <div className='mx-auto mt-8 w-full max-w-lg px-2'>
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
