'use client';

import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FairteilerTutorialWithSteps } from '@/server/db/db-types';
import {
  addFairteilerTutorialAction,
  addFairteilerTutorialStepAction,
  removeFairteilerTutorialAction,
  removeFairteilerTutorialStepAction,
  updateFairteilerTutorialAction,
  updateFairteilerTutorialStepAction,
} from '@/server/tutorial/actions';
import { tutorialKeys } from '@/server/tutorial/query-keys';
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
  addTutorial: (data: TutorialFormData) => Promise<unknown>;
  updateTutorial: (data: TutorialFormData) => Promise<unknown>;
  removeTutorial: (data: { id: string }) => Promise<unknown>;
  toggleTutorialActive: (
    tutorial: FairteilerTutorialWithSteps,
  ) => Promise<unknown>;
  addStep: (data: AddStepInput) => Promise<unknown>;
  updateStep: (data: UpdateStepInput) => Promise<unknown>;
  removeStep: (data: { id: string }) => Promise<unknown>;
}

const TutorialContext = createContext<TutorialContextValue | null>(null);

function showErrorToast(err: unknown, fallback: string) {
  toast.error(err instanceof Error ? err.message : fallback);
}

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tutorialReducer, initialState);
  const queryClient = useQueryClient();
  const tutorialKey = tutorialKeys.fairteilerTutorial().queryKey;
  const invalidateTutorial = () =>
    queryClient.invalidateQueries({ queryKey: tutorialKey });

  const { data: tutorialData } = useQuery(tutorialKeys.fairteilerTutorial());
  const tutorial = tutorialData ?? undefined;

  const addTutorialMutation = useMutation({
    mutationFn: (data: TutorialFormData) =>
      invokeAction(addFairteilerTutorialAction, data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: tutorialKey });
      const previous = queryClient.getQueryData<
        FairteilerTutorialWithSteps | undefined
      >(tutorialKey);
      queryClient.setQueryData(
        tutorialKey,
        data as unknown as FairteilerTutorialWithSteps,
      );
      return { previous };
    },
    onError: (err, _data, context) => {
      queryClient.setQueryData(tutorialKey, context?.previous);
      showErrorToast(err, 'Erstellung fehlgeschlagen.');
    },
    onSuccess: () => toast.success('Anleitung erfolgreich erstellt!'),
    onSettled: () => void invalidateTutorial(),
  });

  const updateTutorialMutation = useMutation({
    mutationFn: (data: TutorialFormData) =>
      invokeAction(updateFairteilerTutorialAction, data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: tutorialKey });
      const previous = queryClient.getQueryData<
        FairteilerTutorialWithSteps | undefined
      >(tutorialKey);
      if (previous) {
        queryClient.setQueryData<FairteilerTutorialWithSteps>(tutorialKey, {
          ...previous,
          ...data,
        });
      }
      return { previous };
    },
    onError: (err, _data, context) => {
      queryClient.setQueryData(tutorialKey, context?.previous);
      showErrorToast(err, 'Aktualisierung fehlgeschlagen.');
    },
    onSuccess: () => toast.success('Anleitung erfolgreich aktualisiert!'),
    onSettled: () => void invalidateTutorial(),
  });

  const removeTutorialMutation = useMutation({
    mutationFn: (data: { id: string }) =>
      invokeAction(removeFairteilerTutorialAction, data),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: tutorialKey });
      const previous = queryClient.getQueryData<
        FairteilerTutorialWithSteps | undefined
      >(tutorialKey);
      queryClient.setQueryData(tutorialKey, null);
      return { previous };
    },
    onError: (err, _data, context) => {
      queryClient.setQueryData(tutorialKey, context?.previous);
      showErrorToast(err, 'Löschung fehlgeschlagen.');
    },
    onSuccess: () => toast.success('Anleitung erfolgreich gelöscht!'),
    onSettled: () => void invalidateTutorial(),
  });

  const addStepMutation = useMutation({
    mutationFn: (data: AddStepInput) =>
      invokeAction(addFairteilerTutorialStepAction, data),
    onSuccess: (result) => {
      if (!result) return;
      toast.success('Schritt erfolgreich hinzugefügt!');
      dispatch({ type: 'SET_CURRENT_STEP', payload: result.sortIndex - 1 });
    },
    onError: (err) => showErrorToast(err, 'Hinzufügen fehlgeschlagen.'),
    onSettled: () => void invalidateTutorial(),
  });

  const updateStepMutation = useMutation({
    mutationFn: (data: UpdateStepInput) =>
      invokeAction(updateFairteilerTutorialStepAction, data),
    onSuccess: (result) => {
      if (!result) return;
      toast.success('Schritt erfolgreich aktualisiert!');
      dispatch({ type: 'SET_CURRENT_STEP', payload: result.sortIndex - 1 });
    },
    onError: (err) => showErrorToast(err, 'Aktualisierung fehlgeschlagen.'),
    onSettled: () => void invalidateTutorial(),
  });

  const removeStepMutation = useMutation({
    mutationFn: (data: { id: string }) =>
      invokeAction(removeFairteilerTutorialStepAction, data),
    onSuccess: () => toast.success('Schritt erfolgreich gelöscht!'),
    onError: (err) => showErrorToast(err, 'Löschung fehlgeschlagen.'),
    onSettled: () => void invalidateTutorial(),
  });

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
    addTutorial: (data) => addTutorialMutation.mutateAsync(data),
    updateTutorial: (data) => updateTutorialMutation.mutateAsync(data),
    removeTutorial: (data) => removeTutorialMutation.mutateAsync(data),
    toggleTutorialActive: (tutorial) =>
      updateTutorialMutation.mutateAsync({
        ...tutorial,
        isActive: !tutorial.isActive,
      }),
    addStep: (data) => addStepMutation.mutateAsync(data),
    updateStep: (data) => updateStepMutation.mutateAsync(data),
    removeStep: (data) => removeStepMutation.mutateAsync(data),
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
