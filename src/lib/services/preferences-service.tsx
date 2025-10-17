'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { z } from 'zod';
import { formTableViewEnum } from '@/server/db/schema';
import useSWRSuspense, { type FetcherError } from './swr';
import { updateUserPreferencesAction } from '@/server/actions';
import useSWRMutation from 'swr/mutation';
import { toast } from 'sonner';

// --- Constants and Schema Definition ---
const PREFERENCES_API_KEY = '/api/user/preferences';

// Client-side preferences schema (without id and userId)
export const preferencesSchema = z.object({
  formTableView: z.enum(formTableViewEnum.enumValues).default('wizard'),
  enableStreaks: z.boolean().default(false),
  enableQuests: z.boolean().default(false),
  enableAIFeedback: z.boolean().default(false),
});

// Type for client-side preferences
export type ClientPreferences = z.infer<typeof preferencesSchema>;

// Create a default preferences object
const DEFAULT_PREFERENCES: ClientPreferences = {
  formTableView: 'wizard',
  enableStreaks: true,
  enableQuests: true,
  enableAIFeedback: true,
};

// --- Type Definitions ---
interface UserPreferencesContextType {
  preferences: ClientPreferences;
  isLoading: boolean;
  error: FetcherError<string> | undefined;
  updatePreference: <K extends keyof ClientPreferences>(
    key: K,
    value: ClientPreferences[K],
  ) => Promise<void>;
}

// --- Context Definition ---
const UserPreferencesContext = createContext<UserPreferencesContextType | null>(
  null,
);

// --- Provider Component ---
interface UserPreferencesProviderProps {
  children: ReactNode;
  initialData?: Partial<ClientPreferences> | null;
}

export function UserPreferencesProvider({
  children,
  initialData,
}: UserPreferencesProviderProps) {
  // Use SWR to manage preferences with automatic syncing
  const { data, error, isLoading } = useSWRSuspense(PREFERENCES_API_KEY, {
    fallbackData: initialData,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000, // Prevent duplicate requests within 5 seconds
    onError: (error) => {
      console.warn('Failed to fetch preferences:', error);
    },
    onSuccess: (data) => {
      // Validate the data structure
      try {
        preferencesSchema.parse(data);
      } catch (validationError) {
        console.warn('Invalid preferences data from server:', validationError);
      }
    },
  });

  const { trigger: mutatePreferencesTrigger } = useSWRMutation(
    PREFERENCES_API_KEY,
    (_key, { arg }: { arg: ClientPreferences }) =>
      updateUserPreferencesAction(arg),
    {
      rollbackOnError: true,
      revalidate: false,
      onSuccess: (result) => {
        if (result.success && result.message) {
          toast.success(
            result.message ?? 'Platformerlebnis erfolgreich aktualisiert!',
          );
        }
      },
      onError: (err) => {
        const message =
          err instanceof Error ? err.message : 'Aktualisierung fehlgeschlagen.';
        toast.error(message);
      },
    },
  );

  // Update a specific preference
  const updatePreference = async <K extends keyof ClientPreferences>(
    key: K,
    value: ClientPreferences[K],
  ): Promise<void> => {
    let validatedPreferences = null;
    try {
      const updatedPreferences = { ...preferences, [key]: value };
      validatedPreferences = preferencesSchema.parse(updatedPreferences);
    } catch (error) {
      console.error('Failed to validate preference data:', error);
      throw error;
    }

    try {
      // Optimistically update local cache
      await mutatePreferencesTrigger(validatedPreferences, {
        optimisticData: validatedPreferences,
      });
    } catch (error) {
      console.error('Failed to update preference on server:', error);
      throw error;
    }
  };

  // Parse preferences with validation, fallback to defaults on error
  const preferences = (() => {
    try {
      return preferencesSchema.parse(data ?? DEFAULT_PREFERENCES);
    } catch (error) {
      console.warn('Failed to parse preferences, using defaults:', error);
      return DEFAULT_PREFERENCES;
    }
  })();

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

// --- Custom Hook for Consumption ---
export function useUserPreferences(): UserPreferencesContextType {
  const context = useContext(UserPreferencesContext);
  if (context === null) {
    throw new Error(
      'useUserPreferences must be used within a UserPreferencesProvider',
    );
  }
  return context;
}
