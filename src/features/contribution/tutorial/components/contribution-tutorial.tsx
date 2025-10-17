'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { createContributionTutorialFlow } from '../contribution-tutorial-flow-config';
import { FairteilerTutorialStep, StepFlowProgress } from '@/server/db/db-types';
import { Button } from '@/components/ui/button';
import { PersistedStepFlow } from '@/lib/factories/step-flow-factory';
import Image from 'next/image';
import { HtmlContentRenderer } from '@/features/fairteiler/tutorial/components/html-content-renderer';
import { useSearchParams } from 'next/navigation';

export function ContributionTutorial({
  userId,
  fairteilerId,
  initialProgress,
  steps,
}: {
  userId: string;
  fairteilerId: string;
  initialProgress?: StepFlowProgress | null;
  steps: FairteilerTutorialStep[];
}) {
  const searchParams = useSearchParams();

  const initialStepFlow = {
    stepData: steps,
    ...initialProgress,
  } as PersistedStepFlow<FairteilerTutorialStep>;

  const useTutorialFlow = createContributionTutorialFlow(
    userId,
    fairteilerId,
    searchParams.get('fairteilerSlug') ?? '',
    steps,
    initialStepFlow,
  );
  const stepFlow = useTutorialFlow();
  const currentStep: FairteilerTutorialStep | undefined =
    stepFlow.currentStep &&
    (stepFlow.currentStep.metadata as FairteilerTutorialStep);

  return (
    <div className='flex h-[calc(100vh-100px)] justify-center p-2 sm:items-center'>
      <Card className='w-full max-w-4xl'>
        <CardHeader className='space-y-4 text-center'>
          <div className='flex items-center justify-between text-sm text-muted-foreground'>
            <span>
              Schritt {stepFlow.currentStepIndex + 1} von {stepFlow.totalSteps}
            </span>
          </div>
          <Progress value={stepFlow.progress} className='w-full' />
        </CardHeader>
        <Separator />
        <CardContent className='h-[calc(100vh-220px)] space-y-8 md:h-[400px]'>
          {currentStep?.title && (
            <CardTitle className='mt-4 mb-0 text-center text-3xl font-bold'>
              {currentStep.title}
            </CardTitle>
          )}
          {currentStep && (
            <div className='flex h-full flex-col items-center justify-center space-y-4'>
              {currentStep.media && (
                <div className='relative mb-4 h-24 w-24'>
                  <Image
                    src={currentStep.media ?? ''}
                    alt={stepFlow.currentStep.title}
                    fill
                    className='object-contain'
                    loading='eager'
                  />
                </div>
              )}

              <h3 className='max-w-lg text-center font-semibold'>
                {stepFlow.currentStep?.title}
              </h3>
              {currentStep?.content && (
                <HtmlContentRenderer
                  className='max-w-[400px]'
                  content={currentStep.content}
                />
              )}
            </div>
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
            {stepFlow.currentStep?.canSkip && (
              <Button
                variant='ghost'
                onClick={stepFlow.skip}
                disabled={stepFlow.isLoading}
              >
                Überspringen
              </Button>
            )}

            {!stepFlow.isLastStep ? (
              <Button
                onClick={stepFlow.next}
                disabled={stepFlow.isLoading || !stepFlow.isCurrentStepValid}
              >
                Weiter
              </Button>
            ) : (
              <Button
                onClick={stepFlow.completeFlow}
                disabled={stepFlow.isLoading || !stepFlow.isCurrentStepValid}
              >
                Fertig
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
