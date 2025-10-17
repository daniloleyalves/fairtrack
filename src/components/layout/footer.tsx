import { Illustrations } from '@/lib/assets/illustrations';
import { Copyright } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@components/ui/button';
import { CookieConsentComponent } from '../cookie-consent';

export function Footer() {
  return (
    <div className='relative lg:mt-72'>
      <div className='absolute bottom-7 hidden w-full items-end justify-between xl:flex'>
        <Image
          src={Illustrations.footerPlantsLeft}
          alt='Footer plants'
          loading='eager'
          decoding='sync'
          height={155}
          width={205}
          priority
        />
        <Image
          src={Illustrations.footerPlantsRight}
          alt='Footer plants'
          loading='eager'
          decoding='sync'
          height={283}
          width={210}
          priority
        />
      </div>
      <footer className='rounded-t-lg bg-foreground py-3 shadow'>
        <div className='mx-auto flex w-full items-center justify-between px-4 text-sm font-medium text-white sm:container sm:px-4'>
          <h1 className='mr-6 flex items-center gap-2 sm:gap-0'>
            <Copyright className='h-3' />
            <span>FairTrack</span>
          </h1>

          <div className='flex items-center justify-center gap-2'>
            <Button asChild variant='link' className='h-4 p-1 text-white'>
              <Link href='/impressum'>
                <h6>Impressum</h6>
              </Link>
            </Button>
            <span>|</span>
            <Button asChild variant='link' className='h-4 p-1 text-white'>
              <Link href='/datenschutz'>
                <h6>Datenschutz</h6>
              </Link>
            </Button>
            <span>|</span>
            <CookieConsentComponent />
          </div>
        </div>
      </footer>
    </div>
  );
}
