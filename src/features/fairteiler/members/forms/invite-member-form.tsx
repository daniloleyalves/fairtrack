'use client';

import { inviteMemberAction } from '@/lib/auth/auth-actions';
import { MemberRolesEnum } from '@/lib/auth/auth-permissions';
import { Button } from '@components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';
import { Input } from '@components/ui/input';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Send } from 'lucide-react';
import { Dispatch, SetStateAction, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { useSWRConfig } from 'swr';
import { z } from 'zod';
import { RoleSelector } from '../components/role-selector';
import { inviteMemberSchema } from '../schemas/members-schema';
import { ACTIVE_FAIRTEILER_KEY } from '@/lib/config/api-routes';
import { handleAsyncAction } from '@/lib/client-error-handling';

export function InviteMemberForm({
  setOpen,
  className,
  ...props
}: React.ComponentProps<'form'> & {
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { mutate } = useSWRConfig();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof inviteMemberSchema>>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      role: MemberRolesEnum.MEMBER,
    },
  });

  function onSubmit(values: z.infer<typeof inviteMemberSchema>) {
    startTransition(() => {
      handleAsyncAction(() => inviteMemberAction(values), form, {
        showToast: true,
        onSuccess: async () => {
          await mutate(ACTIVE_FAIRTEILER_KEY);
          form.reset();
          setOpen(false);
        },
      });
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-8', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder='name@beispiel.com'
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <div className='flex w-full flex-col justify-end gap-4 pt-4 sm:flex-row'>
          <Button
            type='button'
            onClick={() => setOpen(false)}
            variant='outline'
            disabled={isPending}
          >
            Abbrechen
          </Button>
          <Button type='submit' disabled={isPending || !form.formState.isDirty}>
            {isPending ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <Send className='size-4' />
            )}
            Einladung senden
          </Button>
        </div>
      </form>
    </Form>
  );
}
