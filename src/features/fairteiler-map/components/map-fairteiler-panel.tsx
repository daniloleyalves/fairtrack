'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import type { Coordinates } from '@/lib/geo';
import { calculateDistance } from '@/lib/geo';
import { Fairteiler } from '@/server/db/db-types';

interface FairteilerPanelProps {
  fairteilers: Fairteiler[];
  userLocation: Coordinates | null;
  onFairteilerClick: (fairteiler: Fairteiler) => void;
}

interface FairteilerWithDistance extends Fairteiler {
  distance: number;
}

export function FairteilerPanel({
  fairteilers,
  userLocation,
  onFairteilerClick,
}: FairteilerPanelProps) {
  const [showAll, setShowAll] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filter fairteilers with valid coordinates and calculate distances
  const fairteilerWithDistances: FairteilerWithDistance[] = fairteilers
    .filter((f) => f.geoLat && f.geoLng)
    .map((fairteiler) => {
      const distance = userLocation
        ? calculateDistance(userLocation, {
            latitude: parseFloat(fairteiler.geoLat),
            longitude: parseFloat(fairteiler.geoLng),
          })
        : Infinity;
      return { ...fairteiler, distance };
    })
    .sort((a, b) => a.distance - b.distance);

  const displayedFairteilers = showAll
    ? fairteilerWithDistances
    : fairteilerWithDistances.slice(0, 3);

  const formatDistance = (distance: number) => {
    if (distance === Infinity) return '';
    if (distance < 1000) return `${Math.round(distance)}m`;
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const handleFairteilerClick = (fairteiler: Fairteiler) => {
    onFairteilerClick(fairteiler);
    setIsDrawerOpen(false); // Close drawer on mobile after selection
  };

  const FairteilerList = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`space-y-3 ${isMobile ? 'px-4' : 'pt-2'}`}>
      {displayedFairteilers.length === 0 ? (
        <p className='text-sm text-muted-foreground'>
          Keine Fairteiler gefunden
        </p>
      ) : (
        <>
          {displayedFairteilers.map((fairteiler) => (
            <button
              type='button'
              key={fairteiler.id}
              className='w-full cursor-pointer rounded-lg border bg-muted p-3 text-start transition-colors hover:bg-muted/50'
              onClick={() => handleFairteilerClick(fairteiler)}
            >
              <div className='flex items-start justify-between gap-2'>
                <div className='min-w-0 flex-1'>
                  <h3 className='truncate font-semibold'>{fairteiler.name}</h3>
                  {fairteiler.tags.length > 0 && (
                    <div className='mt-1 flex flex-wrap gap-1'>
                      {fairteiler.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag.id}
                          variant='secondary'
                          className='px-1.5 py-0.5 text-xs'
                        >
                          {tag.name}
                        </Badge>
                      ))}
                      {fairteiler.tags.length > 2 && (
                        <Badge
                          variant='secondary'
                          className='px-1.5 py-0.5 text-xs'
                        >
                          +{fairteiler.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <div className='font-mono text-xs text-muted-foreground'>
                  {formatDistance(fairteiler.distance)}
                </div>
              </div>
            </button>
          ))}

          {fairteilerWithDistances.length > 3 && (
            <Button
              variant='ghost'
              size='sm'
              className='h-8 w-full text-xs'
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? (
                <>
                  <ChevronUp className='mr-1 size-3' />
                  Weniger anzeigen
                </>
              ) : (
                <>
                  <ChevronDown className='mr-1 size-3' />
                  {fairteilerWithDistances.length - 3} weitere anzeigen
                </>
              )}
            </Button>
          )}
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Version - Top Left Panel */}
      <Card className='absolute top-4 left-4 z-10 hidden w-80 bg-white py-2 pt-4 md:block'>
        <CardHeader className='px-2'>
          <CardTitle className='flex items-center gap-2 font-londrina text-2xl tracking-wide'>
            <MapPin className='size-8 fill-primary stroke-white' />
            Fairteiler
          </CardTitle>
        </CardHeader>
        <CardContent className='px-2'>
          <FairteilerList />
        </CardContent>
      </Card>

      {/* Mobile Version - Drawer */}
      <Drawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        direction='top'
      >
        <DrawerTrigger
          asChild
          className='absolute top-5 left-1/2 z-10 -translate-x-1/2 md:bottom-22 md:hidden'
        >
          <Button
            className='flex items-center gap-2 ring-2 ring-primary ring-offset-2'
            size='sm'
          >
            <MapPin className='size-4' />
            Fairteiler ({fairteilerWithDistances.length})
          </Button>
        </DrawerTrigger>
        <DrawerContent className='bg-white'>
          <DrawerHeader className='pb-0'>
            <DrawerTitle className='flex items-center gap-2 font-londrina text-2xl tracking-wide'>
              <MapPin className='size-8 fill-primary stroke-white' />
              Fairteiler in der Nähe
            </DrawerTitle>
          </DrawerHeader>

          <div className='flex-1 overflow-y-auto py-4'>
            <FairteilerList isMobile />
          </div>

          <DrawerFooter className='pt-2 pb-8'>
            <DrawerClose asChild>
              <Button variant='outline' className='w-full'>
                Schließen
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
