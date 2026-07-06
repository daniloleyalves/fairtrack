'use client';

import { disableAccessViewAction } from '@/lib/auth/auth-actions';
import { Member } from '@server/db/db-types';
import { Ban, Loader2 } from 'lucide-react';
import { ConfirmModal } from '@components/confirm-modal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@ui/tooltip';
import { useTransition } from 'react';
import { handleAsyncAction } from '@/lib/client-error-handling';
import { fairteilerKeys } from '@/server/fairteiler/query-keys';
import { useQueryClient } from '@tanstack/react-query';

export function AccessViewTableActions({ member }: { member: Member }) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const handleDisableMember = () => {
    startTransition(() => {
      const actionArgument = {
        memberId: member.id,
        userId: member.user.id,
      };
      handleAsyncAction(
        () => disableAccessViewAction(actionArgument),
        undefined,
        {
          showToast: true,
          successMessage: 'Zugang erfolgreich deaktiviert.',
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: fairteilerKeys.active().queryKey,
            });
          },
        },
      );
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <ConfirmModal
            title='Bist du dir absolut sicher?'
            description='Der Zugang wird bei Deaktivierung für dieses Profil gesperrt. Daten, die mit diesem Profil erstellt wurden, bleiben für die Wirkungsmessung bestehen.'
            actionTitle='Deaktivieren'
            actionVariant='destructive'
            onConfirm={handleDisableMember}
            isPending={isPending}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <Ban className='size-4 text-destructive' />
            )}
          </ConfirmModal>
        </TooltipTrigger>
        <TooltipContent>
          <p>Zugangsprofil deaktivieren</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
