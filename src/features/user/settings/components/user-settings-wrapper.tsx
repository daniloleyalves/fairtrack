'use client';

import { User } from '@/server/db/db-types';
import { UserPreferencesProvider } from '@/lib/services/preferences-service';
import UserPreferencesCard from './user-preferences';
import UserAccountCard from './user-account';
import { updateUserAction } from '@/lib/auth/auth-actions';
import { invokeAction } from '@/lib/hooks/use-form-action';
import { userKeys } from '@/server/user/query-keys';
import { getUserProfile } from '@/server/user/queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function UserSettingsWrapper({ user }: { user: User }) {
  const queryClient = useQueryClient();
  const profileKey = userKeys.profile().queryKey;

  const { data: userData = user, error } = useQuery({
    ...userKeys.profile(),
    queryFn: getUserProfile,
    initialData: user,
  });

  const updateUserMutation = useMutation({
    mutationFn: (input: Parameters<typeof updateUserAction>[0]) =>
      invokeAction(updateUserAction, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: profileKey });
      const previous = queryClient.getQueryData<User>(profileKey);
      queryClient.setQueryData<User>(profileKey, (current) => {
        const base = current ?? previous ?? user;
        return {
          ...base,
          name: input.name,
          firstName: input.firstName,
          lastName: input.lastName,
          isAnonymous: input.isAnonymous,
          avatar: typeof input.avatar === 'string' ? input.avatar : base.avatar,
        };
      });
      return { previous };
    },
    onError: (err, _input, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(profileKey, context.previous);
      }
      toast.error(
        err instanceof Error ? err.message : 'Aktualisierung fehlgeschlagen.',
      );
    },
    onSuccess: (data) => {
      if (data) queryClient.setQueryData(profileKey, data);
      toast.success('Profil erfolgreich aktualisiert!');
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all().queryKey });
    },
  });

  if (error) {
    throw error;
  }

  return (
    <UserPreferencesProvider>
      <div className='flex flex-col gap-4'>
        <UserPreferencesCard />
        <UserAccountCard
          user={userData}
          onUpdateUser={(updatedUser) => {
            updateUserMutation.mutate({
              name: updatedUser.name,
              firstName: updatedUser.firstName,
              lastName: updatedUser.lastName,
              isAnonymous: updatedUser.isAnonymous,
              avatar: updatedUser.avatar ?? null,
            });
          }}
        />
      </div>
    </UserPreferencesProvider>
  );
}
