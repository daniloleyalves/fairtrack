'use client';

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
import { Loader2, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { authClient } from '../auth-client';
import { getErrorMessage } from '../auth-helpers';
import { handleClientOperation, noop } from '@/lib/client-error-handling';
import { signInSchema, emailOnlySchema } from '../schemas';
import {
  checkInvitationAndUserAction,
  checkUserSecureStatusAction,
} from '../auth-actions';
import { MemberRolesEnum } from '../auth-permissions';
import { User } from '@/server/db/db-types';
import { SuccessContext } from 'better-auth/react';
import { SecurityModal } from '../components/security-modal';

export function SignInForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const [isPending, setIsPending] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [userChecked, setUserChecked] = useState(false);
  const [userIsSecure, setUserIsSecure] = useState<boolean | null>(null);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');
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
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const emailForm = useForm<z.infer<typeof emailOnlySchema>>({
    resolver: zodResolver(emailOnlySchema),
    defaultValues: {
      email: '',
    },
  });

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const invitationId = searchParams.get('invitationId');
    if (invitationId) {
      handleClientOperation(
        async () => {
          const result = await checkInvitationAndUserAction({ invitationId });

          if (result.success && result.data) {
            setInvitationData(result.data);

            // If user doesn't exist, redirect to sign-up with invitationId
            if (!result.data.userExists) {
              router.push(`/sign-up?invitationId=${invitationId}`);
              return;
            }

            // Pre-fill email if user exists
            emailForm.setValue('email', result.data.invitation.email, {
              shouldDirty: true,
            });
            signInForm.setValue('email', result.data.invitation.email, {
              shouldDirty: true,
            });
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
  }, [searchParams, router, emailForm, signInForm]);

  function handleBackToEmail() {
    setUserChecked(false);
    setUserIsSecure(null);
    signInForm.reset();
  }

  async function onEmailSubmit(values: z.infer<typeof emailOnlySchema>) {
    emailForm.clearErrors();
    setCurrentEmail(values.email);

    await handleClientOperation(
      async () => {
        const result = await checkUserSecureStatusAction({
          email: values.email,
        });

        if (result.success && result.data) {
          if (!result.data.userExists) {
            emailForm.setError('email', {
              message: 'Kein Konto mit dieser E-Mail-Adresse gefunden.',
            });
            return;
          }

          setUserChecked(true);
          setUserIsSecure(result.data.isSecure ?? false);

          if (result.data.isSecure) {
            // User is secure, show password field
            signInForm.setValue('email', values.email);
            // Focus password field after a short delay to ensure it's rendered
            setTimeout(() => {
              passwordInputRef.current?.focus();
            }, 100);
          } else {
            // User is not secure, show modal
            setShowSecurityModal(true);
          }
        } else {
          throw new Error('Failed to check user');
        }
      },
      setIsCheckingUser,
      (error) => {
        console.error('Error checking user:', error);
        emailForm.setError('root.serverError', {
          message:
            'Fehler beim Überprüfen der E-Mail-Adresse. Bitte versuchen Sie es erneut.',
        });
      },
    );
  }

  async function onSignInSubmit(values: z.infer<typeof signInSchema>) {
    signInForm.clearErrors();

    await handleClientOperation(
      async () => {
        await authClient.signIn.email(
          {
            email: values.email,
            password: values.password,
          },
          {
            onSuccess: async (
              res: SuccessContext<{
                redirect: boolean;
                token: string;
                user: User;
              }>,
            ) => {
              // Accept invitation if present and valid
              if (invitationData?.isValid) {
                try {
                  await authClient.organization.acceptInvitation({
                    invitationId: invitationData.invitation.id,
                  });
                  if (
                    invitationData.invitation.role === MemberRolesEnum.OWNER
                  ) {
                    await authClient.admin.setRole({
                      userId: res.data.user.id,
                      role: 'admin',
                    });
                  }
                } catch (error) {
                  console.error('Error accepting invitation:', error);
                }
              }

              const callbackUrl = searchParams.get('callbackUrl');
              if (callbackUrl) {
                router.push(callbackUrl);
                return;
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
            onError: (ctx) => {
              console.error(ctx.error);
              signInForm.setError('root.serverError', {
                // eslint-disable-next-line
                message: getErrorMessage(ctx.error.code, 'de'),
              });
            },
          },
        );
      },
      setIsPending,
      (error) => {
        console.error('Error signing in:', error);
        signInForm.setError('root.serverError', {
          message: 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.',
        });
      },
    );
  }

  return (
    <>
      {invitationData && (
        <div className='mb-6 rounded-md bg-blue-50 p-3 text-center text-sm text-blue-800'>
          Sie wurden zu{' '}
          <strong>{invitationData.invitation.organizationName}</strong>{' '}
          eingeladen. Melden Sie sich an, um die Einladung anzunehmen.
        </div>
      )}

      {!userChecked || !userIsSecure ? (
        <Form {...emailForm}>
          <form
            onSubmit={emailForm.handleSubmit(onEmailSubmit)}
            className={cn('space-y-8', className)}
            {...props}
          >
            <FormField
              control={emailForm.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='justify-center'>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className='text-center'
                      placeholder='email@example.com'
                      disabled={isCheckingUser}
                    />
                  </FormControl>
                  <FormMessage className='text-center' />
                </FormItem>
              )}
            />

            {invitationError && (
              <p className='text-center text-sm text-destructive'>
                {invitationError}
              </p>
            )}

            {emailForm.formState.errors.root?.serverError && (
              <p className='text-center text-sm text-destructive'>
                {emailForm.formState.errors.root.serverError.message}
              </p>
            )}

            <Button
              size='lg'
              className='w-full'
              type='submit'
              disabled={isCheckingUser || !emailForm.formState.isDirty}
            >
              {isCheckingUser ? (
                <Loader2 className='animate-spin' />
              ) : (
                <ArrowRight />
              )}
              Weiter
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...signInForm}>
          <form
            onSubmit={signInForm.handleSubmit(onSignInSubmit)}
            className={cn('space-y-8', className)}
            {...props}
          >
            <FormField
              control={signInForm.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='justify-center'>Email</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        {...field}
                        className='text-center'
                        placeholder='email@example.com'
                        disabled={true}
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='absolute top-1/2 right-1 h-8 -translate-y-1/2 px-2 text-xs'
                        onClick={() => handleBackToEmail()}
                      >
                        Ändern
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage className='text-center' />
                </FormItem>
              )}
            />

            <FormField
              control={signInForm.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='justify-center'>Passwort</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      ref={passwordInputRef}
                      className='text-center'
                      type='password'
                      placeholder='passwort'
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage className='text-center' />
                </FormItem>
              )}
            />

            {signInForm.formState.errors.root?.serverError && (
              <p className='text-center text-sm text-destructive'>
                {signInForm.formState.errors.root.serverError.message}
              </p>
            )}

            <Button
              size='lg'
              className='w-full'
              type='submit'
              disabled={isPending || !signInForm.formState.isDirty}
            >
              {isPending ? <Loader2 className='animate-spin' /> : <Lock />}
              Anmelden
            </Button>
          </form>
        </Form>
      )}

      <Button asChild variant='link' className='mx-auto mt-4 w-full'>
        <Link href='/reset-password'>Passwort zurücksetzen</Link>
      </Button>

      <SecurityModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        userEmail={currentEmail}
      />
    </>
  );
}
