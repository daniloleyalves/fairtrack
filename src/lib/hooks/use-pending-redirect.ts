'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';

/**
 * Redirect after a successful form submission without the form visibly
 * resetting first. `redirect(to)` runs `router.push` inside a transition;
 * `onNavigated` fires only once the navigation has committed — or, for a
 * segment Next.js keeps alive in its Activity cache, on re-entry when its
 * effects re-run. Put the form/state reset in `onNavigated` and keep the
 * pending UI up while `isRedirectPending` is true.
 */
export function usePendingRedirect(onNavigated: () => void) {
  const router = useRouter();
  const [isNavigating, startTransition] = useTransition();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const onNavigatedRef = useRef(onNavigated);
  useEffect(() => {
    onNavigatedRef.current = onNavigated;
  });

  const redirect = useCallback(
    (to: string) => {
      setIsRedirecting(true);
      startTransition(() => {
        router.push(to);
      });
    },
    [router],
  );

  useEffect(() => {
    if (isRedirecting && !isNavigating) {
      onNavigatedRef.current();
      setIsRedirecting(false);
    }
  }, [isRedirecting, isNavigating]);

  return { isRedirectPending: isRedirecting || isNavigating, redirect };
}
