'use client';

import { useForm, useWatch } from 'react-hook-form';
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
  fairteilerTutorialStepSchema,
  TutorialStepFormData,
} from '../schemas/fairteiler-tutorial-schema';
import { Button } from '@/components/ui/button';
import { cn, extractImageKeyword } from '@/lib/utils';
import { Loader2, Plus, Save, X } from 'lucide-react';
import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Editor } from '@tinymce/tinymce-react';
import { Skeleton } from '@/components/ui/skeleton';
import { QuantityIncrementer } from '@/components/form/quantity-incrementer';
import { useClientEnv } from '@/lib/hooks/use-client-env';
import { useTutorial } from '../context/tutorial-context';
import { handleClientOperation } from '@/lib/client-error-handling';
import { Editor as TinyMCEEditor } from 'tinymce';

interface TutorialFormProps {
  lastIndex: number;
  isModalView?: boolean;
  tutorialId?: string;
}

export function TutorialStepForm({
  lastIndex,
  isModalView = false,
  tutorialId,
}: TutorialFormProps) {
  const { env, isLoading: envLoading } = useClientEnv();
  const { state, addStep, updateStep, clearStepForm } = useTutorial();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorReady, setEditorReady] = useState(false);

  const editorRef = useRef<TinyMCEEditor | null>(null);

  const form = useForm<TutorialStepFormData>({
    resolver: zodResolver(fairteilerTutorialStepSchema),
    defaultValues: {
      title: '',
      content: '',
      media: null,
      sortIndex: lastIndex + 1,
    },
  });

  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = form.register('media');
  const media = useWatch({ control: form.control, name: 'media' });

  useEffect(() => {
    let objectUrl: string | null = null;

    if (media instanceof File) {
      objectUrl = URL.createObjectURL(media);
      setPreview(objectUrl);
    } else if (typeof media === 'string') {
      setPreview(media);
    } else {
      setPreview(null);
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [media]);

  const clearForm = useCallback(() => {
    form.reset({
      title: '',
      content: '',
      media: null,
      sortIndex: lastIndex + 1,
    });
    setPreview(null);
    if (editorRef.current) {
      editorRef.current.setContent('');
    }
  }, [form, lastIndex]);

  useEffect(() => {
    if (state.editingStep) {
      form.reset(state.editingStep);
      // Set editor content after form is reset and editor is ready
      if (editorRef.current && editorReady) {
        editorRef.current.setContent(state.editingStep.content || '');
      }
    } else if (state.isCreatingNewStep) {
      clearForm();
    }
  }, [
    state.editingStep,
    state.isCreatingNewStep,
    form,
    clearForm,
    editorReady,
  ]);

  useEffect(() => {
    if (editorReady && editorRef.current && state.editingStep) {
      editorRef.current.setContent(state.editingStep.content || '');
    }
  }, [editorReady, state.editingStep]);

  const onSubmit = (data: TutorialStepFormData) => {
    handleClientOperation(
      async () => {
        const formData = new FormData();

        formData.append('title', data.title);
        formData.append('content', data.content);
        formData.append('sortIndex', data.sortIndex.toString());

        if (data.media) formData.append('media', data.media);
        if (data.id) formData.append('id', data.id);
        if (tutorialId) formData.append('tutorialId', tutorialId);

        try {
          if (state.editingStep?.id) {
            await updateStep(formData);
          } else {
            await addStep(formData);
          }
          clearStepForm();
          clearForm();
        } catch (error) {
          console.error('Error submitting step:', error);
        }
      },
      setIsSubmitting,
      (error) => {
        console.error('Error checking invitation:', error);
      },
    );
  };

  if (envLoading || !env) {
    return <Skeleton className='h-[600px] w-full' />;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          'flex px-4',
          isModalView ? 'flex-col gap-6' : 'items-end gap-2',
        )}
      >
        <FormField
          name='sortIndex'
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Schrittnummer</FormLabel>
              <FormControl>
                <QuantityIncrementer {...field} inputWidth={80} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='media'
          render={({ field }) => (
            <FormItem className='h-max max-w-sm'>
              <FormLabel>Bild oder Video</FormLabel>
              <FormControl>
                {preview ? (
                  <div className='flex flex-col gap-2'>
                    <div className='relative aspect-square h-[200px]'>
                      <Image
                        src={preview}
                        fill
                        priority
                        alt='Fairteiler Thumbnail'
                        className='mx-auto rounded-lg bg-muted object-contain'
                      />
                    </div>
                    <div className='flex w-full items-center gap-2 self-end sm:max-w-[350px]'>
                      <p className='flex h-10 w-full items-center truncate rounded-lg border border-input bg-transparent px-3 py-2 text-sm'>
                        {media instanceof File
                          ? media.name
                          : extractImageKeyword(preview)}
                      </p>
                      <Button
                        type='button'
                        variant='outline'
                        size='icon'
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

        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titel</FormLabel>
              <FormControl>
                <Input {...field} className='max-w-sm' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='content'
          render={() => (
            <FormItem>
              <FormLabel>Inhalt</FormLabel>
              <FormControl>
                <div className='relative z-50 h-[400px]'>
                  <EditorSkeleton />
                  <Editor
                    onInit={(_, editor) => {
                      editorRef.current = editor;
                      setEditorReady(true);

                      if (state.editingStep?.content) {
                        editor.setContent(state.editingStep.content);

                        form.setValue('content', state.editingStep.content, {
                          shouldValidate: false,
                          shouldDirty: false,
                        });
                      }
                    }}
                    onEditorChange={(newValue) =>
                      form.setValue('content', newValue, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    apiKey={env?.TINYMCE_KEY}
                    init={{
                      plugins: [
                        'anchor',
                        'autolink',
                        'charmap',
                        'codesample',
                        'emoticons',
                        'lists',
                        'table',
                        'media',
                        'searchreplace',
                        'visualblocks',
                      ],
                      toolbar:
                        'bold italic underline strikethrough | fontsize | align lineheight | checklist numlist bullist table | indent outdent | emoticons charmap',
                      menubar: false,
                      onboarding: false,

                      ui_mode: 'split',
                      skin: 'oxide',
                      content_css: 'default',

                      setup: (editor) => {
                        editor.on('init', () => {
                          const style = document.createElement('style');
                          style.textContent = `
                            .tox-tinymce-aux,
                            .tox-menu,
                            .tox-collection,
                            .tox-toolbar-overlord,
                            .tox-pop,
                            .tox-pop__dialog,
                            .tox-dialog-wrap,
                            .tox-dialog,
                            .tox-silver-sink,
                            .tox-collection--toolbar {
                              z-index: 99999 !important;
                            }
                          `;
                          document.head.appendChild(style);
                        });
                      },
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type='submit'
          disabled={!form.formState.isDirty && !state.editingStep}
          className={cn(isModalView ? 'w-full' : 'my-8')}
          size={isModalView ? 'default' : 'icon'}
        >
          {isModalView ? (
            state.editingStep ? (
              <>
                {isSubmitting ? <Loader2 className='animate-spin' /> : <Save />}
                Änderungen speichern
              </>
            ) : (
              <>
                {isSubmitting ? <Loader2 className='animate-spin' /> : <Plus />}
                Schritt erstellen
              </>
            )
          ) : (
            <Save />
          )}
        </Button>
      </form>
    </Form>
  );
}

function EditorSkeleton() {
  return <Skeleton className='absolute h-[400px] w-full bg-secondary' />;
}
