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
import { PhoneInput } from '@components/ui/phone-input';
import { cn, extractImageKeyword } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { User } from '@/server/db/db-types';
import { userProfileSchema } from '../schemas/user-profile-schema';
import { updateUserAction } from '@/lib/auth/auth-actions';
import { useFormAction } from '@/lib/hooks/use-form-action';
import { userKeys } from '@/server/user/query-keys';
import { useQueryClient } from '@tanstack/react-query';
import { useSWRConfig } from 'swr';
import { USER_PROFILE_KEY } from '@/lib/config/api-routes';

export default function UserProfileForm({
  user,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  user: User;
}) {
  const form = useForm<z.infer<typeof userProfileSchema>>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: user,
  });

  const queryClient = useQueryClient();
  const { mutate: swrMutate } = useSWRConfig();

  const { execute, isPending } = useFormAction(updateUserAction, form, {
    successMessage: 'Profil erfolgreich aktualisiert!',
    onSuccess: (data) => {
      if (data) form.reset(data);
      void queryClient.invalidateQueries({ queryKey: userKeys.all().queryKey });
      // Transitional: user-settings-wrapper still reads USER_PROFILE_KEY via
      // SWR Suspense. Drop once slice 2 migrates that wrapper to useQuery.
      void swrMutate(USER_PROFILE_KEY);
    },
  });

  // Avatar preview logic
  const [preview, setPreview] = useState<string | null>(user?.avatar ?? null);
  const fileRef = form.register('avatar');
  const avatar = useWatch({ control: form.control, name: 'avatar' });

  useEffect(() => {
    if (avatar instanceof File) {
      const objectUrl = URL.createObjectURL(avatar);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (typeof avatar === 'string') {
      setPreview(avatar);
    } else {
      setPreview(null);
    }
  }, [avatar]);

  function onSubmit(values: z.infer<typeof userProfileSchema>) {
    execute(values);
  }
  const removeAvatar = () => {
    form.setValue('avatar', null, { shouldDirty: true });
  };

  return (
    <Form {...form} {...props}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('flex flex-col', className)}
      >
        <div className='flex flex-col-reverse gap-8 sm:flex-row'>
          <div className='flex w-full flex-col gap-4'>
            {/* Name Fields */}
            <FormField
              control={form.control}
              name='firstName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vorname</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='Enter your first name'
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
                  <FormLabel>Nachname</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='Enter your last name'
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon</FormLabel>
                  <FormControl>
                    <PhoneInput
                      value={field.value ?? ''}
                      onChange={(v) => field.onChange(v || null)}
                      disabled={isPending}
                      aria-invalid={!!form.formState.errors.phone}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Avatar Section */}
          <FormField
            control={form.control}
            name='avatar'
            render={({ field }) => (
              <FormItem className='flex flex-col items-center'>
                <FormLabel>Profilbild</FormLabel>
                <FormControl>
                  <div className='flex flex-col items-center gap-4'>
                    {/* Avatar Controls */}
                    {preview ? (
                      <div className='flex flex-col items-center gap-2'>
                        <div className='relative size-16'>
                          <Image
                            src={preview}
                            fill
                            priority
                            alt='Profile picture'
                            className='rounded-full object-cover'
                          />
                        </div>
                        <div className='flex w-full items-center gap-2 self-end sm:max-w-[250px]'>
                          <p className='flex h-9 items-center truncate rounded-lg border border-input bg-transparent px-3 py-2 text-sm'>
                            {avatar instanceof File
                              ? avatar.name
                              : extractImageKeyword(preview)}
                          </p>
                          <Button
                            type='button'
                            variant='outline'
                            disabled={isPending}
                            onClick={removeAvatar}
                            className='bg-input/40'
                            size='icon'
                          >
                            <X className='size-4 text-destructive' />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Input
                        {...fileRef}
                        type='file'
                        accept='image/jpeg,image/jpg,image/png'
                        disabled={isPending}
                        onChange={(event) =>
                          field.onChange(event.target?.files?.[0] ?? null)
                        }
                      />
                    )}
                  </div>
                </FormControl>
                <FormMessage className='text-center' />
              </FormItem>
            )}
          />
        </div>

        {/* Error Messages */}
        {form.formState.errors.root?.serverError && (
          <p className='text-sm text-destructive'>
            {form.formState.errors.root.serverError.message}
          </p>
        )}
        {/* Submit Button */}
        <div className='flex justify-end pt-4'>
          <Button type='submit' disabled={isPending || !form.formState.isDirty}>
            {isPending && <Loader2 className='size-4 animate-spin' />}
            Profil aktualisieren
          </Button>
        </div>
      </form>
    </Form>
  );
}
