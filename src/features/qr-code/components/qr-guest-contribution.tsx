'use client';

import Link from 'next/link';
import { ArrowLeft, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GuestPreferencesProvider } from '@/lib/services/preferences-service';
import { ContributionProvider } from '@/features/contribution/context/contribution-context';
import { ContributionForm } from '@/features/contribution/components/form/contribution-form';
import ContributionTable from '@/features/contribution/components/contribution-table';
import { submitQrGuestContributionAction } from '@/server/contribution/actions';
import { SCAN_GUEST_SUCCESS_PATH, SCAN_PATH } from '@/server/qr-code/constants';
import type {
  Fairteiler,
  FairteilerTutorialWithSteps,
  GenericItem,
} from '@/server/db/db-types';

interface QrGuestContributionProps {
  initialData: {
    fairteiler: Fairteiler;
    origins: GenericItem[];
    categories: GenericItem[];
    companies: GenericItem[];
    tutorial?: FairteilerTutorialWithSteps;
  };
}

export function QrGuestContribution({ initialData }: QrGuestContributionProps) {
  const { fairteiler } = initialData;

  return (
    <GuestPreferencesProvider>
      <ContributionProvider initialData={initialData} isScanVerified>
        <div className='flex items-center gap-3 rounded-lg border-b bg-card p-4 sm:gap-4'>
          <Button variant='ghost' size='sm' asChild>
            <Link href={SCAN_PATH}>
              <ArrowLeft className='size-4' />
              <span className='hidden sm:inline'>Zurück</span>
            </Link>
          </Button>
          <div className='flex-1'>
            <h1 className='font-londrina text-lg font-bold sm:text-xl'>
              Als Gast beitragen
            </h1>
            <div className='flex items-center gap-1 text-xs text-muted-foreground sm:text-sm'>
              <MapPin className='size-3' />
              {fairteiler.name}
              {fairteiler.address && ` • ${fairteiler.address}`}
            </div>
          </div>
          <div className='flex items-center gap-1.5 text-primary'>
            <Users className='size-4' />
            <span className='text-xs font-medium'>Gastzugang</span>
          </div>
        </div>
        <div className='mt-6 flex flex-col gap-3'>
          <h2 className='font-londrina text-4xl font-bold tracking-wider'>
            Retteformular
          </h2>
          <ContributionForm
            config={{
              fairteilerId: fairteiler.id,
              successRedirect: SCAN_GUEST_SUCCESS_PATH,
            }}
            submitAction={submitQrGuestContributionAction}
          >
            <ContributionTable />
          </ContributionForm>
        </div>
      </ContributionProvider>
    </GuestPreferencesProvider>
  );
}
