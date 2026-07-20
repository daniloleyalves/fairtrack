'use client';

import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  ChartBar,
  ClipboardList,
  LayoutDashboard,
  MapPin,
  Smartphone,
  Store,
} from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from 'motion/react';
import type { ComponentType } from 'react';
import { useEffect, useRef, useState } from 'react';
import { TOUR_PERSONAS } from '../tour-steps';
import { FairteilerContributionScreen } from './screens/fairteiler/contribution-screen';
import { FairteilerDashboardScreen } from './screens/fairteiler/dashboard-screen';
import { FairteilerStatisticsScreen } from './screens/fairteiler/statistics-screen';
import { SuccessScreen } from './screens/fairteiler/success-screen';
import { DashboardPhone } from './screens/user/dashboard-phone';
import { FinderPhone } from './screens/user/finder-phone';
import { FormPhone } from './screens/user/form-phone';
import { SuccessPhone } from './screens/user/success-phone';
import { TourCursor } from './tour-cursor';

const STAGE = { w: 1080, h: 640 };

const PERSONA_ICONS = { user: Smartphone, fairteiler: Store };

const PERSONA_SCREENS: Record<string, ComponentType<{ state: string }>[]> = {
  user: [DashboardPhone, FinderPhone, FormPhone, SuccessPhone],
  fairteiler: [
    FairteilerDashboardScreen,
    FairteilerContributionScreen,
    SuccessScreen,
    FairteilerStatisticsScreen,
  ],
};

const STEP_ICONS: Record<string, ComponentType<{ className?: string }>[]> = {
  user: [LayoutDashboard, MapPin, ClipboardList, CheckCircle2],
  fairteiler: [LayoutDashboard, ClipboardList, CheckCircle2, ChartBar],
};

export function ProductTour() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { amount: 0.35 });
  const reducedMotion = useReducedMotion();
  const [started, setStarted] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [personaIdx, setPersonaIdx] = useState(0);
  const [step, setStep] = useState(0);
  const [cycle, setCycle] = useState(0);

  const persona = TOUR_PERSONAS[personaIdx];
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
    const timer = setTimeout(() => {
      if (step < persona.steps.length - 1) {
        setStep(step + 1);
      } else {
        setPersonaIdx((personaIdx + 1) % TOUR_PERSONAS.length);
        setStep(0);
        setCycle((c) => c + 1);
      }
    }, currentStep.duration * 1000);
    return () => clearTimeout(timer);
  }, [
    step,
    personaIdx,
    cycle,
    started,
    inView,
    pageVisible,
    reducedMotion,
    persona,
    currentStep,
  ]);

  const jumpTo = (nextPersonaIdx: number, nextStep: number) => {
    setPersonaIdx(nextPersonaIdx);
    setStep(nextStep);
    setCycle((c) => c + 1);
  };

  const camera = currentStep.camera;
  const tx = STAGE.w / 2 - camera.x * camera.scale;
  const ty = STAGE.h / 2 - camera.y * camera.scale;

  return (
    <div ref={containerRef} className='mx-auto w-full max-w-5xl'>
      <div className='mb-6 flex justify-center gap-2'>
        {TOUR_PERSONAS.map((p, i) => {
          const Icon = PERSONA_ICONS[p.id];
          const isActive = i === personaIdx;
          return (
            <button
              key={p.id}
              type='button'
              onClick={() => jumpTo(i, 0)}
              className={cn(
                'flex items-center gap-2 rounded-full px-5 py-2.5 font-londrina text-lg tracking-wide transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/70',
              )}
            >
              <Icon className='size-5' />
              {p.label}
            </button>
          );
        })}
      </div>

      <div className='overflow-hidden rounded-3xl'>
        <svg
          viewBox={`0 0 ${STAGE.w} ${STAGE.h}`}
          className='h-auto w-full'
          aria-hidden='true'
        >
          <defs>
            <filter
              id='tour-shadow'
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
            <filter id='tour-grayscale'>
              <feColorMatrix type='saturate' values='0' />
            </filter>
          </defs>
          <AnimatePresence mode='wait'>
            <motion.g
              key={persona.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <motion.g
                initial={false}
                animate={{ x: tx, y: ty, scale: camera.scale }}
                transition={{ duration: 1, ease: 'easeInOut' }}
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
            </motion.g>
          </AnimatePresence>
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
              onClick={() => jumpTo(personaIdx, i)}
              className={cn(
                'relative flex items-center gap-2 overflow-hidden rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {isActive && started && !reducedMotion ? (
                <motion.span
                  key={`${personaIdx}-${step}-${cycle}`}
                  className='absolute inset-y-0 left-0 bg-primary/10'
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: tourStep.duration, ease: 'linear' }}
                />
              ) : null}
              <Icon className='relative size-4' />
              <span className='relative'>{tourStep.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
