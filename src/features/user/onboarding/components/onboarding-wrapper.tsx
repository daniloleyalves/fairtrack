'use client';

import { UserPreferencesProvider } from '@/lib/services/preferences-service';
import { OnboardingFlow } from './onboarding-flow';
import { OnboardingData } from '@/server/user/types';

export function OnboardingWrapper({
  initialData,
}: {
  initialData: OnboardingData;
}) {
  return (
    <UserPreferencesProvider>
      <OnboardingFlow initialData={initialData} />
    </UserPreferencesProvider>
  );
}
