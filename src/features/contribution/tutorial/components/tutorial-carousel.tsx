'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FairteilerTutorialStep } from '@/server/db/db-types';
import Image from 'next/image';
import { HtmlContentRenderer } from '@/features/fairteiler/tutorial/components/html-content-renderer';
import { cn } from '@/lib/utils';

interface TutorialCarouselProps {
  steps: FairteilerTutorialStep[];
  onComplete?: () => void;
}

export function TutorialCarousel({ steps, onComplete }: TutorialCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [currentStep, setCurrentStep] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const sortedSteps = [...steps].sort((a, b) => a.sortIndex - b.sortIndex);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentStep(api.selectedScrollSnap());
    };

    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  // Reset scroll position when step changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentStep]);

  const nextStep = () => {
    if (currentStep < sortedSteps.length - 1) {
      api?.scrollNext();
    } else if (onComplete) {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      api?.scrollPrev();
    }
  };

  if (!steps.length) return null;

  return (
    <div
      ref={scrollContainerRef}
      className='my-4 flex h-full flex-col overflow-y-auto'
    >
      <div className='flex-1'>
        <Carousel
          setApi={setApi}
          opts={{
            watchDrag: true,
            duration: 20,
            skipSnaps: false,
            dragFree: false,
          }}
        >
          <CarouselContent>
            {sortedSteps.map((step) => (
              <CarouselItem key={step.id}>
                <div className='flex h-full flex-col items-center justify-center space-y-4'>
                  {step.media && (
                    <div className='relative mb-4 h-24 w-24'>
                      <Image
                        src={step.media}
                        alt={step.title}
                        fill
                        className='object-contain'
                        loading='eager'
                      />
                    </div>
                  )}

                  <h3 className='max-w-lg text-center font-semibold'>
                    {step.title}
                  </h3>
                  {step.content && (
                    <HtmlContentRenderer
                      className='max-w-[400px]'
                      content={step.content}
                    />
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <div className='mt-6 flex items-center justify-between'>
        <Button
          variant='outline'
          size='sm'
          onClick={prevStep}
          disabled={currentStep === 0}
          className='flex items-center gap-2'
        >
          <ChevronLeft className='h-4 w-4' />
          Zurück
        </Button>

        <div className='flex justify-center gap-2'>
          {sortedSteps.map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-2 w-2 rounded-full transition-colors',
                index === currentStep ? 'bg-primary' : 'bg-secondary',
              )}
              aria-label={`Gehe zu Schritt ${index + 1}`}
            />
          ))}
        </div>

        <Button
          size='sm'
          onClick={nextStep}
          className='flex items-center gap-2'
        >
          {currentStep < sortedSteps.length - 1 ? 'Weiter' : 'Fertig'}
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
