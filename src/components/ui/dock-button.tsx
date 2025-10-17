'use client';

import { useState, useEffect } from 'react';
import { DockIcon } from './dock';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { usePathname } from 'next/navigation';

export function DockButton({ href, icon }: { href: string; icon: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  // Get the icon component from lucide-react
  const IconComponent = LucideIcons[
    icon as keyof typeof LucideIcons
  ] as React.ComponentType<{ className?: string }>;
  const Loader2 = LucideIcons.Loader2;

  // Reset loading state when pathname changes
  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  return (
    <DockIcon>
      <Link href={href} onClick={() => setIsLoading(true)}>
        {isLoading ? (
          <Loader2 className='size-6 animate-spin' />
        ) : (
          <IconComponent className='size-6' />
        )}
      </Link>
    </DockIcon>
  );
}
