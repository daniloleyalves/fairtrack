'use client';

import { Source, Layer } from 'react-map-gl/mapbox';
import type { Coordinates } from '@/lib/geo';

interface ProximityIndicatorProps {
  center: Coordinates;
  radiusInMeters: number;
  isUserInRange: boolean;
  id: string;
}

export function ProximityIndicator({
  center,
  radiusInMeters,
  isUserInRange,
  id,
}: ProximityIndicatorProps) {
  // Create a circle polygon using the center point and radius
  const createCirclePolygon = (
    centerCoords: Coordinates,
    radius: number,
  ): GeoJSON.Feature<GeoJSON.Polygon> => {
    const points = 64;
    const coordinates: number[][] = [];

    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      const dx = radius * Math.cos(angle);
      const dy = radius * Math.sin(angle);

      // Convert meters to degrees (approximate)
      const deltaLat = dy / 111320;
      const deltaLng =
        dx / (111320 * Math.cos((centerCoords.latitude * Math.PI) / 180));

      coordinates.push([
        centerCoords.longitude + deltaLng,
        centerCoords.latitude + deltaLat,
      ]);
    }

    // Close the polygon
    coordinates.push(coordinates[0]);

    const polygon = {
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [coordinates],
      },
      properties: {},
    };

    return polygon;
  };

  const circleGeoJSON: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: [createCirclePolygon(center, radiusInMeters)],
  };

  // Use unique IDs based on the passed ID prop
  const layerStyle = {
    id: `proximity-circle-${id}`,
    type: 'fill' as const,
    paint: {
      'fill-color': isUserInRange ? '#446622' : '#3b82f6',
      'fill-opacity': 0.2,
    },
  };

  const strokeLayerStyle = {
    id: `proximity-circle-stroke-${id}`,
    type: 'line' as const,
    paint: {
      'line-color': isUserInRange ? '#16a34a' : '#2563eb',
      'line-width': 2,
      'line-opacity': 0.8,
    },
  };

  return (
    <Source id={`proximity-circle-${id}`} type='geojson' data={circleGeoJSON}>
      <Layer {...layerStyle} />
      <Layer {...strokeLayerStyle} />
    </Source>
  );
}
