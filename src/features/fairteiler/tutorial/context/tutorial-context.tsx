'use client';

import { createContext, useContext, useReducer, type ReactNode } from 'react';
import useSWRSuspense, { fetcher } from '@/lib/services/swr';
import useSWRMutation from 'swr/mutation';
import { FAIRTEILER_TUTORIAL_KEY } from '@/lib/config/api-routes';
import { FairteilerTutorialWithSteps } from '@/server/db/db-types';
import {
  addFairteilerTutorialAction,
  addFairteilerTutorialStepAction,
  removeFairteilerTutorialAction,
  removeFairteilerTutorialStepAction,
  updateFairteilerTutorialAction,
  updateFairteilerTutorialStepAction,
} from '@/server/tutorial/actions';
import { toast } from 'sonner';
import { invokeAction } from '@/lib/hooks/use-form-action';
import {
  TutorialFormData,
  TutorialStepFormData,
} from '../schemas/fairteiler-tutorial-schema';

type AddStepInput = Omit<TutorialStepFormData, 'id'> & { tutorialId: string };
type UpdateStepInput = TutorialStepFormData & {
  id: string;
  tutorialId: string;
};

interface TutorialState {
  currentStepIndex: number;
  isEditMode: boolean;
  showStepForm: boolean;
  showTutorialForm: boolean;
  editingStep: TutorialStepFormData | null;
  isCreatingNewStep: boolean;
}

type TutorialAction =
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'TOGGLE_EDIT_MODE' }
  | { type: 'SHOW_STEP_FORM'; payload: boolean }
  | { type: 'SHOW_TUTORIAL_FORM'; payload: boolean }
  | { type: 'START_CREATING_STEP' }
  | { type: 'START_EDITING_STEP'; payload: TutorialStepFormData }
  | { type: 'CLEAR_STEP_FORM' }
  | { type: 'RESET_STATE' };

const initialState: TutorialState = {
  currentStepIndex: 0,
  isEditMode: false,
  showStepForm: false,
  showTutorialForm: false,
  editingStep: null,
  isCreatingNewStep: false,
};

function tutorialReducer(
  state: TutorialState,
  action: TutorialAction,
): TutorialState {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return { ...state, currentStepIndex: action.payload };
    case 'TOGGLE_EDIT_MODE':
      return { ...state, isEditMode: !state.isEditMode };
    case 'SHOW_STEP_FORM':
      return { ...state, showStepForm: action.payload };
    case 'SHOW_TUTORIAL_FORM':
      return { ...state, showTutorialForm: action.payload };
    case 'START_CREATING_STEP':
      return {
        ...state,
        showStepForm: true,
        editingStep: null,
        isCreatingNewStep: true,
      };
    case 'START_EDITING_STEP':
      return {
        ...state,
        showStepForm: true,
        editingStep: action.payload,
        isCreatingNewStep: false,
      };
    case 'CLEAR_STEP_FORM':
      return {
        ...state,
        showStepForm: false,
        editingStep: null,
        isCreatingNewStep: false,
      };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

interface TutorialContextValue {
  state: TutorialState;
  tutorial: FairteilerTutorialWithSteps | undefined;
  setCurrentStep: (index: number) => void;
  toggleEditMode: () => void;
  showStepForm: (show: boolean) => void;
  showTutorialForm: (show: boolean) => void;
  startCreatingStep: () => void;
  startEditingStep: (step: TutorialStepFormData) => void;
  clearStepForm: () => void;
  resetState: () => void;
  addTutorial: (data: TutorialFormData) => Promise<void>;
  updateTutorial: (data: TutorialFormData) => Promise<void>;
  removeTutorial: (data: { id: string }) => Promise<void>;
  toggleTutorialActive: (
    tutorial: FairteilerTutorialWithSteps,
  ) => Promise<void>;
  addStep: (data: AddStepInput) => Promise<void>;
  updateStep: (data: UpdateStepInput) => Promise<void>;
  removeStep: (data: { id: string }) => Promise<void>;
}

const TutorialContext = createContext<TutorialContextValue | null>(null);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tutorialReducer, initialState);

  const { data: tutorial } = useSWRSuspense<
    FairteilerTutorialWithSteps | undefined
  >(FAIRTEILER_TUTORIAL_KEY, {
    fetcher,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  const { trigger: addTutorialTrigger } = useSWRMutation(
    FAIRTEILER_TUTORIAL_KEY,
    (_key, { arg }: { arg: TutorialFormData }) =>
      invokeAction(addFairteilerTutorialAction, arg),
    {
      revalidate: false,
      rollbackOnError: true,
      onSuccess: () => {
        toast.success('Anleitung erfolgreich erstellt!');
      },
      onError: (err) => {
        const message =
          err instanceof Error ? err.message : 'Erstellung fehlgeschlagen.';
        toast.error(message);
      },
    },
  );

  const { trigger: updateTutorialTrigger } = useSWRMutation(
    FAIRTEILER_TUTORIAL_KEY,
    (_key, { arg }: { arg: TutorialFormData }) =>
      invokeAction(updateFairteilerTutorialAction, arg),
    {
      revalidate: false,
      rollbackOnError: true,
      onSuccess: () => {
        toast.success('Anleitung erfolgreich aktualisiert!');
      },
      onError: (err) => {
        const message =
          err instanceof Error ? err.message : 'Aktualisierung fehlgeschlagen.';
        toast.error(message);
      },
    },
  );

  const { trigger: removeTutorialTrigger } = useSWRMutation(
    FAIRTEILER_TUTORIAL_KEY,
    (_key, { arg }: { arg: { id: string } }) =>
      invokeAction(removeFairteilerTutorialAction, arg),
    {
      revalidate: false,
      rollbackOnError: true,
      onSuccess: () => {
        toast.success('Anleitung erfolgreich gelöscht!');
      },
      onError: (err) => {
        const message =
          err instanceof Error ? err.message : 'Löschung fehlgeschlagen.';
        toast.error(message);
      },
    },
  );

  const { trigger: addStepTrigger } = useSWRMutation(
    FAIRTEILER_TUTORIAL_KEY,
    (_key, { arg }: { arg: AddStepInput }) =>
      invokeAction(addFairteilerTutorialStepAction, arg),
    {
      revalidate: true,
      rollbackOnError: true,
      onSuccess: (result) => {
        if (result) {
          toast.success('Schritt erfolgreich hinzugefügt!');
          dispatch({
            type: 'SET_CURRENT_STEP',
            payload: result.sortIndex - 1,
          });
        }
      },
      onError: (err) => {
        const message =
          err instanceof Error ? err.message : 'Hinzufügen fehlgeschlagen.';
        toast.error(message);
      },
    },
  );

  const { trigger: updateStepTrigger } = useSWRMutation(
    FAIRTEILER_TUTORIAL_KEY,
    (_key, { arg }: { arg: UpdateStepInput }) =>
      invokeAction(updateFairteilerTutorialStepAction, arg),
    {
      revalidate: true,
      rollbackOnError: true,
      onSuccess: (result) => {
        if (result) {
          toast.success('Schritt erfolgreich aktualisiert!');
          dispatch({
            type: 'SET_CURRENT_STEP',
            payload: result.sortIndex - 1,
          });
        }
      },
      onError: (err) => {
        const message =
          err instanceof Error ? err.message : 'Aktualisierung fehlgeschlagen.';
        toast.error(message);
      },
    },
  );

  const { trigger: removeStepTrigger } = useSWRMutation(
    FAIRTEILER_TUTORIAL_KEY,
    (_key, { arg }: { arg: { id: string } }) =>
      invokeAction(removeFairteilerTutorialStepAction, arg),
    {
      revalidate: true,
      rollbackOnError: true,
      onSuccess: () => {
        toast.success('Schritt erfolgreich gelöscht!');
      },
      onError: (err) => {
        const message =
          err instanceof Error ? err.message : 'Löschung fehlgeschlagen.';
        toast.error(message);
      },
    },
  );

  const value: TutorialContextValue = {
    state,
    tutorial,
    setCurrentStep: (index) =>
      dispatch({ type: 'SET_CURRENT_STEP', payload: index }),
    toggleEditMode: () => dispatch({ type: 'TOGGLE_EDIT_MODE' }),
    showStepForm: (show) => dispatch({ type: 'SHOW_STEP_FORM', payload: show }),
    showTutorialForm: (show) =>
      dispatch({ type: 'SHOW_TUTORIAL_FORM', payload: show }),
    startCreatingStep: () => dispatch({ type: 'START_CREATING_STEP' }),
    startEditingStep: (step) =>
      dispatch({ type: 'START_EDITING_STEP', payload: step }),
    clearStepForm: () => dispatch({ type: 'CLEAR_STEP_FORM' }),
    resetState: () => dispatch({ type: 'RESET_STATE' }),
    addTutorial: async (data) => {
      await addTutorialTrigger(data, { optimisticData: data });
    },
    updateTutorial: async (data) => {
      await updateTutorialTrigger(data, { optimisticData: data });
    },
    removeTutorial: async (data) => {
      await removeTutorialTrigger(data, { optimisticData: null });
    },
    toggleTutorialActive: async (tutorial) => {
      const isActive = !tutorial.isActive;
      await updateTutorialTrigger(
        { ...tutorial, isActive },
        { optimisticData: { ...tutorial, isActive } },
      );
    },
    addStep: async (newStep) => {
      await addStepTrigger(newStep);
    },
    updateStep: async (data) => {
      await updateStepTrigger(data);
    },
    removeStep: async (data) => {
      await removeStepTrigger(data);
    },
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return context;
}
