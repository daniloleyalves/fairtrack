'use client';

import { Checkbox } from '@components/ui/checkbox';
import { Separator } from '@components/ui/separator';
import { Button } from '@components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';
import { Input } from '@components/ui/input';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient } from '../auth-client';
import { getErrorMessage } from '../auth-helpers';
import { toast } from 'sonner';
import { handleClientOperation, noop } from '@/lib/client-error-handling';
import { SignUpFormValues, signUpSchema } from '../schemas';
import { checkInvitationAndUserAction } from '../auth-actions';

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [invitationData, setInvitationData] = useState<{
    invitation: {
      id: string;
      email: string;
      role: string | null;
      organizationId: string;
      organizationName: string;
    };
    userExists: boolean;
    isValid: boolean;
  } | null>(null);
  const [invitationError, setInvitationError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      passwordConfirm: '',
      tos: false,
      notificationsConsent: false,
    },
  });

  useEffect(() => {
    const invitationId = searchParams.get('invitationId');
    if (invitationId) {
      handleClientOperation(
        async () => {
          const result = await checkInvitationAndUserAction({ invitationId });

          if (result.success && result.data) {
            // If user already exists, redirect to sign-in with invitationId
            if (result.data.userExists) {
              router.push(`/sign-in?invitationId=${invitationId}`);
              return;
            }

            setInvitationData(result.data);

            // Pre-fill email for new user signup
            form.setValue('email', result.data.invitation.email);
          } else if (!result.success) {
            throw new Error(result.error || 'Failed to check invitation');
          }
        },
        noop,
        (error) => {
          console.error('Error checking invitation:', error);
          setInvitationError(
            'Einladung ungültig oder abgelaufen. Bitte wenden Sie sich an den Einladenden.',
          );
        },
      );
    }
  }, [searchParams, router, form]);

  async function onSubmit(values: z.infer<typeof signUpSchema>) {
    // Clear all existing errors before a new submission
    form.clearErrors(); // Clears all field and root errors
    try {
      await authClient.signUp.email(
        {
          firstName: values.firstName,
          lastName: values.lastName,
          name: `${values.firstName} ${values.lastName}`,
          email: values.email,
          password: values.password,
          isFirstLogin: true,
          isAnonymous: false,
          notificationsConsent: values.notificationsConsent,
        },
        {
          onRequest: () => {
            setIsPending(true);
          },
          onSuccess: async () => {
            await authClient.signIn.email(
              {
                email: values.email,
                password: values.password,
              },
              {
                onSuccess: async () => {
                  // Accept invitation if present and valid
                  if (invitationData?.isValid) {
                    try {
                      await authClient.organization.acceptInvitation({
                        invitationId: invitationData.invitation.id,
                      });
                    } catch (error) {
                      console.error('Error accepting invitation:', error);
                      // Continue with normal flow even if invitation acceptance fails
                    }
                  }

                  // Check organization membership to determine redirect
                  try {
                    const session = await authClient.getSession();
                    const hasOrganization =
                      session.data?.session?.activeOrganizationId;
                    router.push(
                      hasOrganization
                        ? '/hub/fairteiler/dashboard'
                        : '/hub/user/dashboard',
                    );
                  } catch (error) {
                    console.error('Error checking session:', error);
                    router.push('/hub/user/dashboard');
                  }
                },
                onError: (signInCtx) => {
                  console.error(
                    'Sign-in after signup failed:',
                    signInCtx.error,
                  );
                  toast.error(
                    getErrorMessage(
                      typeof signInCtx.error.cause === 'string'
                        ? signInCtx.error.cause
                        : undefined,
                      'de',
                    ) || 'Anmeldung nach Registrierung fehlgeschlagen.',
                  );
                  router.push('/sign-in');
                },
              },
            );
          },
          onError: (ctx) => {
            console.error(ctx.error);
            form.setError('root.serverError', {
              // eslint-disable-next-line
              message: getErrorMessage(ctx.error.code, 'de'),
            });
            setIsPending(false);
          },
        },
      );
    } catch (error: unknown) {
      console.error('Server Action: Error signing in.', error);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-8 text-center', className)}
        {...props}
      >
        {invitationData && (
          <div className='rounded-md bg-blue-50 p-3 text-center text-sm text-blue-800'>
            Sie wurden zu{' '}
            <strong>{invitationData.invitation.organizationName}</strong>{' '}
            eingeladen. Registrieren Sie sich, um die Einladung anzunehmen.
          </div>
        )}
        <FormField
          control={form.control}
          name='firstName'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='justify-center'>Vorname</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className='text-center'
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='lastName'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='justify-center'>Nachname</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className='text-center'
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='justify-center'>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className='text-center'
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator className='my-4' />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='justify-center'>Passwort</FormLabel>
              <FormControl>
                <div className='relative'>
                  <Input
                    {...field}
                    className='text-center'
                    placeholder='********'
                    type={showPassword ? 'text' : 'password'}
                    disabled={isPending}
                  />
                  {!showPassword ? (
                    <button
                      type='button'
                      className='absolute top-3 right-4 text-muted-foreground'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <Eye className='size-4' />
                    </button>
                  ) : (
                    <button
                      type='button'
                      className='absolute top-3 right-4 size-4 text-muted-foreground'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <EyeOff className='size-4' />
                    </button>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='passwordConfirm'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='justify-center'>
                Passwort bestätigen
              </FormLabel>
              <FormControl>
                <div className='relative'>
                  <Input
                    {...field}
                    className='text-center'
                    placeholder='********'
                    type={showPassword ? 'text' : 'password'}
                    disabled={isPending}
                  />
                  {!showPassword ? (
                    <button
                      type='button'
                      className='absolute top-3 right-4 text-muted-foreground'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <Eye className='size-4' />
                    </button>
                  ) : (
                    <button
                      type='button'
                      className='absolute top-3 right-4 size-4 text-muted-foreground'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <EyeOff className='size-4' />
                    </button>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='rounded-lg border p-4'>
          <FormField
            control={form.control}
            name='tos'
            render={({ field }) => (
              <FormItem>
                <div className='flex gap-3'>
                  <FormControl>
                    <Checkbox
                      size='28px'
                      className={
                        form.formState.errors.tos ? 'border-destructive' : ''
                      }
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked)}
                    />
                  </FormControl>
                  <FormDescription className='text-start'>
                    Mit der Registrierung stimme ich zu, dass meine Daten zur
                    Auswertung einer Wirkungsmessung verwendet werden dürfen.
                    Persönliche Daten werden bei der Wirkungsmessung nicht
                    berücksichtigt und auch nicht an Dritte weitergegeben.
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='rounded-lg border p-4'>
          <FormField
            control={form.control}
            name='notificationsConsent'
            render={({ field }) => (
              <FormItem>
                <div className='flex gap-3'>
                  <FormControl>
                    <Checkbox
                      size='28px'
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked)}
                    />
                  </FormControl>
                  <FormDescription className='text-start'>
                    Ich möchte über neue Funktionen und Verbesserungen der
                    Plattform informiert werden (keine Werbung).
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {invitationError && (
          <p className='text-center text-sm text-destructive'>
            {invitationError}
          </p>
        )}

        {form.formState.errors.root?.serverError && (
          <p className='text-sm text-destructive'>
            {form.formState.errors.root.serverError.message}
          </p>
        )}

        <Button
          size='lg'
          className='w-full'
          type='submit'
          disabled={isPending || !form.formState.isDirty}
        >
          {isPending ? <Loader2 className='animate-spin' /> : null}
          Jetzt Registrieren
        </Button>
      </form>
    </Form>
  );
}
