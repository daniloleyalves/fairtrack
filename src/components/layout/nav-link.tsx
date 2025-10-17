'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@components/ui/button';
import { useState, useEffect } from 'react';
import { LoadingBar } from '@components/ui/loading-bar';

export function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [pathName, searchParams]);

  const handleClick = () => {
    // Only show loading if navigating to a different route
    const targetUrl = new URL(href, window.location.origin);
    const currentUrl = new URL(window.location.href);

    if (
      targetUrl.pathname !== currentUrl.pathname ||
      targetUrl.search !== currentUrl.search
    ) {
      setIsLoading(true);
    }
  };

  return (
    <>
      <LoadingBar isLoading={isLoading} />
      <Button asChild variant='ghost' size='sm'>
        <Link
          href={href}
          className={cn('text-sm font-semibold text-foreground/80', {
            'text-primary': pathName === href,
          })}
          onClick={handleClick}
        >
          {children}
        </Link>
      </Button>
    </>
  );
}
