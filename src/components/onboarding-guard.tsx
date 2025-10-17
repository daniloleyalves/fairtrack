'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth/auth-hooks';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { user, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.isFirstLogin) {
      router.push('/onboarding');
    }
  }, [user, isLoading, router]);

  // Don't render children if user needs onboarding
  if (isLoading || user?.isFirstLogin) {
    return null;
  }

  return <>{children}</>;
}
