'use client';

import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  ChartBar,
  ClipboardList,
  LayoutDashboard,
  MapPin,
} from 'lucide-react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import type { ComponentType } from 'react';
import { useEffect, useRef, useState } from 'react';
import { TOUR_PERSONAS, tourTime, type TourPersona } from '../tour-steps';
import { FairteilerContributionScreen } from './screens/fairteiler/contribution-screen';
import { FairteilerDashboardScreen } from './screens/fairteiler/dashboard-screen';
import { FairteilerStatisticsScreen } from './screens/fairteiler/statistics-screen';
import { SuccessScreen } from './screens/fairteiler/success-screen';
import { DashboardPhone } from './screens/user/dashboard-phone';
import { FinderPhone } from './screens/user/finder-phone';
import { FormPhone } from './screens/user/form-phone';
import { SuccessPhone } from './screens/user/success-phone';
import { TourInstanceContext } from './svg-primitives';
import { TourCursor } from './tour-cursor';

const STAGE = { w: 1080, h: 640 };

const PERSONA_SCREENS: Record<
  TourPersona['id'],
  ComponentType<{ state: string }>[]
> = {
  user: [DashboardPhone, FinderPhone, FormPhone, SuccessPhone],
  fairteiler: [
    FairteilerDashboardScreen,
    FairteilerContributionScreen,
    SuccessScreen,
    FairteilerStatisticsScreen,
  ],
};

const STEP_ICONS: Record<
  TourPersona['id'],
  ComponentType<{ className?: string }>[]
> = {
  user: [LayoutDashboard, MapPin, ClipboardList, CheckCircle2],
  fairteiler: [LayoutDashboard, ClipboardList, CheckCircle2, ChartBar],
};

export function ProductTour({
  persona: personaId,
}: {
  persona: TourPersona['id'];
}) {
  const persona = TOUR_PERSONAS.find((p) => p.id === personaId)!;
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { amount: 0.35 });
  const reducedMotion = useReducedMotion();
  const [started, setStarted] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [step, setStep] = useState(0);
  const [cycle, setCycle] = useState(0);

  const currentStep = persona.steps[step];

  useEffect(() => {
    if (inView) setStarted(true);
  }, [inView]);

  useEffect(() => {
    const onVisibilityChange = () =>
      setPageVisible(document.visibilityState === 'visible');
    onVisibilityChange();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  useEffect(() => {
    if (!started || !inView || !pageVisible || reducedMotion) return;
    const timer = setTimeout(
      () => {
        if (step < persona.steps.length - 1) {
          setStep(step + 1);
        } else {
          setStep(0);
          setCycle((c) => c + 1);
        }
      },
      tourTime(currentStep.duration) * 1000,
    );
    return () => clearTimeout(timer);
  }, [
    step,
    cycle,
    started,
    inView,
    pageVisible,
    reducedMotion,
    persona,
    currentStep,
  ]);

  const jumpTo = (nextStep: number) => {
    setStep(nextStep);
    setCycle((c) => c + 1);
  };

  const camera = currentStep.camera;
  const tx = STAGE.w / 2 - camera.x * camera.scale;
  const ty = STAGE.h / 2 - camera.y * camera.scale;

  return (
    <TourInstanceContext.Provider value={persona.id}>
      <div ref={containerRef} className='mx-auto w-full max-w-5xl'>
        <div className='overflow-hidden rounded-3xl'>
          <svg
            viewBox={`0 0 ${STAGE.w} ${STAGE.h}`}
            className='h-auto w-full'
            aria-hidden='true'
          >
            <defs>
              <filter
                id={`tour-shadow-${persona.id}`}
                x='-20%'
                y='-20%'
                width='140%'
                height='140%'
              >
                <feDropShadow
                  dx='0'
                  dy='3'
                  stdDeviation='6'
                  floodColor='#000000'
                  floodOpacity='0.08'
                />
              </filter>
              <filter id={`tour-grayscale-${persona.id}`}>
                <feColorMatrix type='saturate' values='0' />
              </filter>
            </defs>
            <motion.g
              initial={false}
              animate={{ x: tx, y: ty, scale: camera.scale }}
              transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
              style={{ transformBox: 'view-box', originX: 0, originY: 0 }}
            >
              <g key={cycle}>
                {PERSONA_SCREENS[persona.id].map((Screen, i) => (
                  <g
                    key={i}
                    transform={`translate(${persona.offsets[i]}, ${persona.screenY})`}
                  >
                    <Screen
                      state={
                        i < step
                          ? 'done'
                          : i === step && started
                            ? 'active'
                            : 'idle'
                      }
                    />
                  </g>
                ))}
                {started ? (
                  <TourCursor step={currentStep} pointer={persona.pointer} />
                ) : null}
              </g>
            </motion.g>
          </svg>
        </div>

        <div className='mt-6 flex flex-wrap justify-center gap-2 sm:gap-3'>
          {persona.steps.map((tourStep, i) => {
            const Icon = STEP_ICONS[persona.id][i];
            const isActive = i === step;
            return (
              <button
                key={tourStep.id}
                type='button'
                onClick={() => jumpTo(i)}
                className={cn(
                  'relative flex items-center gap-2 overflow-hidden rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground',
                )}
              >
                {isActive && started && !reducedMotion ? (
                  <motion.span
                    key={`${step}-${cycle}`}
                    className='absolute inset-y-0 left-0 bg-primary/10'
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{
                      duration: tourTime(tourStep.duration),
                      ease: 'linear',
                    }}
                  />
                ) : null}
                <Icon className='relative size-4' />
                <span className='relative'>{tourStep.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </TourInstanceContext.Provider>
  );
}
