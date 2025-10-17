'use client';

import { useCallback, useRef, useState } from 'react';
import Map, {
  Marker,
  NavigationControl,
  MapRef,
  MarkerEvent,
} from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { DownloadButton } from './chart-download-button';
import { useClientEnv } from '@/lib/hooks/use-client-env';
import { Fairteiler } from '@/server/db/db-types';
import { MapFairteilerPopup } from '@/features/fairteiler-map/components/map-fairteiler-popup';
import { FairteilerPanel } from '@/features/fairteiler-map/components/map-fairteiler-panel';

export function PlatformFairteilerMap({
  fairteilers,
}: {
  fairteilers: Fairteiler[];
}) {
  const { env, isLoading: envLoading } = useClientEnv();

  const cardRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapRef>(null);

  // Convert fairteilers to markers format and filter those with valid coordinates
  const markers = fairteilers
    .filter((f) => f.geoLat && f.geoLng)
    .map((fairteiler) => ({
      ...fairteiler,
      geoLng: parseFloat(fairteiler.geoLng),
      geoLat: parseFloat(fairteiler.geoLat),
    }))
    .filter((m) => !isNaN(m.geoLng) && !isNaN(m.geoLat)); // Extra safety check

  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeFairteiler, setActiveFairteiler] = useState<
    (typeof markers)[0] | null
  >(null);

  // Germany-centered view
  const [viewState, setViewState] = useState({
    longitude: 10.4515,
    latitude: 51.1657,
    zoom: 5,
    pitch: 0,
    bearing: 0,
  });

  // Handle fairteiler selection from panel with smooth animation
  const handleFairteilerClick = useCallback(
    (fairteiler: Fairteiler) => {
      if (!fairteiler.geoLat || !fairteiler.geoLng) return;

      try {
        const marker = {
          ...fairteiler,
          geoLng: parseFloat(fairteiler.geoLng),
          geoLat: parseFloat(fairteiler.geoLat),
        };

        if (isNaN(marker.geoLng) || isNaN(marker.geoLat)) {
          console.error('Invalid coordinates for fairteiler:', fairteiler);
          return;
        }

        setActiveFairteiler(marker);

        // Check if map is ready before flying
        if (mapRef.current && mapLoaded) {
          mapRef.current.flyTo({
            center: [marker.geoLng, marker.geoLat],
            duration: 1500,
            zoom: 13,
            essential: true,
            offset: [0, 180],
          });
        }
      } catch (error) {
        console.error('Error handling fairteiler click:', error);
      }
    },
    [mapLoaded],
  );

  // Handle map click to clear active fairteiler
  const handleMapClick = useCallback(() => {
    setActiveFairteiler(null);
  }, []);

  // Smooth animation for marker clicks
  const handleMarkerClick = useCallback(
    (marker: (typeof markers)[0] | null, event: MarkerEvent<MouseEvent>) => {
      event.originalEvent.stopPropagation();

      if (!mapLoaded || !marker) return;

      setActiveFairteiler(marker);

      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [marker.geoLng, marker.geoLat],
          zoom: 18,
          duration: 1500,
          essential: true,
          offset: [0, 150],
        });
      }
    },
    [mapLoaded],
  );

  if (envLoading) {
    return (
      <Card ref={cardRef}>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>Fairteiler Karte</span>
            <DownloadButton elementRef={cardRef} filename='fairteiler-map' />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className='h-[400px] w-full rounded-lg' />
        </CardContent>
      </Card>
    );
  }

  if (!env?.MAPBOX_TOKEN) {
    return (
      <Card ref={cardRef}>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>Fairteiler Karte</span>
            <DownloadButton elementRef={cardRef} filename='fairteiler-map' />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant='destructive'>
            <AlertCircle className='size-4' />
            <AlertDescription>
              Mapbox-Token fehlt. Bitte konfigurieren Sie die Umgebungsvariable.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (fairteilers.length === 0) {
    return (
      <Card ref={cardRef}>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>Fairteiler Karte</span>
            <DownloadButton elementRef={cardRef} filename='fairteiler-map' />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className='size-4' />
            <AlertDescription>
              Keine Fairteiler mit gültigen Koordinaten gefunden.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card ref={cardRef}>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span>Fairteiler Karte</span>
          <DownloadButton elementRef={cardRef} filename='fairteiler-map' />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='relative h-[600px] w-full overflow-hidden rounded-lg'>
          {/* Fairteiler Panel */}
          <FairteilerPanel
            fairteilers={fairteilers}
            userLocation={null}
            onFairteilerClick={handleFairteilerClick}
          />
          <Map
            ref={mapRef}
            mapboxAccessToken={env.MAPBOX_TOKEN}
            attributionControl={false}
            mapStyle='mapbox://styles/dayno/cmfljv0c3008m01sb743xhwi5'
            onMove={(evt) => setViewState(evt.viewState)}
            onLoad={() => {
              if (mapRef.current?.getMap().isStyleLoaded()) {
                setMapLoaded(true);
              }
            }}
            onStyleData={() => {
              if (mapRef.current?.getMap().isStyleLoaded()) {
                setMapLoaded(true);
              }
            }}
            onClick={handleMapClick}
            onError={(error) => {
              console.error('Map error:', error);
            }}
            {...viewState}
          >
            <NavigationControl position='top-right' />

            {mapLoaded && (
              <>
                {markers.map((marker, index) => (
                  <Marker
                    key={`marker-${marker.slug || index}`}
                    longitude={marker.geoLng}
                    latitude={marker.geoLat}
                    color='green'
                    anchor='center'
                    onClick={(event) => handleMarkerClick(marker, event)}
                  >
                    <span className='relative flex size-8'>
                      <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-tertiary opacity-75'></span>
                      <span className='relative inline-flex size-8 items-center rounded-full bg-white'>
                        <span className='mx-auto size-7 rounded-full bg-tertiary'></span>
                      </span>
                    </span>
                  </Marker>
                ))}

                {activeFairteiler && (
                  <MapFairteilerPopup
                    activeFairteiler={activeFairteiler}
                    isUserNearFairteiler={false}
                  />
                )}
              </>
            )}
          </Map>
        </div>
      </CardContent>
    </Card>
  );
}
