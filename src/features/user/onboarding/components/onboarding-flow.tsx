'use client';

import { startTransition, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { createOnboardingFlow } from '../onboarding-flow-config';
import { Logo } from '@/lib/assets/logo';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Illustrations } from '@/lib/assets/illustrations';
import { Label } from '@/components/ui/label';
import {
  GamificationElement,
  OnboardingStepData,
  SelectedGamificationElement,
} from '../onboarding-flow-types';
import { ExperienceLevel } from '@/server/db/db-types';
import { Award, Sparkles, Flame, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { handleAsyncAction } from '@/lib/client-error-handling';
import { completeOnboardingAction } from '@/server/actions';
import { OnboardingData } from '@/server/dto';
import { useRouter } from 'next/navigation';

export function OnboardingFlow({
  initialData,
}: {
  initialData: OnboardingData;
}) {
  const useOnboardingFlow = createOnboardingFlow(initialData);
  const stepFlow = useOnboardingFlow();
  const router = useRouter();

  const handleStepDataChange = (stepId: string, data: OnboardingStepData) => {
    stepFlow.setStepData(stepId, data);
  };

  // Initialize gamification step data if not present
  const initializeGamificationStep = () => {
    if (
      stepFlow.currentStep.id === 'enable-gamification' &&
      !stepFlow.getStepData('enable-gamification')?.selectedGamificationElements
    ) {
      const enabledElements = initialData.gamificationElements.map(
        (element) => ({
          ...element,
          enabled: true,
        }),
      );
      handleStepDataChange('enable-gamification', {
        selectedGamificationElements: enabledElements,
      });
    }
  };

  // Initialize gamification step when entering it
  useEffect(() => {
    initializeGamificationStep();
  }, [stepFlow.currentStep.id]);

  const handleComplete = () => {
    const allStepData = {};
    ['foodsharing-experience', 'enable-gamification'].forEach((stepId) => {
      const data = stepFlow.getStepData(stepId);
      if (data) {
        Object.assign(allStepData, data);
      }
    });
    startTransition(() => {
      handleAsyncAction(
        () => completeOnboardingAction(allStepData),
        undefined,
        {
          showToast: true,
          onSuccess: (result) => {
            if (result.data?.redirectTo) {
              router.push(result.data?.redirectTo);
            }
          },
        },
      );
    });
  };

  if (stepFlow.isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='space-y-4 text-center'>
          <div className='mx-auto size-12 animate-spin rounded-full border-b-2 border-primary'></div>
          <p className='text-muted-foreground'>Lade Onboarding...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen justify-center p-2 sm:items-center'>
      <Card className='w-full max-w-4xl'>
        <CardHeader className='space-y-4 text-center'>
          <div className='flex items-center justify-between text-sm text-muted-foreground'>
            <span>
              Schritt {stepFlow.currentStepIndex + 1} von {stepFlow.totalSteps}
            </span>
            {/* <Badge variant='outline'>
              {Math.round(stepFlow.progress)}% abgeschlossen
            </Badge> */}
          </div>
          <Progress value={stepFlow.progress} className='w-full' />
        </CardHeader>
        <Separator />
        <CardContent className='h-[calc(100vh-220px)] space-y-8 md:h-[460px]'>
          {stepFlow.currentStep.title && (
            <CardTitle className='mt-4 mb-0 text-center text-3xl font-bold'>
              {stepFlow.currentStep.title}
            </CardTitle>
          )}
          {stepFlow.currentStep.description && (
            <CardDescription className='mx-auto mb-4 text-center text-lg sm:max-w-2/3'>
              {stepFlow.currentStep.description}
            </CardDescription>
          )}
          {stepFlow.currentStep.id === 'welcome' && <WelcomeStep />}

          {stepFlow.currentStep.id === 'how-to' && <HowToStep />}

          {stepFlow.currentStep.id === 'foodsharing-experience' && (
            <FoodsharingExperienceStep
              levels={initialData.experienceLevels}
              selectedLevel={
                stepFlow.getStepData('foodsharing-experience')?.selectedLevel
              }
              onLevelSelect={(level) =>
                handleStepDataChange('foodsharing-experience', {
                  selectedLevel: level,
                })
              }
            />
          )}

          {stepFlow.currentStep.id === 'enable-gamification' && (
            <GamificationStep
              elements={initialData.gamificationElements}
              selectedElements={
                stepFlow.getStepData('enable-gamification')
                  ?.selectedGamificationElements ?? []
              }
              onElementsSelect={(elements: SelectedGamificationElement[]) =>
                handleStepDataChange('enable-gamification', {
                  selectedGamificationElements: elements,
                })
              }
            />
          )}

          {stepFlow.currentStep.id === 'complete' && (
            <CompleteStep onComplete={handleComplete} />
          )}
        </CardContent>
        <Separator />
        <CardFooter className='z-50 flex justify-between'>
          {/* Navigation */}
          <Button
            variant='outline'
            onClick={stepFlow.previous}
            disabled={stepFlow.isFirstStep || stepFlow.isLoading}
          >
            Zurück
          </Button>

          <div className='flex gap-2'>
            {stepFlow.currentStep.canSkip && (
              <Button
                variant='ghost'
                onClick={stepFlow.skip}
                disabled={stepFlow.isLoading}
              >
                Überspringen
              </Button>
            )}

            {!stepFlow.isLastStep && (
              <Button
                onClick={stepFlow.next}
                disabled={stepFlow.isLoading || !stepFlow.isCurrentStepValid}
              >
                Weiter
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

// Step Components
function WelcomeStep() {
  return (
    <div className='flex h-full flex-col items-center justify-center gap-8'>
      <Logo className='h-24 w-full' />
      <h1 className='mt-2 text-center font-londrina text-5xl tracking-wider'>
        Willkommen
      </h1>
      <p className='mx-auto max-w-2xl text-center text-muted-foreground'>
        Mit FairTrack behältst du deine Lebensmittelabgaben immer im Blick und
        trägst aktiv dazu bei, Lebensmittelverschwendung zu vermeiden. Unsere
        Plattform unterstützt dich dabei, deinen Beitrag zur nachhaltigen
        Verteilung von Lebensmitteln transparent zu dokumentieren und mit
        anderen zu teilen.
      </p>
    </div>
  );
}

function HowToStep() {
  return (
    <CardHeader className='flex h-full flex-col items-center justify-center space-y-4'>
      <CardTitle className='my-4 text-center font-londrina text-4xl tracking-wider text-tertiary md:mb-12'>
        Und so funktioniert's
      </CardTitle>
      <ScrollArea className='h-[calc(100vh-310px)] md:h-full'>
        <div className='mx-8 grid grid-cols-1 gap-12 text-base font-semibold text-muted-foreground md:grid-cols-3'>
          <div className='col-span-1'>
            <Image
              src={Illustrations.walkingIllustration}
              alt='walking to fairteiler illustration'
              className='mx-auto w-full xs:w-3/4 md:w-full'
            />
            <h3 className='mt-8 text-center'>
              Bei FairTrack registrierte <br /> Fairteiler aufsuchen
            </h3>
          </div>
          <div className='col-span-1'>
            <Image
              src={Illustrations.arrivingIllustration}
              alt='arriving at fairteiler illustration'
              className='mx-auto w-full xs:w-3/4 md:w-full'
            />
            <h3 className='mt-8 text-center'>
              Lebensmittel abgeben und <br /> digitales Retteformular ausfüllen
            </h3>
          </div>
          <div className='col-span-1'>
            <Image
              src={Illustrations.statisticsIllustration}
              alt='statistics about food sharing illustration'
              className='mx-auto w-full xs:w-3/4 md:w-full'
            />
            <h3 className='mt-8 text-center'>
              Lebensmittelabgaben im <br /> Dashboard verfolgen
            </h3>
          </div>
        </div>
      </ScrollArea>
    </CardHeader>
  );
}

interface FoodsharingExperienceStepProps {
  levels: ExperienceLevel[];
  selectedLevel: ExperienceLevel | undefined;
  onLevelSelect: (level: ExperienceLevel) => void;
}

function FoodsharingExperienceStep({
  levels,
  selectedLevel,
  onLevelSelect,
}: FoodsharingExperienceStepProps) {
  return (
    <ScrollArea className='h-[calc(100vh-400px)] xs:h-[calc(100vh-380px)] sm:h-[calc(100vh-340px)] md:h-full'>
      <RadioGroup
        value={selectedLevel?.id ?? ''}
        onValueChange={(value) => {
          const level = levels.find((l) => l.id === value);
          if (level) onLevelSelect(level);
        }}
        className='grid grid-cols-1 gap-4 py-4 md:grid-cols-3'
      >
        {levels.map((level) => (
          <Label
            key={level.id}
            className={cn(
              'w-full',
              selectedLevel?.id !== level.id && 'p-[3px]',
            )}
          >
            <Card
              className={cn(
                'w-full cursor-pointer transition-colors',
                selectedLevel?.id === level.id
                  ? 'border-[3px] border-primary bg-primary/5'
                  : 'hover:bg-accent',
              )}
            >
              <CardContent className='flex flex-col items-center justify-center space-y-4 p-6 text-center'>
                <RadioGroupItem
                  value={level.id}
                  id={level.id}
                  className='sr-only'
                />
                <div className='text-4xl'>
                  {level.icon === 'rocket'
                    ? '🚀'
                    : level.icon === 'graduated'
                      ? '🎓'
                      : '⭐'}
                </div>
                <div className='font-semibold'>{level.name}</div>
              </CardContent>
            </Card>
          </Label>
        ))}
      </RadioGroup>
    </ScrollArea>
  );
}

interface GamificationStepProps {
  elements: GamificationElement[];
  selectedElements: SelectedGamificationElement[];
  onElementsSelect: (elements: SelectedGamificationElement[]) => void;
}

function GamificationStep({
  elements,
  selectedElements,
  onElementsSelect,
}: GamificationStepProps) {
  const handleElementToggle = (elementId: string) => {
    const existingElementIndex = selectedElements.findIndex(
      (el) => el.id === elementId,
    );

    if (existingElementIndex >= 0) {
      // Toggle existing element
      const updatedElements = selectedElements.map((el, index) =>
        index === existingElementIndex ? { ...el, enabled: !el.enabled } : el,
      );
      onElementsSelect(updatedElements);
    } else {
      // Add new element
      const element = elements.find((el) => el.id === elementId);
      if (element) {
        const newElement: SelectedGamificationElement = {
          ...element,
          enabled: true,
        };
        onElementsSelect([...selectedElements, newElement]);
      }
    }
  };

  return (
    <ScrollArea className='h-[calc(100vh-340px)] xs:h-[calc(100vh-350px)] sm:h-[calc(100vh-340px)] md:h-full'>
      <div className='grid grid-cols-1 gap-4 px-1 md:grid-cols-3'>
        {elements.map((element) => {
          const selectedElement = selectedElements.find(
            (el) => el.id === element.id,
          );
          const isSelected = selectedElement?.enabled ?? false;

          return (
            <Card
              key={element.id}
              className={cn(
                'w-full cursor-pointer transition-colors',
                isSelected
                  ? 'border-[3px] border-primary bg-primary/5'
                  : 'm-[3px] hover:bg-accent',
                !element.active && 'cursor-not-allowed border-muted opacity-50',
              )}
              onClick={() => {
                if (!element.active) return;
                handleElementToggle(element.id);
              }}
            >
              <CardContent className='relative space-y-4 p-6'>
                {!element.active && (
                  <div className='absolute top-1/2 left-1/2 -translate-x-1/2 rotate-325 rounded-lg bg-destructive p-1 px-2 text-sm font-medium text-white'>
                    Deaktiviert
                  </div>
                )}
                <div className='flex w-full flex-col items-center justify-center gap-4 text-center'>
                  {element.name === 'Streak' ? (
                    <Flame
                      className={cn(
                        'size-12 p-1',
                        element.active
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-muted-foreground text-muted-foreground',
                      )}
                    />
                  ) : element.name === 'Abzeichen' ? (
                    <Award
                      className={cn(
                        'size-12',
                        element.active
                          ? 'fill-primary text-yellow-400'
                          : 'fill-primary/50 text-yellow-400/50',
                      )}
                    />
                  ) : (
                    <Sparkles
                      className={cn(
                        'size-12',
                        element.active
                          ? 'text-purple-700'
                          : 'text-muted-foreground',
                      )}
                    />
                  )}
                  <div
                    className={cn(
                      'text-xl font-semibold',
                      !element.active && 'text-muted-foreground',
                    )}
                  >
                    {element.name}
                  </div>
                  <div
                    className={cn(
                      'mx-8 text-sm font-medium',
                      !element.active
                        ? 'text-muted-foreground/50'
                        : 'text-foreground/50',
                    )}
                  >
                    {element.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}

function CompleteStep({ onComplete }: { onComplete: () => void }) {
  const [buttonClicked, setButtonClicked] = useState(false);
  return (
    <div className='flex h-full flex-col items-center justify-center gap-8'>
      <Logo className='h-24 w-full' />
      <Button
        size='lg'
        className='p-8 font-londrina text-3xl transition-none'
        onClick={() => {
          setButtonClicked(true);
          onComplete();
        }}
      >
        {buttonClicked ? (
          <Loader2 className='mx-15.5 size-8 animate-spin' />
        ) : (
          <>Los Geht's!</>
        )}
      </Button>
    </div>
  );
}
