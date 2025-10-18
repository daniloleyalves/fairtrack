'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@components/ui/button';

export function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathName = usePathname();

  return (
    <Button asChild variant='ghost' size='sm'>
      <Link
        href={href}
        className={cn('text-sm font-semibold text-foreground/80', {
          'text-primary': pathName === href,
        })}
      >
        {children}
      </Link>
    </Button>
  );
}
