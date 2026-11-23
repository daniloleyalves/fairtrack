'use client';

import { GuestPreferencesProvider } from '@/lib/services/preferences-service';
import { ContributionProvider } from '@/features/contribution/context/contribution-context';
import { ContributionHeader } from '@/features/contribution/components/contribution-header';
import { ContributionContent } from '@/features/contribution/components/contribution-content';
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
  return (
    <GuestPreferencesProvider>
      <ContributionProvider initialData={initialData} isScanVerified>
        <div className='flex min-h-screen flex-col'>
          <ContributionHeader />
          <ContributionContent />
        </div>
      </ContributionProvider>
    </GuestPreferencesProvider>
  );
}
