'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Fairteiler } from '@/server/db/db-types';
import { ArrowRight, Globe, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Popup } from 'react-map-gl/mapbox';

export function MapFairteilerPopup({
  activeFairteiler,
  isUserNearFairteiler,
}: {
  activeFairteiler: Omit<Fairteiler, 'geoLng' | 'geoLat'> & {
    geoLng: number;
    geoLat: number;
  };
  isUserNearFairteiler: boolean | null | undefined;
}) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  return (
    <Popup
      closeButton={false}
      longitude={activeFairteiler.geoLng}
      latitude={activeFairteiler.geoLat}
      anchor='bottom'
      maxWidth='600px'
    >
      <div className='flex flex-col items-center gap-4 md:flex-row'>
        {activeFairteiler.thumbnail && (
          <img
            src={activeFairteiler.thumbnail}
            alt='Raupe Immersatt'
            className='h-[180px] w-full rounded-xl bg-secondary object-cover md:w-[250px]'
          />
        )}
        <div className='flex flex-col justify-between gap-4 md:h-[180px]'>
          <div className='flex flex-col items-center space-y-2 md:items-start'>
            <h2 className='mb-2 truncate text-2xl font-semibold'>
              {activeFairteiler.name}
            </h2>

            {activeFairteiler.tags?.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {activeFairteiler.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant='secondary'
                    className='font-medium'
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
            {activeFairteiler.website && (
              <div className='flex w-full items-center justify-center md:justify-start'>
                <Globe className='mr-2 size-3.5 stroke-muted-foreground' />
                <Button
                  asChild
                  className='h-6 rounded-none p-0 font-normal text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0'
                  variant='link'
                >
                  <Link
                    href={activeFairteiler.website ?? '#'}
                    target='_blank'
                    className='truncate'
                  >
                    {activeFairteiler.website}
                  </Link>
                </Button>
              </div>
            )}
          </div>

          <div className='space-y-2'>
            {isUserNearFairteiler ? (
              <Button
                className='w-full'
                size='lg'
                asChild
                onClick={() => setIsRedirecting(true)}
              >
                <Link
                  href={`/hub/user/contribution?fairteilerSlug=${activeFairteiler.slug}`}
                >
                  {isRedirecting ? (
                    <Loader2 className='animate-spin' />
                  ) : (
                    <ArrowRight />
                  )}
                  Hier Lebensmittel abgeben
                </Link>
              </Button>
            ) : (
              <Button
                className='w-full bg-blue-500 text-white hover:bg-blue-400! hover:text-white'
                size='lg'
                variant='ghost'
                asChild
              >
                <Link
                  href={`https://www.google.com/maps/dir/?api=1&destination=${activeFairteiler.geoLat},${activeFairteiler.geoLng}`}
                  target='_blank'
                >
                  <ArrowRight />
                  Zu diesem Fairteiler navigieren
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Popup>
  );
}
