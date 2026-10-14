'use client';

import {
  disableAccessViewAction,
  resetAccessViewPasswordAction,
} from '@/lib/auth/auth-actions';
import { Member } from '@server/db/db-types';
import { Ban, KeyRound, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { ConfirmModal } from '@components/confirm-modal';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@components/ui/alert-dialog';
import { Button } from '@components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@ui/tooltip';
import { useFormAction } from '@/lib/hooks/use-form-action';
import { fairteilerKeys } from '@/server/fairteiler/query-keys';
import { useQueryClient } from '@tanstack/react-query';
import { CredentialDisplay } from '../forms/add-access-view-form';

export function AccessViewTableActions({ member }: { member: Member }) {
  return (
    <div className='flex items-center justify-end'>
      <ResetPasswordAction member={member} />
      <DisableAccessViewAction member={member} />
    </div>
  );
}

function ResetPasswordAction({ member }: { member: Member }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const resetPassword = useFormAction(
    resetAccessViewPasswordAction,
    undefined,
    {
      onSuccess: (data) => {
        setConfirmOpen(false);
        if (data) setNewPassword(data.password);
      },
    },
  );
  const isPending = resetPassword.isPending;

  const handleResetPassword = () => {
    resetPassword.execute({
      memberId: member.id,
      userId: member.user.id,
    });
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <ConfirmModal
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title='Passwort zurücksetzen?'
              description='Es wird ein neues Passwort erzeugt. Das alte Passwort ist danach ungültig und alle Geräte, die mit diesem Profil angemeldet sind, werden abgemeldet.'
              actionTitle='Zurücksetzen'
              onConfirm={handleResetPassword}
              isPending={isPending}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className='size-4 animate-spin' />
              ) : (
                <KeyRound className='size-4' />
              )}
            </ConfirmModal>
          </TooltipTrigger>
          <TooltipContent>
            <p>Passwort zurücksetzen</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <AlertDialog
        open={newPassword !== null}
        onOpenChange={(open) => {
          if (!open) setNewPassword(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Neues Passwort</AlertDialogTitle>
            <AlertDialogDescription>
              Das Passwort wird nur jetzt angezeigt. Bitte teile die neuen
              Anmeldedaten sicher mit der entsprechenden Person.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='space-y-8'>
            <CredentialDisplay label='E-Mail:' value={member.user.email} />
            <CredentialDisplay label='Passwort:' value={newPassword ?? ''} />
            <div className='flex w-full justify-end pt-4'>
              <Button onClick={() => setNewPassword(null)}>Fertig</Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function DisableAccessViewAction({ member }: { member: Member }) {
  const queryClient = useQueryClient();
  const disableAccessView = useFormAction(disableAccessViewAction, undefined, {
    successMessage: 'Zugang erfolgreich deaktiviert.',
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: fairteilerKeys.all().queryKey,
      });
    },
  });
  const isPending = disableAccessView.isPending;

  const handleDisableMember = () => {
    disableAccessView.execute({
      memberId: member.id,
      userId: member.user.id,
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
