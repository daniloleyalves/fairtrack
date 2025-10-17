'use client';

import { useState, useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function NavigationLoadingIndicatorInner() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Reset loading state when navigation completes
    setIsLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Listen for Next.js navigation start
    const handleStart = () => {
      setIsLoading(true);
    };

    // Intercept link clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (link?.href && !link.target && !e.ctrlKey && !e.metaKey) {
        const url = new URL(link.href);
        const currentUrl = new URL(window.location.href);

        // Only show loader if navigating to a different route
        if (
          url.pathname !== currentUrl.pathname ||
          url.search !== currentUrl.search
        ) {
          handleStart();
        }
      }
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className='fixed top-0 right-0 left-0 z-50 h-1 bg-transparent'>
      <div className='h-full animate-[slideIn_400ms_ease-out] bg-tertiary' />
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

export default function NavigationLoadingIndicator() {
  return (
    <Suspense fallback={null}>
      <NavigationLoadingIndicatorInner />
    </Suspense>
  );
}
