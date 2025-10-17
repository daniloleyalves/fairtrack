'use client';

import { useState, useEffect } from 'react';
import type { Coordinates } from '@/lib/geo';

const DEBUG = process.env.NODE_ENV === 'development';

function debugLog(message: string, data?: unknown) {
  if (DEBUG) {
    console.log(`[useUserLocation] ${message}`, data ?? '');
  }
}

export interface LocationState {
  coordinates: Coordinates | null;
  error: string | null;
  loading: boolean;
  permissionDenied: boolean;
}

export function useUserLocation(options?: {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
  enabled?: boolean;
}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 5000,
    watchPosition = true,
    enabled = true,
  } = options ?? {};

  const [state, setState] = useState<LocationState>({
    coordinates: null,
    error: null,
    loading: true,
    permissionDenied: false,
  });

  useEffect(() => {
    if (!enabled) {
      debugLog('🚫 Location tracking disabled');
      setState({
        coordinates: null,
        error: null,
        loading: false,
        permissionDenied: false,
      });
      return;
    }

    if (!navigator.geolocation) {
      debugLog('❌ Geolocation not supported');
      setState({
        coordinates: null,
        error: 'Geolocation is not supported by this browser',
        loading: false,
        permissionDenied: false,
      });
      return;
    }

    debugLog('🎯 Starting location tracking', {
      watchPosition,
      enableHighAccuracy,
    });

    const positionOptions: PositionOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge,
    };

    const handleSuccess = (position: GeolocationPosition) => {
      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      // debugLog('✅ Location received', {
      //   coordinates: coords,
      //   accuracy: position.coords.accuracy,
      //   timestamp: new Date(position.timestamp).toISOString(),
      // });

      setState({
        coordinates: coords,
        error: null,
        loading: false,
        permissionDenied: false,
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = 'Failed to get location';
      let permissionDenied = false;

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied by user';
          permissionDenied = true;
          debugLog('🚫 Location permission denied');
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable';
          debugLog('📍❌ Location position unavailable');
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out';
          debugLog('⏰ Location request timed out');
          break;
        default:
          debugLog('❌ Unknown location error:', error);
      }

      setState({
        coordinates: null,
        error: errorMessage,
        loading: false,
        permissionDenied,
      });
    };

    let watchId: number | null = null;

    if (watchPosition) {
      debugLog('👀 Starting watchPosition');
      watchId = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        positionOptions,
      );
    } else {
      debugLog('📍 Getting current position');
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        positionOptions,
      );
    }

    // Cleanup function
    return () => {
      if (watchId !== null) {
        debugLog('🛑 Clearing location watch:', watchId);
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [enabled, enableHighAccuracy, timeout, maximumAge, watchPosition]);

  return state;
}
