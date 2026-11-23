'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Map, {
  GeolocateControl,
  GeolocateControlInstance,
  GeolocateResultEvent,
  Marker,
  NavigationControl,
  MapRef,
  MarkerEvent,
} from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AlertCircle, AlertTriangle, Loader2, RotateCcw } from 'lucide-react';
import {
  DEFAULT_FAIRTEILERSLUG_IN_MAP,
  DEFAULT_PROXIMITY_RADIUS,
  isWithinRadius,
} from '@/lib/geo';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ProximityIndicator } from './components/map-proximity-indicator';
import { FairteilerPanel } from './components/map-fairteiler-panel';
import { Fairteiler } from '@/server/db/db-types';
import { MapFairteilerPopup } from './components/map-fairteiler-popup';
import { useIsMobile } from '@/lib/hooks/use-devices';
import { useMapRepaintOnReveal } from '@/lib/hooks/use-map-repaint-on-reveal';

type LocationError = 'denied' | 'unavailable';

interface UserLocationState {
  coordinates: { latitude: number; longitude: number } | null;
  error: LocationError | null;
  loading: boolean;
}

async function queryGeolocationPermission(): Promise<PermissionState | null> {
  try {
    const status = await navigator.permissions.query({ name: 'geolocation' });
    return status.state;
  } catch {
    return null;
  }
}

interface FairteilerMapProps {
  mapboxToken: string | undefined;
  fairteilers?: Fairteiler[];
}

export function FairteilerMap({
  mapboxToken,
  fairteilers = [],
}: FairteilerMapProps) {
  const isMobile = useIsMobile();

  // Convert fairteilers to markers format and filter those with valid coordinates
  const markers = fairteilers
    .filter((f) => f.geoLat && f.geoLng)
    .map((fairteiler) => ({
      ...fairteiler,
      geoLng: parseFloat(fairteiler.geoLng),
      geoLat: parseFloat(fairteiler.geoLat),
    }))
    .filter((m) => !isNaN(m.geoLng) && !isNaN(m.geoLat)); // Extra safety check

  // Find initial fairteiler
  const initFairteiler =
    markers.find(
      (fairteiler) => fairteiler.slug === DEFAULT_FAIRTEILERSLUG_IN_MAP,
    ) ?? markers[0]; // Fallback to first marker if default not found

  const mapRef = useRef<MapRef>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const geolocateControlRef = useRef<GeolocateControlInstance>(null);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [styleLoaded, setStyleLoaded] = useState(false);
  const [locationRequested, setLocationRequested] = useState(false);

  const [activeFairteiler, setActiveFairteiler] = useState<
    typeof initFairteiler | null
  >(null);

  const [userLocationState, setUserLocationState] = useState<UserLocationState>(
    {
      coordinates: null,
      error: null,
      loading: false,
    },
  );

  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);

  const [viewState, setViewState] = useState({
    longitude: 9.16104,
    latitude: 48.769136,
    zoom: 5,
    pitch: 0,
    bearing: 0,
  });

  useMapRepaintOnReveal(mapRef, wrapperRef);

  const isUserNearFairteiler =
    userLocationState.coordinates &&
    activeFairteiler &&
    isWithinRadius(
      userLocationState.coordinates,
      { latitude: activeFairteiler.geoLat, longitude: activeFairteiler.geoLng },
      DEFAULT_PROXIMITY_RADIUS,
    );

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
        if (mapRef.current && styleLoaded) {
          mapRef.current.flyTo({
            center: [marker.geoLng, marker.geoLat],
            duration: 1500,
            essential: true,
          });
        }
      } catch (error) {
        console.error('Error handling fairteiler click:', error);
      }
    },
    [styleLoaded],
  );

  // Handle map click to clear active fairteiler
  const handleMapClick = useCallback(() => {
    setActiveFairteiler(null);
  }, []);

  // Smooth animation for marker clicks
  const handleMarkerClick = useCallback(
    (marker: typeof initFairteiler, event: MarkerEvent<MouseEvent>) => {
      event.originalEvent.stopPropagation();

      if (!styleLoaded || !marker) return;

      setActiveFairteiler(marker);

      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [marker.geoLng, marker.geoLat],
          zoom: 18,
          duration: 1500,
          essential: true,
        });
      }
    },
    [styleLoaded],
  );

  const hideLoadingIndicator = useCallback(() => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    setShowLoadingIndicator(false);
  }, []);

  const lastSuccessRef = useRef(0);

  const handleGeolocateSuccess = useCallback(
    (position: GeolocateResultEvent) => {
      lastSuccessRef.current = Date.now();
      const { latitude, longitude } = position.coords;
      setUserLocationState({
        coordinates: { latitude, longitude },
        error: null,
        loading: false,
      });
      hideLoadingIndicator();
    },
    [hideLoadingIndicator],
  );

  // Mapbox copies the GeolocationPositionError into its event with
  // Object.assign, which drops `code` and the PERMISSION_DENIED constant
  // (prototype getters), so the event can't tell a denial from a timeout.
  const handleGeolocateError = useCallback(async () => {
    hideLoadingIndicator();
    const lastSuccess = lastSuccessRef.current;
    const permission = await queryGeolocationPermission();
    if (lastSuccessRef.current !== lastSuccess) return;
    setUserLocationState((prev) => ({
      ...prev,
      coordinates: null,
      error: permission === 'denied' ? 'denied' : 'unavailable',
      loading: false,
    }));
  }, [hideLoadingIndicator]);

  const restartGeolocation = useCallback(() => {
    const control = geolocateControlRef.current;
    if (!control) return;
    setUserLocationState((prev) => ({ ...prev, error: null }));
    // trigger() toggles tracking, so stop a running (errored) watch first
    if (control._watchState !== 'OFF') control.trigger();
    control.trigger();
  }, []);

  // Auto-trigger location when map is ready (only once)
  useEffect(() => {
    if (
      mapLoaded &&
      styleLoaded &&
      !locationRequested &&
      geolocateControlRef.current
    ) {
      const timer = setTimeout(() => {
        setLocationRequested(true);
        geolocateControlRef.current?.trigger();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [mapLoaded, styleLoaded, locationRequested]);

  // Restart tracking once the user grants access in the browser settings
  const locationError = userLocationState.error;
  useEffect(() => {
    if (locationError !== 'denied') return;
    let status: PermissionStatus | null = null;
    const onChange = () => {
      if (status?.state !== 'denied') restartGeolocation();
    };
    navigator.permissions
      ?.query({ name: 'geolocation' })
      .then((s) => {
        status = s;
        s.addEventListener('change', onChange);
      })
      .catch(() => undefined);
    return () => status?.removeEventListener('change', onChange);
  }, [locationError, restartGeolocation]);

  useEffect(() => hideLoadingIndicator, [hideLoadingIndicator]);

  // Validate mapbox token
  if (!mapboxToken) {
    return (
      <Alert className='mb-4' variant='destructive'>
        <AlertCircle className='size-4' />
        <AlertDescription>
          Mapbox-Token fehlt. Bitte konfigurieren Sie die Umgebungsvariable.
        </AlertDescription>
      </Alert>
    );
  }

  // Check if we have valid fairteilers
  if (!initFairteiler || markers.length === 0) {
    return (
      <Alert className='mb-4' variant='destructive'>
        <AlertCircle className='size-4' />
        <AlertDescription>
          Keine Fairteiler mit gültigen Koordinaten gefunden.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className='relative h-screen w-full bg-white md:h-[calc(100vh-100px)] md:rounded-lg'
    >
      {/* Location Unavailable Alert */}
      {userLocationState.error === 'unavailable' && (
        <div className='absolute top-16 right-12 left-2 z-10 md:top-2 md:left-auto md:w-96'>
          <Alert variant='destructive'>
            <AlertCircle className='size-4' />
            <AlertDescription className='flex flex-col items-start gap-2'>
              <span>
                Dein Standort konnte nicht ermittelt werden. Prüfe, ob die
                Ortungsdienste deines Geräts für den Browser aktiviert sind.
              </span>
              <Button
                variant='outline'
                size='sm'
                onClick={restartGeolocation}
                className='h-6 px-2'
              >
                <RotateCcw className='mr-1 size-3' />
                Erneut versuchen
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Permission Denied Alert */}
      {userLocationState.error === 'denied' && (
        <div className='absolute top-16 right-12 left-2 z-10 md:top-2 md:left-auto md:w-96'>
          <Alert className='border-orange-400'>
            <AlertTriangle className='size-4 text-orange-400!' />
            <AlertDescription>
              Bitte erlaube den Standortzugriff in deinen Browser-Einstellungen,
              um mit der Lebensmittelabgabe fortzufahren
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Location Loading Overlay */}
      {showLoadingIndicator && userLocationState.loading && (
        <div className='absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-black/20 backdrop-blur-sm'>
          <div className='flex flex-col items-center gap-3 rounded-lg bg-white p-6 shadow-lg'>
            <Loader2 className='size-8 animate-spin text-tertiary' />
            <p className='text-sm font-medium text-gray-700'>
              Standort wird ermittelt...
            </p>
          </div>
        </div>
      )}

      {/* Fairteiler Panel */}
      <FairteilerPanel
        fairteilers={fairteilers}
        userLocation={userLocationState.coordinates}
        onFairteilerClick={handleFairteilerClick}
      />

      <Map
        ref={mapRef}
        reuseMaps
        style={{
          borderRadius: isMobile ? '0px' : '10px',
          boxShadow:
            '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        }}
        mapboxAccessToken={mapboxToken}
        attributionControl={false}
        mapStyle='mapbox://styles/dayno/cmfljv0c3008m01sb743xhwi5'
        onMove={(evt) => setViewState(evt.viewState)}
        onLoad={() => {
          setMapLoaded(true);
          if (mapRef.current?.getMap().isStyleLoaded()) {
            setStyleLoaded(true);
          }
        }}
        onStyleData={() => {
          if (mapRef.current?.getMap().isStyleLoaded()) {
            setStyleLoaded(true);
          }
        }}
        onClick={handleMapClick}
        onError={(error) => {
          console.error('Map error:', error);
        }}
        {...viewState}
      >
        <NavigationControl />
        <GeolocateControl
          ref={geolocateControlRef}
          trackUserLocation={true}
          showUserHeading={true}
          showUserLocation={true}
          showAccuracyCircle={false}
          positionOptions={{
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 5000,
          }}
          fitBoundsOptions={{
            duration: 3000,
            zoom: 18,
            maxZoom: 20,
          }}
          onGeolocate={handleGeolocateSuccess}
          onError={handleGeolocateError}
          onTrackUserLocationStart={() => {
            setUserLocationState((prev) => ({
              ...prev,
              loading: true,
            }));
            // Show loading indicator after a short delay to prevent flickering
            loadingTimerRef.current = setTimeout(() => {
              setShowLoadingIndicator(true);
            }, 300);
          }}
          onTrackUserLocationEnd={() => {
            setUserLocationState((prev) => ({
              ...prev,
              loading: false,
            }));
            hideLoadingIndicator();
          }}
        />

        {styleLoaded && (
          <>
            {markers.map((marker, index) => (
              <ProximityIndicator
                key={`proximity-${marker.slug || index}`}
                id={`fairteiler-${marker.slug || index}`}
                center={{ latitude: marker.geoLat, longitude: marker.geoLng }}
                radiusInMeters={DEFAULT_PROXIMITY_RADIUS}
                isUserInRange={
                  userLocationState.coordinates
                    ? isWithinRadius(
                        userLocationState.coordinates,
                        { latitude: marker.geoLat, longitude: marker.geoLng },
                        DEFAULT_PROXIMITY_RADIUS,
                      )
                    : false
                }
              />
            ))}

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
                isUserNearFairteiler={isUserNearFairteiler}
                activeFairteiler={activeFairteiler}
              />
            )}
          </>
        )}
      </Map>
    </div>
  );
}
