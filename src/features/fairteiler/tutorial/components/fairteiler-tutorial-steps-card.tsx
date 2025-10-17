'use client';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useIsMobile } from '@/lib/hooks/use-devices';
import { cn } from '@/lib/utils';
import { FairteilerTutorialStep } from '@/server/db/db-types';
import {
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import { useTutorial } from '../context/tutorial-context';
import { TutorialStepForm } from '../forms/tutorial-step-form';

import { HtmlContentRenderer } from './html-content-renderer';
import { ConfirmModal } from '@/components/confirm-modal';
import { TutorialStepFormData } from '../schemas/fairteiler-tutorial-schema';
import { useState } from 'react';

interface FairteilerTutorialStepsCardProps {
  steps: FairteilerTutorialStep[] | undefined;
  tutorialId?: string;
}

function isVideoFile(url: string): boolean {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  return videoExtensions.some((ext) => url.toLowerCase().includes(ext));
}

export function FairteilerTutorialStepsCard({
  steps,
  tutorialId,
}: FairteilerTutorialStepsCardProps) {
  const {
    state,
    setCurrentStep,
    startCreatingStep,
    startEditingStep,
    clearStepForm,
    removeStep,
  } = useTutorial();

  const [openRemovalConfirmation, setOpenRemovalConfirmation] = useState(false);

  const currentStep = steps?.[state.currentStepIndex];

  // Helper functions for step management
  const handleEditStep = (step: FairteilerTutorialStep) => {
    const stepFormData: TutorialStepFormData = {
      id: step.id,
      title: step.title,
      content: step.content,
      media: step.media ?? null,
      sortIndex: step.sortIndex,
    };
    startEditingStep(stepFormData);
  };

  const handleRemoveStep = async (stepId: string) => {
    if (!steps) {
      return;
    }
    try {
      await removeStep({ id: stepId });
      // Adjust current step index if needed
      if (state.currentStepIndex >= steps.length - 1) {
        setCurrentStep(Math.max(0, steps.length - 2));
      }
      setOpenRemovalConfirmation(false);
    } catch (error) {
      console.error('Error deleting step:', error);
    }
  };

  return (
    <>
      {steps?.length ? (
        <Card className='mx-auto w-full md:max-w-11/12 md:rounded-t-none'>
          <CardHeader>
            <Badge className='ml-auto' variant='outline'>
              Schritt {state.currentStepIndex + 1} von {steps.length}
            </Badge>
            {currentStep?.media && (
              <div
                className={cn(
                  isVideoFile(currentStep.media)
                    ? 'ascpect-video'
                    : 'aspect-auto',
                  'w-full overflow-hidden rounded-lg bg-muted',
                )}
              >
                {isVideoFile(currentStep.media) ? (
                  <video
                    src={currentStep.media}
                    controls
                    className='h-full w-full object-cover'
                    preload='metadata'
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={currentStep.media}
                    alt={currentStep.title}
                    className='mx-auto object-cover'
                  />
                )}
              </div>
            )}
          </CardHeader>

          <CardContent className='space-y-6'>
            {/* Current Step Content */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold'>{currentStep?.title}</h3>
                {currentStep && (
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleEditStep(currentStep)}
                    >
                      <Edit className='size-4' />
                      Bearbeiten
                    </Button>
                    <ConfirmModal
                      open={openRemovalConfirmation}
                      onOpenChange={setOpenRemovalConfirmation}
                      onConfirm={() => handleRemoveStep(currentStep.id!)}
                      title='Schritt löschen'
                      description={
                        <>
                          Möchtest du den Schritt "
                          <strong>{currentStep.title}</strong>" wirklich
                          löschen? Diese Aktion kann nicht rückgängig gemacht
                          werden.
                        </>
                      }
                      actionTitle='Löschen'
                      actionVariant='destructive'
                      triggerVariant='outline'
                      triggerSize='sm'
                    >
                      <Trash2 className='size-4' />
                    </ConfirmModal>
                  </div>
                )}
              </div>
              {currentStep?.content && (
                <HtmlContentRenderer content={currentStep.content} />
              )}
            </div>

            {/* Navigation Controls */}
            <div className='grid grid-cols-3'>
              <Button
                onClick={() => setCurrentStep(state.currentStepIndex - 1)}
                variant='outline'
                className='flex w-max items-center gap-2'
                disabled={state.currentStepIndex === 0}
              >
                <ChevronLeft className='h-4 w-4' />
                Zurück
              </Button>

              <div className='mx-auto flex items-center gap-1'>
                {steps.map((_, index) => (
                  <Button
                    key={index}
                    variant={
                      index === state.currentStepIndex ? 'default' : 'outline'
                    }
                    size='sm'
                    className='h-8 w-8 p-0'
                    onClick={() => setCurrentStep(index)}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>

              <Button
                onClick={() => setCurrentStep(state.currentStepIndex + 1)}
                disabled={steps.length - 1 === state.currentStepIndex}
                variant='outline'
                className='ml-auto flex w-max items-center gap-2'
              >
                Weiter
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>

            {/* Step Overview */}
            <div className='border-t pt-4'>
              <div className='mb-3 flex items-center justify-between gap-4'>
                <h4 className='text-sm font-medium text-muted-foreground'>
                  Alle Schritte:
                </h4>
                <Button size='sm' onClick={() => startCreatingStep()}>
                  <Plus className='size-4' />
                  Schritt erstellen
                </Button>
              </div>
              <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-4'>
                {steps.map((step, index) => (
                  <div key={step.id} className='group relative'>
                    <button
                      type='button'
                      onClick={() => setCurrentStep(index)}
                      className={cn(
                        'w-full cursor-pointer rounded-lg border p-3 text-left transition-colors hover:bg-muted/50',
                        index === state.currentStepIndex
                          ? 'border-primary bg-primary/5'
                          : 'border-border',
                      )}
                    >
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant={
                            index === state.currentStepIndex
                              ? 'default'
                              : 'outline'
                          }
                          className='h-5 w-5 rounded-full p-0 text-xs'
                        >
                          {index + 1}
                        </Badge>
                        <span className='truncate text-sm font-medium'>
                          {step.title}
                        </span>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className='mx-auto w-full md:max-w-11/12 md:rounded-t-none'>
          <CardContent>
            <div className='py-8 text-center'>
              <BookOpenText className='mx-auto mb-4 size-12 text-muted-foreground' />
              <h3 className='mb-2 font-medium'>Keine Schritte erstellt</h3>
              <Button onClick={() => startCreatingStep()}>
                <Plus className='size-4' />
                Schritt erstellen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <AddTutorialStepModal
        lastIndex={steps?.length ?? 0}
        open={state.showStepForm}
        onOpenChange={(open) => {
          if (!open) {
            clearStepForm();
          }
        }}
        tutorialId={tutorialId}
      />
    </>
  );
}

function AddTutorialStepModal({
  lastIndex,
  open,
  onOpenChange,
  tutorialId,
}: {
  lastIndex: number;
  open: boolean;
  onOpenChange: (e: boolean) => void;
  tutorialId?: string;
}) {
  const isMobile = useIsMobile();
  const { state } = useTutorial();

  const isEditing = !state.isCreatingNewStep && state.editingStep;
  const modalTitle = isEditing
    ? 'Schritt bearbeiten'
    : 'Neuen Schritt erstellen';
  const modalDescription = isEditing
    ? 'Bearbeite den Anleitungsschritt, indem du Titel, Bild oder Video und den Inhalt anpasst.'
    : 'Erstelle einen neuen Anleitungsschritt, indem du Titel, ein Bild oder Video und den Inhalt ergänzt.';
  if (!isMobile) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className='max-h-[95vh] px-2 py-4 sm:max-w-[98vw] xl:max-w-5xl'>
          <AlertDialogHeader className='mb-4 px-4'>
            <AlertDialogTitle>{modalTitle}</AlertDialogTitle>
            <AlertDialogDescription>{modalDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className='h-full max-h-[calc(95vh-180px)] overflow-y-auto'>
            <TutorialStepForm
              lastIndex={lastIndex}
              isModalView
              tutorialId={tutorialId}
            />
          </div>
          <AlertDialogCancel className='mx-4'>Abbrechen</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className='h-screen px-0 data-[vaul-drawer-direction=bottom]:max-h-[95vh] xs:px-4'>
        <DrawerHeader className='mb-4 text-left'>
          <DrawerTitle>{modalTitle}</DrawerTitle>
          <DrawerDescription>{modalDescription}</DrawerDescription>
        </DrawerHeader>
        <div className='flex-1 overflow-y-auto'>
          <TutorialStepForm
            lastIndex={lastIndex}
            isModalView
            tutorialId={tutorialId}
          />
        </div>
        <DrawerFooter className='pt-2'>
          <DrawerClose asChild>
            <Button variant='outline'>Abbrechen</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
