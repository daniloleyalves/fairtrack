'use client';

import { Button } from '@components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
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
import { Loader2, Lock } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
import z from 'zod';
import { getErrorMessage } from '../auth-helpers';
import { authClient } from '../auth-client';
import { sendInstructionsSchema } from '../schemas';

export function SendIntstructionsForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const [isPending, setIsPending] = useState(false);
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);
  const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof sendInstructionsSchema>>({
    resolver: zodResolver(sendInstructionsSchema),
    defaultValues: {
      email: '',
    },
  });

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      form.setValue('email', emailParam);
    }
  }, [searchParams, form]);

  async function onSubmit(values: z.infer<typeof sendInstructionsSchema>) {
    form.clearErrors();
    try {
      await authClient.requestPasswordReset(
        {
          email: values.email,
          redirectTo: '/reset-password',
        },
        {
          onRequest: () => {
            setIsPending(true);
          },
          onSuccess: () => {
            form.reset();
            setIsPending(false);
            setIsSubmitSuccessful(true);
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

  const isDirty = form.formState.isDirty;

  return (
    <div>
      {!isSubmitSuccessful ? (
        <Card>
          <CardHeader className='text-center'>
            <CardTitle>Passwort zurücksetzen</CardTitle>
            <CardDescription>
              Gebe deine E-Mail-Adresse an, um Anweisungen zum Zurücksetzen des
              Passworts zu erhalten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={cn('space-y-8 text-center', className)}
                {...props}
              >
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

                {form.formState.errors.root?.serverError && (
                  <p className='text-sm text-destructive'>
                    {form.formState.errors.root.serverError.message}
                  </p>
                )}

                <div className='flex w-full justify-end'>
                  <Button
                    size='lg'
                    className='w-full'
                    type='submit'
                    disabled={isPending || !isDirty}
                  >
                    {isPending ? (
                      <Loader2 className='animate-spin' />
                    ) : (
                      <Lock />
                    )}
                    Passwort aktualisieren
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Anweisungen gesendet</CardTitle>
            <CardDescription>
              Wenn deine E-Mail-Adresse gültig ist, erhältst du eine E-Mail mit
              Anweisungen zum Zurücksetzen deines Passworts. Bitte überprüfe
              deinen Spam-Ordner, wenn es nicht innerhalb weniger Minuten
              erscheint.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className='w-full'>
              <Link href='/sign-in'>Zurück zur Anmeldung</Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
