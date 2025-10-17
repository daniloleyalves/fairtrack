'use client';

import { removeMemberAction } from '@/lib/auth/auth-actions';
import { Member } from '@server/db/db-types';
import { cn } from '@/lib/utils';
import { IdCard, Loader2, MoreHorizontal, Save, Trash2 } from 'lucide-react';
import { Dispatch, SetStateAction, useState, useTransition } from 'react';

import { useSWRConfig } from 'swr';
import { ConfirmModal } from '@components/confirm-modal';
import { Button, buttonVariants } from '@ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ui/dropdown-menu';
import { updateMemberRoleAction } from '@/lib/auth/auth-actions';
import { MemberRolesEnum } from '@/lib/auth/auth-permissions';
import { useIsMobile } from '@/lib/hooks/use-devices';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ui/alert-dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@ui/drawer';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@ui/form';
import { RoleSelector } from './role-selector';
import { changeRoleSchema } from '../schemas/members-schema';
import { ACTIVE_FAIRTEILER_KEY } from '@/lib/config/api-routes';
import { handleAsyncAction } from '@/lib/client-error-handling';

export function MemberTableActions({ member }: { member: Member }) {
  const { mutate } = useSWRConfig();
  const [isPending, startTransition] = useTransition();

  const [isChangeRoleModalOpen, setChangeRoleModalOpen] = useState(false);
  const [isRemoveMemberModalOpen, setRemoveMemberModalOpen] = useState(false);

  const handleRemoveMember = () => {
    startTransition(() => {
      handleAsyncAction(
        () =>
          removeMemberAction({
            organizationId: member.fairteilerId,
            email: member.user.email,
          }),
        undefined,
        {
          showToast: true,
          onSuccess: async () => {
            await mutate(ACTIVE_FAIRTEILER_KEY);
            setRemoveMemberModalOpen(false);
          },
        },
      );
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon' }),
            'relative size-10 p-0',
          )}
          disabled={isPending} // Disable the trigger while any action is pending
        >
          <span className='sr-only'>Aktionsmenü öffnen</span>
          {isPending ? (
            <Loader2 className='animate-spin' />
          ) : (
            <MoreHorizontal className='size-5' />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => setChangeRoleModalOpen(true)}
            className='cursor-pointer gap-2 font-medium text-primary data-[highlighted]:text-primary'
          >
            <IdCard className='size-4' />
            Rolle ändern
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setRemoveMemberModalOpen(true)}
            className='cursor-pointer gap-2 font-medium text-destructive data-[highlighted]:text-destructive'
          >
            <Trash2 className='size-4' />
            Entfernen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangeRoleModal
        member={member}
        open={isChangeRoleModalOpen}
        setOpen={setChangeRoleModalOpen}
      />

      <ConfirmModal
        open={isRemoveMemberModalOpen}
        onOpenChange={setRemoveMemberModalOpen}
        title='Bist du dir absolut sicher?'
        description={
          <>
            Möchtest du <strong>{member.user.name}</strong> wirklich aus dem
            Team entfernen? Diese Aktion kann nicht rückgängig gemacht werden.
          </>
        }
        actionTitle='Entfernen'
        actionVariant='destructive'
        onConfirm={handleRemoveMember}
        isPending={isPending}
      />
    </>
  );
}

function ChangeRoleModal({
  member,
  open,
  setOpen,
}: {
  member: Member;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const isMobile = useIsMobile();
  const { mutate } = useSWRConfig();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof changeRoleSchema>>({
    resolver: zodResolver(changeRoleSchema),
    defaultValues: {
      userId: member.user.id,
      memberId: member.id,
      role: member.role as MemberRolesEnum,
    },
  });

  function onSubmit(values: z.infer<typeof changeRoleSchema>) {
    startTransition(() => {
      handleAsyncAction(
        () =>
          updateMemberRoleAction({
            userId: values.userId,
            memberId: values.memberId,
            role: values.role,
          }),
        form,
        {
          showToast: true,
          setFormError: true,
          onSuccess: async () => {
            await mutate(ACTIVE_FAIRTEILER_KEY);
            setOpen(false);
          },
        },
      );
    });
  }

  const FormContent = (
    <Form {...form}>
      <form
        id='changeRoleForm'
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-8'
      >
        <FormField
          control={form.control}
          name='role'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RoleSelector
                  value={field.value}
                  onValueChange={field.onChange}
                  type='team'
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.errors.root?.serverError && (
          <p className='text-sm text-destructive'>
            {form.formState.errors.root.serverError.message}
          </p>
        )}
      </form>
    </Form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className='mb-12 p-4'>
          <DrawerHeader className='mb-4 text-left'>
            <DrawerTitle>Rolle für {member.user.name} ändern</DrawerTitle>
            <DrawerDescription>
              Wähle eine neue Rolle für das Teammitglied, um dessen
              Zugriffsrechte anzupassen.
            </DrawerDescription>
          </DrawerHeader>
          {FormContent}
          <DrawerFooter className='flex-row gap-2 pt-8'>
            <DrawerClose asChild>
              <Button variant='outline' className='w-full' disabled={isPending}>
                Abbrechen
              </Button>
            </DrawerClose>
            <Button
              type='submit'
              form='changeRoleForm'
              className='w-full'
              disabled={isPending || !form.formState.isDirty}
            >
              {isPending ? (
                <Loader2 className='mr-2 size-4 animate-spin' />
              ) : (
                <Save className='mr-2 size-4' />
              )}
              Speichern
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Rolle für {member.user.name} ändern
          </AlertDialogTitle>
          <AlertDialogDescription>
            Wähle eine neue Rolle für das Teammitglied, um dessen Zugriffsrechte
            anzupassen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {FormContent}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Abbrechen</AlertDialogCancel>
          <Button
            type='submit'
            form='changeRoleForm'
            disabled={isPending || !form.formState.isDirty}
          >
            {isPending ? (
              <Loader2 className='mr-2 size-4 animate-spin' />
            ) : (
              <Save className='mr-2 size-4' />
            )}
            Speichern
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
