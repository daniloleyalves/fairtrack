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

// How much of a reading's reported GPS inaccuracy is forgiven. Phones indoors
// often report 20-50 m; anything beyond this cap is too vague to count as
// being at the fairteiler.
export const MAX_ACCURACY_TOLERANCE = 30; // meters

/**
 * Whether a location reading places the user at the target. The reading's
 * own accuracy (in meters, as reported by the browser) widens the radius, up
 * to `MAX_ACCURACY_TOLERANCE`.
 */
export function isAtLocation(
  userLocation: Coordinates,
  targetLocation: Coordinates,
  accuracy: number | null | undefined,
  radiusInMeters: number = DEFAULT_PROXIMITY_RADIUS,
): boolean {
  const tolerance = Math.min(
    Math.max(accuracy ?? 0, 0),
    MAX_ACCURACY_TOLERANCE,
  );
  return isWithinRadius(
    userLocation,
    targetLocation,
    radiusInMeters + tolerance,
  );
}

export const DEFAULT_FAIRTEILERSLUG_IN_MAP = 'raupe-immersatt';
