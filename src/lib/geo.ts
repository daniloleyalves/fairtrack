export interface Coordinates {
  latitude: number;
  longitude: number;
}

export function calculateDistance(
  point1: Coordinates,
  point2: Coordinates,
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (point1.latitude * Math.PI) / 180;
  const φ2 = (point2.latitude * Math.PI) / 180;
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters

  return distance;
}

export function isWithinRadius(
  userLocation: Coordinates,
  targetLocation: Coordinates,
  radiusInMeters: number,
): boolean {
  const distance = calculateDistance(userLocation, targetLocation);
  const isWithin = distance <= radiusInMeters;

  return isWithin;
}

export const DEFAULT_PROXIMITY_RADIUS = 20; // meters

export const DEFAULT_FAIRTEILERSLUG_IN_MAP = 'raupe-immersatt';
