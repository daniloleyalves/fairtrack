'use client';

import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { DownloadButton } from './chart-download-button';

export function GeographicMapPlaceholder() {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <Card ref={cardRef}>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span>Geografische Verteilung</span>
          <DownloadButton elementRef={cardRef} filename='geographic-map' />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex h-[400px] w-full items-center justify-center text-muted-foreground'>
          <div className='flex flex-col items-center gap-4'>
            <MapPin className='size-16' />
            <div className='text-center'>
              <p className='text-lg font-medium'>Karte</p>
              <p className='text-sm'>
                Hier wird in Zukunft eine interaktive Karte mit <br />
                Fairteiler-Standorten angezeigt
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
