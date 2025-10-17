// lib/components/fairteiler/members/add-access-view-form.tsx (Refactored with Centralized State)
'use client';

import { addAccessViewAction } from '@/lib/auth/auth-actions';
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
import { Label } from '@components/ui/label';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, CirclePlus, Copy, Loader2 } from 'lucide-react';
import { Dispatch, SetStateAction, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form'; // No need for UseFormReturn type export here

import { useSWRConfig } from 'swr';
import { z } from 'zod';
import { accessViewSchema } from '../schemas/members-schema';
import { RoleSelector } from '../components/role-selector';
import { ACTIVE_FAIRTEILER_KEY } from '@/lib/config/api-routes';
import { handleAsyncAction } from '@/lib/client-error-handling';
import { toast } from 'sonner';

interface Credentials {
  email: string;
  password: string;
}

export function AddAccessViewForm({
  setOpen,
  className,
  ...props
}: React.ComponentProps<'form'> & {
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { mutate } = useSWRConfig();

  const [isPending, startTransition] = useTransition();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [credentials, setCredentials] = useState<Credentials | null>(null);

  const form = useForm<z.infer<typeof accessViewSchema>>({
    resolver: zodResolver(accessViewSchema),
    defaultValues: {
      name: '',
      role: MemberRolesEnum.EMPLOYEE,
    },
  });

  function onSubmit(values: z.infer<typeof accessViewSchema>) {
    startTransition(() => {
      handleAsyncAction(() => addAccessViewAction(values), form, {
        showToast: false,
        setFormError: false,
        onSuccess: async (result) => {
          if (result.data) {
            setCredentials(result.data);
          }
          setFormSubmitted(true);
          await mutate(ACTIVE_FAIRTEILER_KEY);
        },
        onError: (err) => {
          console.error(err);
          const errorMessage =
            'Fehlgeschlagen. Möglicherweise bist du nicht befugt diese Aktion auszuführen';
          // Set general form error
          form.setError('root.serverError' as 'root' | `root.${string}`, {
            message: errorMessage,
          });
          toast.error(errorMessage);
        },
      });
    });
  }

  // --- Conditional Rendering for Different Views ---
  if (formSubmitted && credentials) {
    return (
      <div className={cn('space-y-8', className)}>
        <p
          className='text-sm text-muted-foreground'
          aria-description='credentials for the newly added access view'
        >
          Das Profil wurde erstellt. Bitte teile diese Anmeldedaten sicher mit
          der entsprechenden Person.
        </p>
        <CredentialDisplay label='E-Mail:' value={credentials.email} />
        <CredentialDisplay label='Passwort:' value={credentials.password} />
        <div className='flex w-full justify-end pt-4'>
          <Button onClick={() => setOpen(false)}>Fertig</Button>
        </div>
      </div>
    );
  }

  // Default view: the form itself
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-8', className)}
        {...props}
      >
        <p
          className='text-sm text-muted-foreground'
          aria-description='form to add access view to fairteiler'
        >
          Erstelle ein Zugangsprofil für Personen ohne eigenen Account, z.B. für
          Mitarbeitende eines Fairteilers oder Gast-Foodsaver*innen.
        </p>

        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name des Profils</FormLabel>
              <FormControl>
                <Input
                  placeholder='z.B. "Gastzugang"'
                  {...field}
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
                  type='views'
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
              <CirclePlus className='size-4' />
            )}
            Zugangsprofil anlegen
          </Button>
        </div>
      </form>
    </Form>
  );
}

// --- CredentialDisplay (Helper Component - Unchanged) ---
// This component remains separate as it's a generic display element.
function CredentialDisplay({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='space-y-2'>
      <Label className='capitalize'>{label}</Label>
      <div className='flex items-center'>
        <div className='flex h-10 flex-grow items-center justify-start rounded-l-lg border border-r-0 bg-secondary px-3'>
          <span className='truncate font-mono text-sm'>{value}</span>
        </div>
        <Button
          size='icon'
          variant='outline'
          className='h-10 rounded-l-none'
          onClick={onCopy}
          aria-label={`Copy ${label}`}
        >
          {copied ? <Check className='size-4' /> : <Copy className='size-4' />}
        </Button>
      </div>
    </div>
  );
}
