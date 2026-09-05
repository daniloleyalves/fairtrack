'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export function useSentryUser(userId: string | null, isLoading: boolean) {
  useEffect(() => {
    if (isLoading) return;
    Sentry.setUser(userId ? { id: userId } : null);
  }, [userId, isLoading]);
}
