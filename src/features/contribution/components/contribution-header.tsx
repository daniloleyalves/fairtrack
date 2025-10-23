'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin } from 'lucide-react';
import { LocationIndicator } from './location-indicator';
import Link from 'next/link';
import { useContribution } from '../context/contribution-context';

export function ContributionHeader() {
  const { fairteiler } = useContribution();

  return (
    <div className='flex items-center gap-3 rounded-b-lg border-b bg-card p-4 sm:gap-4'>
      <Button
        className='flex items-center gap-1 sm:gap-2'
        variant='ghost'
        size='sm'
        asChild
      >
        <Link href='/hub/user/fairteiler-finder'>
          <ArrowLeft className='size-4' />
          <span className='hidden sm:inline'>Zurück</span>
        </Link>
      </Button>
      <div className='flex-1'>
        <h1 className='font-londrina text-lg font-bold sm:text-xl'>
          Lebensmittel abgeben
        </h1>
        <div className='flex items-center gap-1 text-xs text-muted-foreground sm:text-sm'>
          <MapPin className='size-3' />
          {fairteiler.name}
          {fairteiler.address && ` • ${fairteiler.address}`}
        </div>
      </div>
      <LocationIndicator />
    </div>
  );
}
