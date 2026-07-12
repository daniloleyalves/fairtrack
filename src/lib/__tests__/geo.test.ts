import { describe, it, expect } from 'vitest';
import { calculateDistance, isWithinRadius } from '../geo';

const berlin = { latitude: 52.52, longitude: 13.405 };
const munich = { latitude: 48.1372, longitude: 11.5754 };
const equatorOrigin = { latitude: 0, longitude: 0 };

describe('calculateDistance', () => {
  it('returns 0 for identical points', () => {
    expect(calculateDistance(berlin, berlin)).toBe(0);
  });

  it('returns roughly 504 km between Berlin and Munich', () => {
    expect(calculateDistance(berlin, munich) / 1000).toBeCloseTo(504.3, 0);
  });

  it('is symmetric', () => {
    expect(calculateDistance(berlin, munich)).toBeCloseTo(
      calculateDistance(munich, berlin),
      6,
    );
  });

  it('returns roughly 111.19 km for one degree of latitude at the equator', () => {
    const oneDegreeNorth = { latitude: 1, longitude: 0 };

    expect(calculateDistance(equatorOrigin, oneDegreeNorth)).toBeCloseTo(
      111194.93,
      1,
    );
  });

  it('returns roughly 111.19 m for 0.001 degrees of latitude', () => {
    const nearby = { latitude: 0.001, longitude: 0 };

    expect(calculateDistance(equatorOrigin, nearby)).toBeCloseTo(111.19, 1);
  });
});

describe('isWithinRadius', () => {
  const nearby = { latitude: 0.001, longitude: 0 };

  it('returns true when the distance is just inside the radius', () => {
    expect(isWithinRadius(equatorOrigin, nearby, 112)).toBe(true);
  });

  it('returns false when the distance is just outside the radius', () => {
    expect(isWithinRadius(equatorOrigin, nearby, 111)).toBe(false);
  });

  it('returns true when the distance equals the radius exactly', () => {
    const exactDistance = calculateDistance(equatorOrigin, nearby);

    expect(isWithinRadius(equatorOrigin, nearby, exactDistance)).toBe(true);
  });

  it('returns true for identical points regardless of radius', () => {
    expect(isWithinRadius(berlin, berlin, 0)).toBe(true);
  });
});
