import { formatInTimeZone } from 'date-fns-tz';
import { MemberRolesEnum } from '@/lib/auth/auth-permissions';

export const CONTRIBUTION_TIME_ZONE = 'Europe/Berlin';

/** How far back a contribution may be dated, in days. */
export const MAX_BACKDATE_DAYS = 365;

/** Roles that may record a contribution for an earlier day. */
export const BACKDATE_ROLES = new Set<string>([
  MemberRolesEnum.OWNER,
  MemberRolesEnum.MEMBER,
  MemberRolesEnum.EMPLOYEE,
]);

/** Calendar day (yyyy-MM-dd) of `date` in the fairteiler time zone. */
export function toContributionDay(date: Date): string {
  return formatInTimeZone(date, CONTRIBUTION_TIME_ZONE, 'yyyy-MM-dd');
}

/** Earliest day (yyyy-MM-dd) a contribution may be dated to. */
export function earliestContributionDay(now: Date = new Date()): string {
  const earliest = new Date(now);
  earliest.setUTCDate(earliest.getUTCDate() - MAX_BACKDATE_DAYS);
  return toContributionDay(earliest);
}

/**
 * Resolves the timestamp to store for a contribution recorded for `day`.
 * Returns `undefined` for today (the insert keeps its `now()` default) and
 * noon UTC of that day otherwise, which falls on the same calendar day in
 * Europe/Berlin regardless of daylight saving time.
 */
export function resolveContributionTimestamp(
  day: string | null | undefined,
  now: Date = new Date(),
): Date | undefined {
  if (!day || day === toContributionDay(now)) return undefined;
  return new Date(`${day}T12:00:00Z`);
}

/** Whether `day` is today or in the past and within the backdate window. */
export function isAllowedContributionDay(
  day: string,
  now: Date = new Date(),
): boolean {
  return day <= toContributionDay(now) && day >= earliestContributionDay(now);
}
