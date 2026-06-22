'use client';

import { createContext, useContext, useRef, type ReactNode } from 'react';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formTableViewEnum } from '@/server/db/schema';
import { updateUserPreferencesAction } from '@/server/user/actions';
import { userKeys } from '@/server/user/query-keys';
import { invokeAction } from '@/lib/hooks/use-form-action';
import { toast } from 'sonner';

export const preferencesSchema = z.object({
  formTableView: z.enum(formTableViewEnum.enumValues).default('wizard'),
  enableStreaks: z.boolean().default(false),
  enableQuests: z.boolean().default(false),
  enableAIFeedback: z.boolean().default(false),
});

export type ClientPreferences = z.infer<typeof preferencesSchema>;

const DEFAULT_PREFERENCES: ClientPreferences = {
  formTableView: 'wizard',
  enableStreaks: true,
  enableQuests: true,
  enableAIFeedback: true,
};

interface UserPreferencesContextType {
  preferences: ClientPreferences;
  isLoading: boolean;
  error: Error | null;
  updatePreference: <K extends keyof ClientPreferences>(
    key: K,
    value: ClientPreferences[K],
  ) => Promise<void>;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | null>(
  null,
);

interface UserPreferencesProviderProps {
  children: ReactNode;
  initialData?: Partial<ClientPreferences> | null;
}

export function UserPreferencesProvider({
  children,
  initialData,
}: UserPreferencesProviderProps) {
  const queryClient = useQueryClient();
  const preferencesKey = userKeys.preferences().queryKey;

  const {
    data: rawPreferences,
    isLoading,
    error,
  } = useQuery({
    ...userKeys.preferences(),
    initialData: initialData ?? undefined,
  });

  const lastUpdatedKeyRef = useRef<keyof ClientPreferences | null>(null);

  const updateMutation = useMutation({
    mutationFn: (next: ClientPreferences) =>
      invokeAction(updateUserPreferencesAction, next),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: preferencesKey });
      const previous = queryClient.getQueryData(preferencesKey);
      queryClient.setQueryData(preferencesKey, next);
      return { previous };
    },
    onError: (err, _next, context) => {
      queryClient.setQueryData(preferencesKey, context?.previous);
      lastUpdatedKeyRef.current = null;
      toast.error(
        err instanceof Error ? err.message : 'Aktualisierung fehlgeschlagen.',
      );
    },
    onSuccess: () => {
      const suppressToast = lastUpdatedKeyRef.current === 'formTableView';
      lastUpdatedKeyRef.current = null;
      if (suppressToast) return;
      toast.success('Platformerlebnis erfolgreich aktualisiert!');
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: preferencesKey });
    },
  });

  const preferences = (() => {
    try {
      return preferencesSchema.parse(rawPreferences ?? DEFAULT_PREFERENCES);
    } catch (validationError) {
      console.warn(
        'Failed to parse preferences, using defaults:',
        validationError,
      );
      return DEFAULT_PREFERENCES;
    }
  })();

  const updatePreference = async <K extends keyof ClientPreferences>(
    key: K,
    value: ClientPreferences[K],
  ): Promise<void> => {
    const updated = preferencesSchema.parse({ ...preferences, [key]: value });
    lastUpdatedKeyRef.current = key;
    await updateMutation.mutateAsync(updated);
  };

  const value: UserPreferencesContextType = {
    preferences,
    isLoading,
    error,
    updatePreference,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences(): UserPreferencesContextType {
  const context = useContext(UserPreferencesContext);
  if (context === null) {
    throw new Error(
      'useUserPreferences must be used within a UserPreferencesProvider',
    );
  }
  return context;
}
