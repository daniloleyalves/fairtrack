'use client';

import { toast } from 'sonner';
import { FairteilerDisableToggle } from './fairteiler-disable-toggle';
import { Card, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FairteilerWithMembers } from '@/server/db/db-types';
import { toggleFairteilerDisabled } from '@/lib/auth/auth-actions';
import { invokeAction } from '@/lib/hooks/use-form-action';
import { getActiveFairteiler } from '@/server/fairteiler/queries';
import { fairteilerKeys } from '@/server/fairteiler/query-keys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserIcon } from 'lucide-react';

interface FairteilerDisableWrapperProps {
  className?: string;
}

export function FairteilerDisableWrapper({
  className,
}: FairteilerDisableWrapperProps) {
  const queryClient = useQueryClient();
  const activeKey = fairteilerKeys.active().queryKey;

  const {
    data: fairteiler,
    isPending,
    error,
  } = useQuery({
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

  if (isPending) {
    return <FairteilerDisableSkeleton />;
  }

  if (error) {
    throw error;
  }

  if (!fairteiler) return null;

  return (
    <FairteilerDisableToggle
      isDisabled={fairteiler.disabled}
      onToggleDisabled={(checked) => toggle.mutate(checked)}
      className={className}
    />
  );
}

function FairteilerDisableSkeleton() {
  return (
    <Card className='h-max'>
      <CardHeader className='flex justify-between'>
        <div className='flex flex-col gap-3 xs:flex-row'>
          <div className='flex size-10 min-w-10 items-center justify-center rounded-lg bg-primary/10'>
            <UserIcon className='size-5 text-primary' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-48 bg-secondary' />
            <div className='space-y-1'>
              <Skeleton className='h-2 w-56 bg-secondary' />
            </div>
          </div>
        </div>
        <Skeleton className='h-5 w-10 bg-secondary' />
      </CardHeader>
    </Card>
  );
}
