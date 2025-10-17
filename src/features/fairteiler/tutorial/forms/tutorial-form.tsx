'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  fairteilerTutorialSchema,
  TutorialFormData,
} from '../schemas/fairteiler-tutorial-schema';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Save } from 'lucide-react';

interface TutorialFormProps {
  tutorial?: { title: string };
  isModalView?: boolean;
  onSuccess: (data: TutorialFormData) => void;
}

export function TutorialForm({
  tutorial,
  isModalView = false,
  onSuccess,
}: TutorialFormProps) {
  const form = useForm<TutorialFormData>({
    resolver: zodResolver(fairteilerTutorialSchema),
    defaultValues: {
      title: tutorial?.title ?? '',
      isActive: true,
    },
  });

  const onSubmit = (data: TutorialFormData) => {
    onSuccess(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          'flex px-4',
          isModalView ? 'flex-col' : 'items-end gap-2',
        )}
      >
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem className='my-8 w-full'>
              <FormLabel>Titel</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type='submit'
          disabled={!form.formState.isDirty}
          className={cn(isModalView ? 'w-full' : 'my-8')}
          size={isModalView ? 'default' : 'icon'}
        >
          {isModalView ? 'Anleitung erstellen' : <Save />}
        </Button>
      </form>
    </Form>
  );
}
