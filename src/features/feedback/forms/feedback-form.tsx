'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { handleAsyncAction } from '@/lib/client-error-handling';
import { submitFeedbackAction } from '@/server/actions';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, MessageCircleHeart, Send } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { FeedbackFormData, feedbackSchema } from '../schemas/feedack-schema';

const categoryLabels = {
  general: 'Allgemeines Feedback',
  improvement: 'Verbesserungsvorschlag',
  feature: 'Feature-Wunsch',
  bug: 'Fehler melden',
};

export function FeedbackForm() {
  const [isSubmitting, startTransition] = useTransition();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      category: undefined,
      message: '',
    },
  });

  const onSubmit = (data: FeedbackFormData) => {
    startTransition(() => {
      handleAsyncAction(() => submitFeedbackAction(data), form, {
        showToast: true,
        setFormError: true,
        onSuccess: () => {
          setIsSubmitted(true);
        },
      });
    });
  };

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <div className='text-center'>
            <MessageCircleHeart className='mx-auto mb-4 size-12 text-primary' />
            <h3 className='mb-2 text-xl font-semibold'>
              Feedback erfolgreich gesendet!
            </h3>
            <p className='mb-4 text-muted-foreground'>
              Vielen Dank für dein Feedback. Wir schätzen deine Meinung und
              werden sie bei der Weiterentwicklung der Plattform
              berücksichtigen.
            </p>
            <Button
              onClick={() => {
                setIsSubmitted(false);
                form.reset();
              }}
              variant='outline'
            >
              Weiteres Feedback senden
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex flex-col gap-3 xs:flex-row'>
          <div className='flex size-10 min-w-10 items-center justify-center rounded-lg bg-destructive/10'>
            <MessageCircleHeart className='size-5 text-destructive' />
          </div>
          <div>
            <CardTitle>Dein Feedback</CardTitle>
            <CardDescription>
              Teile deine Gedanken, Ideen oder melde Probleme. Jedes Feedback
              hilft uns dabei, die Plattform zu verbessern.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategorie</FormLabel>

                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Wähle eine Kategorie aus' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='message'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deine Nachricht</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder='Teile deine Gedanken, Ideen oder Verbesserungsvorschläge mit uns...'
                      className='min-h-48'
                    />
                  </FormControl>
                  <div className='flex justify-between text-sm text-muted-foreground'>
                    <FormMessage />
                    <span>{field.value.length}/2000</span>
                  </div>
                </FormItem>
              )}
            />

            <Button
              type='submit'
              disabled={isSubmitting}
              size='lg'
              className='ml-auto flex'
            >
              {isSubmitting ? (
                <Loader2 className='size-4 animate-spin' />
              ) : (
                <Send className='size-4' />
              )}
              Feedback senden
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
