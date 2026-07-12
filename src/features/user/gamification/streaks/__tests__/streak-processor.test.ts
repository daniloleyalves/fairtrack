import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { calculateUserAllTimeStreaks } from '../streak-processor';

const createWeek = (weekStart: string, overrides = {}) => ({
  week: weekStart,
  weekStart,
  totalQuantity: 1,
  contributionCount: 1,
  uniqueDays: 1,
  fairteilerCount: 1,
  categoryCount: 1,
  ...overrides,
});

describe('calculateUserAllTimeStreaks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns all zeros for empty input', () => {
    expect(calculateUserAllTimeStreaks([])).toEqual({
      currentStreak: 0,
      longestStreak: 0,
      totalWeeksActive: 0,
    });
  });

  it('returns a streak of 1 for a single contribution in the current week', () => {
    const result = calculateUserAllTimeStreaks([createWeek('2026-01-12')]);

    expect(result).toEqual({
      currentStreak: 1,
      longestStreak: 1,
      totalWeeksActive: 1,
    });
  });

  it('counts consecutive weeks ending in the current week as the current streak', () => {
    const result = calculateUserAllTimeStreaks([
      createWeek('2025-12-29'),
      createWeek('2026-01-05'),
      createWeek('2026-01-12'),
    ]);

    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(3);
    expect(result.totalWeeksActive).toBe(3);
  });

  it('stops the current streak at a gap between weeks', () => {
    const result = calculateUserAllTimeStreaks([
      createWeek('2025-12-15'),
      createWeek('2026-01-05'),
      createWeek('2026-01-12'),
    ]);

    expect(result.currentStreak).toBe(2);
    expect(result.longestStreak).toBe(2);
  });

  it('keeps the longest streak from an older run while the current streak is shorter', () => {
    const result = calculateUserAllTimeStreaks([
      createWeek('2025-11-03'),
      createWeek('2025-11-10'),
      createWeek('2025-11-17'),
      createWeek('2025-11-24'),
      createWeek('2026-01-05'),
      createWeek('2026-01-12'),
    ]);

    expect(result.currentStreak).toBe(2);
    expect(result.longestStreak).toBe(4);
    expect(result.totalWeeksActive).toBe(6);
  });

  it('reports a current streak of 0 when the last contribution is more than a week old', () => {
    const result = calculateUserAllTimeStreaks([
      createWeek('2025-12-15'),
      createWeek('2025-12-22'),
    ]);

    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(2);
  });

  it('still counts the streak when the last contribution week started exactly one week ago', () => {
    const result = calculateUserAllTimeStreaks([
      createWeek('2025-12-29'),
      createWeek('2026-01-05'),
    ]);

    expect(result.currentStreak).toBe(2);
  });

  it('counts a week with multiple contributions as a single streak week', () => {
    const result = calculateUserAllTimeStreaks([
      createWeek('2026-01-05', { contributionCount: 4, uniqueDays: 3 }),
      createWeek('2026-01-12', { contributionCount: 7, uniqueDays: 5 }),
    ]);

    expect(result.currentStreak).toBe(2);
    expect(result.longestStreak).toBe(2);
    expect(result.totalWeeksActive).toBe(2);
  });
});
