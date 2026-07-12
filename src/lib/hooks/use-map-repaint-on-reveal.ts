'use client';

import { useEffect } from 'react';
import type { MapRef } from 'react-map-gl/mapbox';

// Next's cacheComponents keeps visited segments alive but hidden. While a
// segment is hidden its container collapses to 0x0, which makes mapbox-gl
// clear its canvas buffer — and revealing the segment again does not trigger
// a repaint on its own. Observe visibility and force one.
export function useMapRepaintOnReveal(
  mapRef: React.RefObject<MapRef | null>,
  containerRef: React.RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        const map = mapRef.current?.getMap();
        map?.resize();
        map?.triggerRepaint();
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [mapRef, containerRef]);
}
