import { describe, it, expect } from 'vitest';
import {
  isAllowedContributionDay,
  resolveContributionTimestamp,
  toContributionDay,
} from '../contribution-date';

// 23:30 UTC on 11 Oct is already 12 Oct in Berlin (CEST, UTC+2).
const lateEvening = new Date('2026-10-11T23:30:00Z');

describe('contribution date helpers', () => {
  it('uses the Berlin calendar day', () => {
    expect(toContributionDay(lateEvening)).toBe('2026-10-12');
  });

  it('keeps the default timestamp for today or no date', () => {
    expect(resolveContributionTimestamp('2026-10-12', lateEvening)).toBe(
      undefined,
    );
    expect(resolveContributionTimestamp(null, lateEvening)).toBe(undefined);
  });

  it('stores noon UTC for an earlier day', () => {
    expect(resolveContributionTimestamp('2026-03-29', lateEvening)).toEqual(
      new Date('2026-03-29T12:00:00Z'),
    );
  });

  it('allows today and past days within a year, nothing else', () => {
    expect(isAllowedContributionDay('2026-10-12', lateEvening)).toBe(true);
    expect(isAllowedContributionDay('2025-10-12', lateEvening)).toBe(true);
    expect(isAllowedContributionDay('2025-10-11', lateEvening)).toBe(false);
    expect(isAllowedContributionDay('2026-10-13', lateEvening)).toBe(false);
  });
});
