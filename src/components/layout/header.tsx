import { Logo } from '@/lib/assets/logo';
import { siteRoutes } from '@/lib/config/routes';
import Link from 'next/link';
import { HeaderAuth } from './header-auth';
import { NavLink } from './nav-link';
import { MobileNav } from './mobile-nav';

export function Header() {
  return (
    <header className='sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60'>
      <div className='mx-auto flex h-12 items-center px-4 sm:container sm:px-4'>
        <div className='mr-2 md:hidden'>
          <MobileNav />
        </div>
        <nav className='flex w-full items-center justify-between'>
          <Link
            href='/'
            className='flex items-center space-x-4'
            aria-label='FairTrack Homepage'
          >
            <div className='flex w-36 items-center justify-center'>
              <Logo />
            </div>
          </Link>
          <div className='hidden translate-x-[20px] gap-4 sm:flex'>
            {siteRoutes.map((navLink) => (
              <NavLink href={navLink.url} key={navLink.title}>
                {navLink.title}
              </NavLink>
            ))}
          </div>
          <div className='flex items-center gap-2 sm:gap-4'>
            <HeaderAuth />
          </div>
        </nav>
      </div>
    </header>
  );
}
