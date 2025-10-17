'use client';

import { updateFairteilerAction } from '@/lib/auth/auth-actions';
import { fairteilerProfileSchema } from '@/features/fairteiler/profile/schemas/fairteiler-profile-schema';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';
import { Input } from '@components/ui/input';
import { cn, extractImageKeyword } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import useSWRMutation from 'swr/mutation';
import { z } from 'zod';
import { FairteilerWithMembers } from '@server/db/db-types';
import { preload, SWRConfig } from 'swr';
import { FairteilerTagsWrapper } from '../components/fairteiler-tags-wrapper';
import {
  ACTIVE_FAIRTEILER_KEY,
  CATEGORIES_BY_FAIRTEILER_KEY,
  CATEGORY_KEY,
  COMPANIES_BY_FAIRTEILER_KEY,
  COMPANY_KEY,
  ORIGIN_KEY,
  ORIGINS_BY_FAIRTEILER_KEY,
} from '@/lib/config/api-routes';
import useSWRSuspense, { fetcher } from '@/lib/services/swr';

preload(ORIGIN_KEY, fetcher);
preload(CATEGORY_KEY, fetcher);
preload(COMPANY_KEY, fetcher);
preload(ORIGINS_BY_FAIRTEILER_KEY, fetcher);
preload(CATEGORIES_BY_FAIRTEILER_KEY, fetcher);
preload(COMPANIES_BY_FAIRTEILER_KEY, fetcher);

// --- 2. Data Fetching Component ---
export function ProfileFormWrapper() {
  const { data: fairteiler } = useSWRSuspense<FairteilerWithMembers>(
    ACTIVE_FAIRTEILER_KEY,
    {
      fetcher,
      suspense: true,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnMount: false,
    },
  );

  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnMount: false,
        revalidateIfStale: false,
        revalidateOnReconnect: true,
      }}
    >
      <div className='space-y-6'>
        <FairteilerProfileForm fairteiler={fairteiler} />
        <FairteilerTagsWrapper />
      </div>
    </SWRConfig>
  );
}

function FairteilerProfileForm({
  fairteiler,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  fairteiler: FairteilerWithMembers;
}) {
  // --- Mutations ---
  const { trigger: updateTrigger, isMutating } = useSWRMutation(
    ACTIVE_FAIRTEILER_KEY,
    (_key, { arg }: { arg: FormData }) => updateFairteilerAction(arg),
    {
      optimisticData: (
        currentFairteilerCache: FairteilerWithMembers | undefined,
      ): FairteilerWithMembers => {
        const baseFairteiler: FairteilerWithMembers =
          currentFairteilerCache ?? fairteiler;

        const values = form.getValues();

        const updatedThumbnail =
          values.thumbnail instanceof File
            ? URL.createObjectURL(values.thumbnail)
            : values.thumbnail;

        return {
          ...baseFairteiler,
          ...values,
          thumbnail: updatedThumbnail,
        };
      },
      revalidate: false,
      rollbackOnError: true,
      onSuccess: (result) => {
        if (result.success && result.data) {
          toast.success(result.message ?? 'Profil erfolgreich aktualisiert!');
          form.reset(result.data);
        }
        if (!result.success && result.error) {
          toast.success(result.error);
          form.reset();
        }
      },
      onError: (err) => {
        const message =
          err instanceof Error ? err.message : 'Aktualisierung fehlgeschlagen.';
        toast.error(message);
        form.setError('root.serverError', { message });
      },
    },
  );

  const form = useForm<z.infer<typeof fairteilerProfileSchema>>({
    resolver: zodResolver(fairteilerProfileSchema),
    defaultValues: fairteiler,
  });

  // --- Image Preview Logic  ---
  const [preview, setPreview] = useState<string | null>(
    fairteiler?.thumbnail ?? null,
  );
  const fileRef = form.register('thumbnail');
  const thumbnail = useWatch({ control: form.control, name: 'thumbnail' });

  useEffect(() => {
    if (thumbnail instanceof File) {
      const objectUrl = URL.createObjectURL(thumbnail);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (typeof thumbnail === 'string') {
      setPreview(thumbnail);
    } else {
      setPreview(null);
    }
  }, [thumbnail]);
  // --- End of preview logic ---

  async function onSubmit(values: z.infer<typeof fairteilerProfileSchema>) {
    const formData = new FormData();
    for (const key in values) {
      const value = values[key as keyof typeof values];
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value != null) {
        formData.append(key, String(value));
      }
    }

    await updateTrigger(formData);
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Fairteilerprofil</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={cn('space-y-8', className)}
          >
            <div className='flex flex-col gap-8 lg:flex-row-reverse'>
              {/* Thumbnail Field */}
              <FormField
                control={form.control}
                name='thumbnail'
                render={({ field }) => (
                  <FormItem className='h-max'>
                    <FormLabel>Thumbnail</FormLabel>
                    <FormControl>
                      {preview ? (
                        <div className='flex flex-col gap-2 lg:min-w-[300px]'>
                          <div className='relative h-[200px]'>
                            <Image
                              src={preview}
                              fill
                              priority
                              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw'
                              alt='Fairteiler Thumbnail'
                              className='rounded-lg bg-secondary object-cover'
                            />
                          </div>
                          <div className='flex w-full items-center gap-2 self-end sm:max-w-[350px]'>
                            <p className='flex h-10 w-full items-center truncate rounded-lg border border-input bg-transparent px-3 py-2 text-sm'>
                              {thumbnail instanceof File
                                ? thumbnail.name
                                : extractImageKeyword(preview)}
                            </p>
                            <Button
                              type='button'
                              variant='outline'
                              size='icon'
                              disabled={isMutating}
                              onClick={() => field.onChange(null)}
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
                          disabled={isMutating}
                          onChange={(event) =>
                            field.onChange(event.target?.files?.[0] ?? null)
                          }
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* --- Text Fields --- */}
              <div className='flex w-full flex-col gap-8'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isMutating} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='geoLat'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Breitengrad
                        <span className='text-muted-foreground'>
                          (z.B. 48.7...)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isMutating} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='geoLng'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Längengrad
                        <span className='text-muted-foreground'>
                          (z.B. 9.15...)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isMutating} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Other fields like address, geoLink, website... */}
                <FormField
                  control={form.control}
                  name='address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Adresse
                        <span className='text-muted-foreground'>
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ''}
                          disabled={isMutating}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='geoLink'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Maps Link
                        <span className='text-muted-foreground'>
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ''}
                          disabled={isMutating}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='website'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Website
                        <span className='text-muted-foreground'>
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ''}
                          disabled={isMutating}
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
              </div>
            </div>
            {/* Submit Button */}
            <div className='mt-4 flex w-full justify-end'>
              <Button
                type='submit'
                disabled={isMutating || !form.formState.isDirty}
              >
                {isMutating && <Loader2 className='mr-2 size-4 animate-spin' />}
                Profil aktualisieren
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
