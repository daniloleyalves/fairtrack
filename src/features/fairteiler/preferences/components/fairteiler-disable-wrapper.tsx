'use client';

import { toast } from 'sonner';
import { FairteilerDisableToggle } from './fairteiler-disable-toggle';
import { FairteilerWithMembers } from '@/server/db/db-types';
import { toggleFairteilerDisabled } from '@/lib/auth/auth-actions';
import { invokeAction } from '@/lib/hooks/use-form-action';
import { getActiveFairteiler } from '@/server/fairteiler/queries';
import { fairteilerKeys } from '@/server/fairteiler/query-keys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface FairteilerDisableWrapperProps {
  className?: string;
}

export function FairteilerDisableWrapper({
  className,
}: FairteilerDisableWrapperProps) {
  const queryClient = useQueryClient();
  const activeKey = fairteilerKeys.active().queryKey;

  const { data: fairteiler } = useQuery({
    ...fairteilerKeys.active(),
    queryFn: () => getActiveFairteiler(),
  });

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
        if (!base) return current;
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
    },
  });

  if (!fairteiler) return null;

  return (
    <FairteilerDisableToggle
      isDisabled={fairteiler.disabled}
      onToggleDisabled={(checked) => toggle.mutate(checked)}
      className={className}
    />
  );
}
