'use client';

import {
  USER_PREFERENCES_KEY,
  USER_PROFILE_KEY,
} from '@/lib/config/api-routes';
import useSWRSuspense, { fetcher } from '@/lib/services/swr';
import { User, UserPreferences } from '@/server/db/db-types';
import { UserPreferencesProvider } from '@/lib/services/preferences-service';
import UserPreferencesCard from './user-preferences';
import UserAccountCard from './user-account';
import useSWRMutation from 'swr/mutation';
import { updateUserAction } from '@/lib/auth/auth-actions';
import { toast } from 'sonner';

export default function UserSettingsWrapper({ user }: { user: User }) {
  const { data: userPreferences } = useSWRSuspense<UserPreferences>(
    USER_PREFERENCES_KEY,
    {
      fetcher,
      revalidateIfStale: true,
      revalidateOnMount: true,
    },
  );

  const { data: userData } = useSWRSuspense<User>(USER_PROFILE_KEY, {
    fetcher,
    fallback: user,
    revalidateIfStale: true,
    revalidateOnMount: true,
  });

  // --- Mutations ---
  const { trigger: updateUserTrigger } = useSWRMutation(
    USER_PROFILE_KEY,
    (_key, { arg }: { arg: FormData }) => updateUserAction(arg),
    {
      revalidate: false,
      rollbackOnError: true,
      onSuccess: (result) => {
        if (result.success && result.data) {
          toast.success(result.message ?? 'Profil erfolgreich aktualisiert!');
        }
        if (!result.success && result.error) {
          toast.success(result.error);
        }
      },
      onError: (err) => {
        const message =
          err instanceof Error ? err.message : 'Aktualisierung fehlgeschlagen.';
        toast.error(message);
      },
    },
  );

  return (
    <UserPreferencesProvider initialData={userPreferences}>
      <div className='flex flex-col gap-4'>
        <UserPreferencesCard />
        <UserAccountCard
          user={userData}
          onUpdateUser={(updatedUser, isAnonymous) =>
            updateUserTrigger(updatedUser, {
              optimisticData: (currentUserCache: User | undefined): User => {
                const baseUser: User = currentUserCache ?? user;
                return {
                  ...baseUser,
                  isAnonymous,
                };
              },
            })
          }
        />
      </div>
    </UserPreferencesProvider>
  );
}
