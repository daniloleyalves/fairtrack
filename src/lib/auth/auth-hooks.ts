'use client';

import { authClient } from './auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSentryUser } from '@/lib/monitoring/use-sentry-user';

export function useSession() {
  const { data: session, isPending, error, refetch } = authClient.useSession();

  useSentryUser(session?.user?.id ?? null, isPending);

  return {
    session: session?.session ?? null,
    user: session?.user ?? null,
    isLoading: isPending,
    error,
    refetch,
    isAuthenticated: !!session?.user,
  };
}

export function useUser() {
  const { user, isLoading } = useSession();
  return { user, isLoading };
}

export function useActiveOrganization() {
  const { session, isLoading } = useSession();
  return {
    organizationId: session?.activeOrganizationId ?? null,
    isLoading,
  };
}

export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/sign-in');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}

export function useAuthRedirect() {
  const { isAuthenticated, isLoading } = useSession();
  const router = useRouter();

  const redirectIfAuthenticated = (to = '/hub/fairteiler/dashboard') => {
    if (!isLoading && isAuthenticated) {
      router.push(to);
    }
  };

  return { redirectIfAuthenticated, isAuthenticated, isLoading };
}
