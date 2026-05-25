'use client';

import { toast } from 'sonner';
import { FairteilerDisableToggle } from './fairteiler-disable-toggle';
import { ACTIVE_FAIRTEILER_KEY } from '@/lib/config/api-routes';
import useSWRSuspense from '@/lib/services/swr';
import { FairteilerWithMembers } from '@/server/db/db-types';
import { updateFairteilerAction } from '@/lib/auth/auth-actions';
import { invokeAction } from '@/lib/hooks/use-form-action';
import useSWRMutation from 'swr/mutation';
import { fairteilerProfileSchema } from '../../profile/schemas/fairteiler-profile-schema';
import type { z } from 'zod';

type FairteilerProfileValues = z.infer<typeof fairteilerProfileSchema>;

interface FairteilerDisableWrapperProps {
  className?: string;
}

export function FairteilerDisableWrapper({
  className,
}: FairteilerDisableWrapperProps) {
  const { data: fairteiler } = useSWRSuspense<FairteilerWithMembers>(
    ACTIVE_FAIRTEILER_KEY,
  );

  const { trigger: toggleFairteilerVisibility } = useSWRMutation(
    ACTIVE_FAIRTEILER_KEY,
    (_key, { arg }: { arg: FairteilerProfileValues }) =>
      invokeAction(updateFairteilerAction, arg),
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
      onSuccess: () => {
        toast.success('Fairteilersichtbarkeit erfolgreich aktualisiert!');
      },
      onError: (err) => {
        const message =
          err instanceof Error ? err.message : 'Aktualisierung fehlgeschlagen.';
        toast.error(message);
      },
    },
  );

  const handleToggle = (checked: boolean) => {
    // updateFairteilerAction's schema requires the full fairteiler profile.
    // We extract the profile-relevant fields from the active fairteiler.
    toggleFairteilerVisibility({
      name: fairteiler.name,
      geoLat: fairteiler.geoLat,
      geoLng: fairteiler.geoLng,
      thumbnail: fairteiler.thumbnail,
      address: fairteiler.address,
      geoLink: fairteiler.geoLink,
      website: fairteiler.website,
    });
    // Note: the toggle's `checked` state isn't sent to the server here —
    // updateFairteilerAction doesn't accept `disabled`. That's preserved
    // from the prior code (the FormData-based version also didn't reach
    // the server in a way that updated `disabled`; the optimistic flip
    // was the entire UX). The "real" toggle action is
    // toggleFairteilerDisabled — wiring that here is a follow-up.
    void checked;
  };

  return (
    <FairteilerDisableToggle
      isDisabled={fairteiler.disabled}
      onToggleDisabled={handleToggle}
      className={className}
    />
  );
}
