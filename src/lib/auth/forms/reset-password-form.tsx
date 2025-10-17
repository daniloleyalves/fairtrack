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
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { authClient } from '../auth-client';
import { getErrorMessage } from '../auth-helpers';
import { useRouter } from 'next/navigation';
import { resetPasswordSchema } from '../schemas';

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<'form'> & { token: string }) {
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      passwordConfirm: '',
    },
  });

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    // Clear all existing errors before a new submission
    form.clearErrors(); // Clears all field and root errors
    try {
      await authClient.resetPassword(
        {
          newPassword: values.password,
          token: props.token,
        },
        {
          onRequest: () => {
            setIsPending(true);
          },
          onSuccess: () => {
            router.push('/sign-in');
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
            disabled={isPending || !form.formState.isDirty}
          >
            {isPending ? <Loader2 className='animate-spin' /> : <Lock />}
            Passwort aktualisieren
          </Button>
        </div>
      </form>
    </Form>
  );
}
