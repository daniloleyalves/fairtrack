'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Map, {
  GeolocateControl,
  GeolocateControlInstance,
  GeolocateErrorEvent,
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

interface UserLocationState {
  coordinates: { latitude: number; longitude: number } | null;
  error: string | null;
  loading: boolean;
  permissionDenied: boolean;
}

interface RetryState {
  retryCount: number;
  maxRetries: number;
  isRetrying: boolean;
  canRetry: boolean;
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
  const geolocateControlRef = useRef<GeolocateControlInstance>(null);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
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
      permissionDenied: false,
    },
  );

  const [retryState, setRetryState] = useState<RetryState>({
    retryCount: 0,
    maxRetries: 3,
    isRetrying: false,
    canRetry: false,
  });

  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);

  const [viewState, setViewState] = useState({
    longitude: 9.16104,
    latitude: 48.769136,
    zoom: 5,
    pitch: 0,
    bearing: 0,
  });

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

  const handleGeolocateSuccess = useCallback(
    (position: GeolocateResultEvent) => {
      const { latitude, longitude } = position.coords;
      setUserLocationState({
        coordinates: { latitude, longitude },
        error: null,
        loading: false,
        permissionDenied: false,
      });
      // Reset retry state on success
      setRetryState({
        retryCount: 0,
        maxRetries: 3,
        isRetrying: false,
        canRetry: false,
      });
      // Clear timers and hide loading indicator on success
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      setShowLoadingIndicator(false);
    },
    [],
  );

  const retryGeolocation = useCallback(() => {
    if (
      geolocateControlRef.current &&
      retryState.retryCount < retryState.maxRetries
    ) {
      setRetryState((prev) => ({
        ...prev,
        retryCount: prev.retryCount + 1,
        isRetrying: true,
      }));

      const retryDelay = retryState.retryCount === 0 ? 2000 : 5000; // 2s for first retry, 5s for second

      retryTimerRef.current = setTimeout(() => {
        geolocateControlRef.current?.trigger();
        setRetryState((prev) => ({ ...prev, isRetrying: false }));
      }, retryDelay);
    }
  }, [retryState.retryCount, retryState.maxRetries]);

  const handleGeolocateError = useCallback(
    (error: GeolocateErrorEvent) => {
      let errorMessage = 'Standortzugriff fehlgeschlagen';
      let permissionDenied = false;
      let canRetry = false;

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Standortzugriff vom Benutzer verweigert';
          permissionDenied = true;
          canRetry = false;
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Standortinformationen nicht verfügbar';
          canRetry = true;
          break;
        case error.TIMEOUT:
          errorMessage = 'Standortbestimmung zeitüberschritten';
          canRetry = true;
          break;
        default:
          errorMessage = error.message || 'Unbekannter Standortfehler';
          canRetry = true;
          break;
      }

      // Check if we should retry
      const shouldRetry =
        canRetry && retryState.retryCount < retryState.maxRetries;

      if (shouldRetry) {
        // Don't set error state yet, just retry
        retryGeolocation();
        return;
      }

      // Final failure - set error state
      setUserLocationState({
        coordinates: null,
        error: errorMessage,
        loading: false,
        permissionDenied,
      });

      setRetryState((prev) => ({
        ...prev,
        canRetry: canRetry && !permissionDenied,
        isRetrying: false,
      }));

      // Clear timers and hide loading indicator on final error
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      setShowLoadingIndicator(false);
    },
    [retryState.retryCount, retryState.maxRetries, retryGeolocation],
  );

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

  // Manual retry function for user-triggered retries
  const handleManualRetry = useCallback(() => {
    if (geolocateControlRef.current) {
      setRetryState({
        retryCount: 0,
        maxRetries: 3,
        isRetrying: false,
        canRetry: false,
      });
      setUserLocationState((prev) => ({
        ...prev,
        error: null,
        loading: true,
      }));
      geolocateControlRef.current.trigger();
    }
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, []);

  return (
    <div className='relative h-screen w-full bg-white md:h-[calc(100vh-100px)] md:rounded-lg'>
      {/* Location Error Alert */}
      {userLocationState.error && !userLocationState.permissionDenied && (
        <div className='absolute top-16 right-12 left-2 z-10 md:top-2 md:left-auto md:w-96'>
          <Alert variant='destructive'>
            <AlertCircle className='size-4' />
            <AlertDescription className='flex items-center justify-between'>
              <span>{userLocationState.error}</span>
              {retryState.canRetry && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleManualRetry}
                  className='ml-2 h-6 px-2'
                >
                  <RotateCcw className='mr-1 size-3' />
                  Erneut versuchen
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Permission Denied Alert */}
      {userLocationState.permissionDenied && (
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
              {retryState.isRetrying
                ? `Standort wird ermittelt... (Versuch ${retryState.retryCount + 1}/${retryState.maxRetries})`
                : 'Standort wird ermittelt...'}
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
            enableHighAccuracy: retryState.retryCount < 2, // Disable high accuracy on final retry
            timeout: 10000 + retryState.retryCount * 5000, // Progressive timeout: 10s, 15s, 20s
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
            // Clear the timer and hide loading indicator
            if (loadingTimerRef.current) {
              clearTimeout(loadingTimerRef.current);
              loadingTimerRef.current = null;
            }
            setShowLoadingIndicator(false);
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
