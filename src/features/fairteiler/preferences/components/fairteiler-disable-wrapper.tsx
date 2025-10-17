'use client';

import { toast } from 'sonner';
import { FairteilerDisableToggle } from './fairteiler-disable-toggle';
import { ACTIVE_FAIRTEILER_KEY } from '@/lib/config/api-routes';
import useSWRSuspense from '@/lib/services/swr';
import { FairteilerWithMembers } from '@/server/db/db-types';
import { updateFairteilerAction } from '@/lib/auth/auth-actions';
import useSWRMutation from 'swr/mutation';

interface FairteilerDisableWrapperProps {
  className?: string;
}

export function FairteilerDisableWrapper({
  className,
}: FairteilerDisableWrapperProps) {
  const { data: fairteiler } = useSWRSuspense<FairteilerWithMembers>(
    ACTIVE_FAIRTEILER_KEY,
  );

  const handleToggle = (checked: boolean) => {
    const formData = new FormData();
    // Append all fairteiler properties to FormData
    for (const [key, value] of Object.entries(fairteiler)) {
      if (value != null) {
        formData.append(key, String(value));
      }
    }
    // Set the disabled property based on the checked state
    formData.append('disabled', String(!checked));
    toggleFairteilerVisibility(formData);
  };

  // --- Mutations ---
  const { trigger: toggleFairteilerVisibility } = useSWRMutation(
    ACTIVE_FAIRTEILER_KEY,
    (_key, { arg }: { arg: FormData }) => updateFairteilerAction(arg),
    {
      optimisticData: (
        currentFairteilerCache: FairteilerWithMembers | undefined,
      ): FairteilerWithMembers => {
        const baseFairteiler: FairteilerWithMembers =
          currentFairteilerCache ?? fairteiler;

        return {
          ...baseFairteiler,
          disabled: !fairteiler.disabled,
        };
      },
      revalidate: false,
      rollbackOnError: true,
      onSuccess: (result) => {
        if (result.success && result.data) {
          toast.success(
            result.message ??
              'Fairteilersichtbarkeit erfolgreich aktualisiert!',
          );
        }
        if (!result.success && result.error) {
          toast.success(result.error);
        }
      },
      onError: (err) => {
        const message =
          err instanceof Error ? err.message : 'Aktualisierung fehlgeschlagen.';
        toast.error(message);
      },
    },
  );

  return (
    <FairteilerDisableToggle
      isDisabled={fairteiler.disabled}
      onToggleDisabled={handleToggle}
      className={className}
    />
  );
}
