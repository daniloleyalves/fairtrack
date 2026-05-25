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
import { invokeAction } from '@/lib/hooks/use-form-action';
import { userProfileSchema } from '../schemas/user-profile-schema';
import type { z } from 'zod';
import { toast } from 'sonner';

type UserProfileValues = z.infer<typeof userProfileSchema>;

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

  const { trigger: updateUserTrigger } = useSWRMutation(
    USER_PROFILE_KEY,
    (_key, { arg }: { arg: UserProfileValues }) =>
      invokeAction(updateUserAction, arg),
    {
      revalidate: false,
      rollbackOnError: true,
      onSuccess: () => {
        toast.success('Profil erfolgreich aktualisiert!');
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
            updateUserTrigger(
              {
                name: updatedUser.name,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                isAnonymous: updatedUser.isAnonymous,
                avatar: updatedUser.avatar ?? null,
              },
              {
                optimisticData: (currentUserCache: User | undefined): User => {
                  const baseUser: User = currentUserCache ?? user;
                  return {
                    ...baseUser,
                    isAnonymous,
                  };
                },
              },
            )
          }
        />
      </div>
    </UserPreferencesProvider>
  );
}
