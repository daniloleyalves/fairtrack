'use client';

import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { Button } from '../ui/button';
import { Logo } from '@/lib/assets/logo';
import Link from 'next/link';
import { useState } from 'react';
import { siteRoutes } from '@/lib/config/routes';

function MobileNavLink({
  href,
  children,
  onClose,
}: {
  href: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <Button asChild variant='secondary'>
      <Link href={href} onClick={onClose}>
        {children}
      </Link>
    </Button>
  );
}

export function MobileNav() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const closeSheet = () => {
    setIsSheetOpen(false);
  };

  return (
    <Sheet open={isSheetOpen}>
      <SheetTrigger asChild>
        <Button
          size='icon'
          variant='secondary'
          className='size-8'
          onClick={() => setIsSheetOpen(true)}
        >
          <Menu className='size-4' />
          <span className='sr-only'>Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side='left'
        closeIcon={false}
        onInteractOutside={closeSheet}
      >
        <SheetHeader>
          <SheetTitle>
            <Link href='/' onClick={closeSheet}>
              <Logo className='w-40' />
            </Link>
          </SheetTitle>
        </SheetHeader>
        <div className='space-y-8 px-4'>
          <div className='overflow-auto'>
            <div className='flex flex-col space-y-3'>
              <MobileNavLink
                href='/hub/user/fairteiler-finder'
                onClose={closeSheet}
              >
                Fairteiler finden
              </MobileNavLink>
              {siteRoutes.map((route) => (
                <MobileNavLink
                  key={route.title}
                  href={route.url}
                  onClose={closeSheet}
                >
                  {route.title}
                </MobileNavLink>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
