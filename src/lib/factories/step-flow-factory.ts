'use client';

// types/step-flow.ts
export interface StepConfig<TStepData = unknown, TMetadata = unknown> {
  id: string;
  title: string;
  description?: string;
  onEnter?: (stepData?: TStepData) => void | Promise<void>;
  onExit?: (stepData?: TStepData) => void | Promise<void>;
  onComplete?: (stepData?: TStepData) => void | Promise<void>;
  canSkip?: boolean;
  metadata?: TMetadata;
  triggerEvents?: string[];
  persistProgress?: boolean;
  requiresUserAction?: boolean;
}

export interface StepFlowState<TStepData = unknown> {
  currentStepIndex: number;
  currentStep: StepConfig<TStepData>;
  completedSteps: Set<string>;
  skippedSteps: Set<string>;
  isLoading: boolean;
  progress: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  totalSteps: number;
  isCurrentStepValid: boolean;
  isFlowCompleted: boolean;
}

export interface StepFlowActions<TStepData = unknown> {
  next: () => void;
  previous: () => void;
  goToStep: (stepId: string) => void;
  skip: () => void;
  reset: () => void;
  complete: () => void;
  completeFlow: () => void;
  setStepData: (stepId: string, data: TStepData) => void;
  getStepData: (stepId: string) => TStepData | undefined;
  syncProgress: () => Promise<void>;
}

export type StepFlowHook<TStepData = unknown> = StepFlowState<TStepData> &
  StepFlowActions<TStepData>;

export enum StepFlowEventType {
  STEP_STARTED = 'step_started',
  STEP_COMPLETED = 'step_completed',
  STEP_SKIPPED = 'step_skipped',
  FLOW_COMPLETED = 'flow_completed',
  PROGRESS_SAVED = 'progress_saved',
}

export interface StepFlowEvent<TMetadata = unknown> {
  type: StepFlowEventType;
  stepId: string;
  flowId: string;
  userId: string;
  metadata?: TMetadata;
  timestamp: Date;
}

export interface PersistedStepFlow<TStepData = unknown> {
  id?: string;
  flowId: string;
  userId: string;
  currentStepIndex: number;
  completedSteps: string[];
  skippedSteps: string[];
  stepData: Record<string, TStepData>;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EventTrigger<TMetadata = unknown> {
  eventId: string;
  userId: string;
  metadata?: TMetadata;
}

export interface StepFlowAPI<TStepData = unknown> {
  saveProgress: (
    flowId: string,
    userId: string,
    progress: Partial<PersistedStepFlow<TStepData>>,
  ) => Promise<void>;
}

// Flow completion configuration
export interface FlowCompletionConfig<TStepData = unknown> {
  onFlowComplete?: (
    flowData: Record<string, TStepData>,
  ) => void | Promise<void>;
  onStepComplete?: (
    stepId: string,
    stepData?: TStepData,
  ) => void | Promise<void>;
  autoCompleteOnLastStep?: boolean;
  requireAllStepsCompleted?: boolean;
}

// hooks
import { useCallback, useMemo, useReducer } from 'react';

interface StepFlowReducerState<TStepData = unknown> {
  currentStepIndex: number;
  completedSteps: Set<string>;
  skippedSteps: Set<string>;
  stepData: Record<string, TStepData>;
  isLoading: boolean;
  isFlowCompleted: boolean; // NEW
}

type StepFlowAction<TStepData = unknown> =
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'ADD_COMPLETED_STEP'; payload: string }
  | { type: 'REMOVE_COMPLETED_STEP'; payload: string }
  | { type: 'ADD_SKIPPED_STEP'; payload: string }
  | { type: 'SET_STEP_DATA'; payload: { stepId: string; data: TStepData } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_FLOW_COMPLETED'; payload: boolean } // NEW
  | { type: 'LOAD_PERSISTED_STATE'; payload: PersistedStepFlow<TStepData> }
  | { type: 'RESET' };

function stepFlowReducer<TStepData = unknown>(
  state: StepFlowReducerState<TStepData>,
  action: StepFlowAction<TStepData>,
): StepFlowReducerState<TStepData> {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return { ...state, currentStepIndex: action.payload };

    case 'ADD_COMPLETED_STEP': {
      const newCompletedSteps = new Set(state.completedSteps);
      newCompletedSteps.add(action.payload);
      return { ...state, completedSteps: newCompletedSteps };
    }

    case 'REMOVE_COMPLETED_STEP': {
      const newCompletedSteps = new Set(state.completedSteps);
      newCompletedSteps.delete(action.payload);
      return { ...state, completedSteps: newCompletedSteps };
    }

    case 'ADD_SKIPPED_STEP': {
      const newSkippedSteps = new Set(state.skippedSteps);
      newSkippedSteps.add(action.payload);
      return { ...state, skippedSteps: newSkippedSteps };
    }

    case 'SET_STEP_DATA':
      return {
        ...state,
        stepData: {
          ...state.stepData,
          [action.payload.stepId]: action.payload.data,
        },
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_FLOW_COMPLETED':
      return { ...state, isFlowCompleted: action.payload };

    case 'LOAD_PERSISTED_STATE':
      return {
        ...state,
        currentStepIndex: action.payload.currentStepIndex,
        completedSteps: new Set(action.payload.completedSteps),
        skippedSteps: new Set(action.payload.skippedSteps),
        stepData: action.payload.stepData,
        isFlowCompleted: action.payload.isCompleted ?? false,
      };

    case 'RESET':
      return {
        currentStepIndex: 0,
        completedSteps: new Set(),
        skippedSteps: new Set(),
        stepData: {},
        isLoading: false,
        isFlowCompleted: false,
      };

    default:
      return state;
  }
}

export function createStepFlow<TStepData = unknown, TMetadata = unknown>(
  flowId: string,
  userId: string,
  api: StepFlowAPI<TStepData>,
  steps: StepConfig<TStepData, TMetadata>[],
  initialProgress?: PersistedStepFlow<TStepData> | null,
  completionConfig?: FlowCompletionConfig<TStepData>,
) {
  const stepsLength = steps.length;

  return function useStepFlow(): StepFlowHook<TStepData> {
    const [state, dispatch] = useReducer(stepFlowReducer<TStepData>, {
      currentStepIndex: initialProgress?.currentStepIndex ?? 0,
      completedSteps: new Set<string>(initialProgress?.completedSteps ?? []),
      skippedSteps: new Set<string>(initialProgress?.skippedSteps ?? []),
      stepData: initialProgress?.stepData ?? {},
      isLoading: false,
      isFlowCompleted: initialProgress?.isCompleted ?? false,
    });

    const currentStep = steps[state.currentStepIndex];

    // Memoized computed values
    const progress = useMemo(() => {
      if (state.isFlowCompleted) return 100;
      return ((state.currentStepIndex + 1) / stepsLength) * 100;
    }, [state.currentStepIndex, state.isFlowCompleted, stepsLength]);

    const isCurrentStepValid = useMemo(() => {
      if (!currentStep?.requiresUserAction) return true;
      const stepData = state.stepData[currentStep.id];
      return stepData !== undefined && stepData !== null;
    }, [currentStep, state.stepData]);

    const navigationState = useMemo(
      () => ({
        canGoNext:
          !state.isFlowCompleted &&
          state.currentStepIndex < stepsLength - 1 &&
          isCurrentStepValid,
        canGoPrevious: !state.isFlowCompleted && state.currentStepIndex > 0,
        isFirstStep: state.currentStepIndex === 0,
        isLastStep: state.currentStepIndex === stepsLength - 1,
      }),
      [
        state.currentStepIndex,
        state.isFlowCompleted,
        stepsLength,
        isCurrentStepValid,
      ],
    );

    const isLoading = state.isLoading;

    // NEW: Check if all required steps are completed for flow completion
    const canCompleteFlow = useMemo(() => {
      if (completionConfig?.requireAllStepsCompleted) {
        return steps.every(
          (step) =>
            state.completedSteps.has(step.id) ||
            state.skippedSteps.has(step.id) ||
            step.canSkip,
        );
      }
      return true; // Can complete flow anytime if not requiring all steps
    }, [
      state.completedSteps,
      state.skippedSteps,
      steps,
      completionConfig?.requireAllStepsCompleted,
    ]);

    // Sync progress to database with explicit values (avoids stale state)
    const syncProgressWithValues = useCallback(
      async (
        currentIndex: number,
        completedSteps: Set<string>,
        skippedSteps: Set<string>,
        stepData: Record<string, TStepData>,
        isCompleted = false,
      ) => {
        try {
          const progressPercentage = isCompleted
            ? 100
            : ((currentIndex + 1) / stepsLength) * 100;
          await api.saveProgress(flowId, userId, {
            currentStepIndex: currentIndex,
            completedSteps: Array.from(completedSteps),
            skippedSteps: Array.from(skippedSteps),
            stepData,
            progress: progressPercentage,
            isCompleted,
            completedAt: isCompleted ? new Date() : undefined,
            updatedAt: new Date(),
          });
        } catch (error) {
          console.error('Failed to sync progress:', error);
        }
      },
      [api, flowId, userId, stepsLength],
    );

    // Legacy syncProgress for backward compatibility
    const syncProgress = useCallback(async () => {
      await syncProgressWithValues(
        state.currentStepIndex,
        state.completedSteps,
        state.skippedSteps,
        state.stepData,
        state.isFlowCompleted,
      );
    }, [state, syncProgressWithValues]);

    // Complete the entire flow
    const completeFlow = useCallback(async () => {
      if (state.isFlowCompleted || !canCompleteFlow) return;

      dispatch({ type: 'SET_FLOW_COMPLETED', payload: true });

      // Call flow completion callback
      if (completionConfig?.onFlowComplete) {
        try {
          await completionConfig.onFlowComplete(state.stepData);
        } catch (error) {
          console.error('Flow completion callback failed:', error);
        }
      }

      // Sync completion to database
      await syncProgressWithValues(
        state.currentStepIndex,
        state.completedSteps,
        state.skippedSteps,
        state.stepData,
        true, // isCompleted = true
      );
    }, [state, canCompleteFlow, completionConfig, syncProgressWithValues]);

    // Actions
    const goToStep = useCallback(
      (stepId: string) => {
        if (state.isFlowCompleted) return; // Prevent navigation if flow is completed

        const stepIndex = steps.findIndex((step) => step.id === stepId);
        if (stepIndex === -1) return;

        const currentStepData = state.stepData[currentStep.id];

        // Exit current step (fire-and-forget)
        if (currentStep?.onExit) {
          currentStep.onExit(currentStepData);
        }

        dispatch({ type: 'SET_CURRENT_STEP', payload: stepIndex });

        // Enter new step (fire-and-forget)
        const newStep = steps[stepIndex];
        const newStepData = state.stepData[newStep.id];

        if (newStep.onEnter) {
          newStep.onEnter(newStepData);
        }

        // Sync progress with correct values (fire-and-forget)
        syncProgressWithValues(
          stepIndex,
          state.completedSteps,
          state.skippedSteps,
          state.stepData,
          state.isFlowCompleted,
        );
      },
      [currentStep, steps, state, syncProgressWithValues],
    );

    const next = useCallback(() => {
      if (!navigationState.canGoNext) return;

      const currentStepData = state.stepData[currentStep.id];
      const nextIndex = state.currentStepIndex + 1;

      // Calculate new state values
      const newCompletedSteps = new Set(state.completedSteps);
      newCompletedSteps.add(currentStep.id);

      // Mark current step as completed
      dispatch({ type: 'ADD_COMPLETED_STEP', payload: currentStep.id });

      // Exit current step
      if (currentStep.onExit) {
        currentStep.onExit(currentStepData);
      }

      dispatch({ type: 'SET_CURRENT_STEP', payload: nextIndex });

      // Enter next step
      const nextStep = steps[nextIndex];
      const nextStepData = state.stepData[nextStep.id];

      if (nextStep.onEnter) {
        nextStep.onEnter(nextStepData);
      }

      // Sync progress with correct values
      syncProgressWithValues(
        nextIndex,
        newCompletedSteps,
        state.skippedSteps,
        state.stepData,
        state.isFlowCompleted,
      );
    }, [
      navigationState.canGoNext,
      currentStep,
      state,
      steps,
      syncProgressWithValues,
    ]);

    const previous = useCallback(() => {
      if (!navigationState.canGoPrevious) return;

      dispatch({ type: 'REMOVE_COMPLETED_STEP', payload: currentStep.id });
      dispatch({
        type: 'SET_CURRENT_STEP',
        payload: state.currentStepIndex - 1,
      });
    }, [navigationState.canGoPrevious, currentStep, state.currentStepIndex]);

    const skip = useCallback(() => {
      if (!currentStep.canSkip) return;

      dispatch({ type: 'ADD_SKIPPED_STEP', payload: currentStep.id });
      next();
    }, [currentStep, next]);

    const reset = useCallback(() => {
      dispatch({ type: 'RESET' });

      // Sync reset progress with correct values (fire-and-forget)
      syncProgressWithValues(
        0,
        new Set<string>(),
        new Set<string>(),
        {},
        false,
      );
    }, [syncProgressWithValues]);

    const complete = useCallback(async () => {
      const currentStepData = state.stepData[currentStep.id];

      // Calculate new completed steps
      const newCompletedSteps = new Set(state.completedSteps);
      newCompletedSteps.add(currentStep.id);

      dispatch({ type: 'ADD_COMPLETED_STEP', payload: currentStep.id });

      // Call step completion callback
      if (currentStep.onComplete) {
        try {
          await currentStep.onComplete(currentStepData);
        } catch (error) {
          console.error('Step completion callback failed:', error);
        }
      }

      // Call global step completion callback
      if (completionConfig?.onStepComplete) {
        try {
          await completionConfig.onStepComplete(
            currentStep.id,
            currentStepData,
          );
        } catch (error) {
          console.error('Global step completion callback failed:', error);
        }
      }

      // Check if this should trigger flow completion
      const shouldCompleteFlow =
        navigationState.isLastStep && completionConfig?.autoCompleteOnLastStep;

      if (shouldCompleteFlow && canCompleteFlow) {
        await completeFlow();
      } else {
        // Just sync step completion
        await syncProgressWithValues(
          state.currentStepIndex,
          newCompletedSteps,
          state.skippedSteps,
          state.stepData,
          state.isFlowCompleted,
        );
      }
    }, [
      currentStep,
      state,
      navigationState.isLastStep,
      completionConfig,
      canCompleteFlow,
      completeFlow,
      syncProgressWithValues,
    ]);

    const setStepData = useCallback(
      (stepId: string, data: TStepData) => {
        if (state.isFlowCompleted) return;
        dispatch({ type: 'SET_STEP_DATA', payload: { stepId, data } });
      },
      [state.isFlowCompleted],
    );

    const getStepData = useCallback(
      (stepId: string): TStepData | undefined => {
        return state.stepData[stepId];
      },
      [state.stepData],
    );

    return {
      // State
      currentStepIndex: state.currentStepIndex,
      currentStep,
      completedSteps: state.completedSteps,
      skippedSteps: state.skippedSteps,
      isLoading,
      progress,
      totalSteps: stepsLength,
      isCurrentStepValid,
      isFlowCompleted: state.isFlowCompleted,
      ...navigationState,

      // Actions
      next,
      previous,
      goToStep,
      skip,
      reset,
      complete,
      completeFlow,
      setStepData,
      getStepData,
      syncProgress,
    };
  };
}

// Enhanced API factory with flow completion support
export const createStepFlowAPI = <TStepData = unknown>(dbOperations: {
  saveProgress: (data: PersistedStepFlow<TStepData>) => Promise<void>;
}): StepFlowAPI<TStepData> => ({
  async saveProgress(
    flowId: string,
    userId: string,
    progress: Partial<PersistedStepFlow<TStepData>>,
  ) {
    // Create the data structure that matches your schema
    const saveData: PersistedStepFlow<TStepData> = {
      flowId,
      userId,
      currentStepIndex: progress.currentStepIndex ?? 0,
      completedSteps: progress.completedSteps ?? [],
      skippedSteps: progress.skippedSteps ?? [],
      stepData: progress.stepData ?? {},
      progress: progress.progress ?? 0,
      isCompleted: progress.isCompleted ?? false,
      completedAt: progress.completedAt,
      createdAt: progress.createdAt,
      updatedAt: progress.updatedAt,
    };

    await dbOperations.saveProgress(saveData);
  },
});
