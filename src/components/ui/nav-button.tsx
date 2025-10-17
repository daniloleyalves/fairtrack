'use client';

import Link from 'next/link';
import { Button, buttonVariants } from './button';
import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import { VariantProps } from 'class-variance-authority';

export function NavButton({
  href,
  title,
  icon,
  variant,
  size,
}: {
  href: string;
  title?: string;
  icon: string;
  variant?: VariantProps<typeof buttonVariants>['variant'];
  size?: VariantProps<typeof buttonVariants>['size'];
}) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get the icon component from lucide-react
  const IconComponent = LucideIcons[
    icon as keyof typeof LucideIcons
  ] as React.ComponentType<{ className?: string }>;
  const Loader2 = LucideIcons.Loader2;

  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

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
      <Button variant={variant} asChild size={size}>
        <Link href={href} onClick={handleClick}>
          {isLoading ? (
            <>
              <Loader2 className='size-4 animate-spin' />
              {title}
            </>
          ) : (
            <>
              <IconComponent className='size-4' />
              {title}
            </>
          )}
        </Link>
      </Button>
    </>
  );
}
