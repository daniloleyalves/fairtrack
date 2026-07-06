'use client';

import { toast } from 'sonner';
import { FairteilerDisableToggle } from './fairteiler-disable-toggle';
import { ACTIVE_FAIRTEILER_KEY } from '@/lib/config/api-routes';
import useSWRSuspense from '@/lib/services/swr';
import { FairteilerWithMembers } from '@/server/db/db-types';
import { toggleFairteilerDisabled } from '@/lib/auth/auth-actions';
import { invokeAction } from '@/lib/hooks/use-form-action';
import { fairteilerKeys } from '@/server/fairteiler/query-keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSWRConfig } from 'swr';

interface FairteilerDisableWrapperProps {
  className?: string;
}

export function FairteilerDisableWrapper({
  className,
}: FairteilerDisableWrapperProps) {
  const { data: fairteiler } = useSWRSuspense<FairteilerWithMembers>(
    ACTIVE_FAIRTEILER_KEY,
  );

  const queryClient = useQueryClient();
  const { mutate: swrMutate } = useSWRConfig();
  const activeKey = fairteilerKeys.active().queryKey;

  const toggle = useMutation({
    mutationFn: (disabled: boolean) =>
      invokeAction(toggleFairteilerDisabled, {
        disabled,
      }),
    onMutate: async (disabled) => {
      await queryClient.cancelQueries({ queryKey: activeKey });
      const previous =
        queryClient.getQueryData<FairteilerWithMembers>(activeKey);
      queryClient.setQueryData<FairteilerWithMembers>(activeKey, (current) => {
        const base = current ?? previous ?? fairteiler;
        return { ...base, disabled };
      });
      return { previous };
    },
    onError: (err, _disabled, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(activeKey, context.previous);
      }
      toast.error(
        err instanceof Error ? err.message : 'Aktualisierung fehlgeschlagen.',
      );
    },
    onSuccess: () => {
      toast.success('Fairteilersichtbarkeit erfolgreich aktualisiert!');
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: fairteilerKeys.all().queryKey,
      });
      // Transitional: sibling components still read ACTIVE_FAIRTEILER_KEY
      // via SWR. Drop once those move.
      void swrMutate(ACTIVE_FAIRTEILER_KEY);
    },
  });

  return (
    <FairteilerDisableToggle
      isDisabled={fairteiler.disabled}
      onToggleDisabled={(checked) => toggle.mutate(checked)}
      className={className}
    />
  );
}
