import { formatInTimeZone } from 'date-fns-tz';
import { MemberRolesEnum } from '@/lib/auth/auth-permissions';

export const CONTRIBUTION_TIME_ZONE = 'Europe/Berlin';

export const MAX_BACKDATE_DAYS = 365;

export const BACKDATE_ROLES = new Set<string>([
  MemberRolesEnum.OWNER,
  MemberRolesEnum.MEMBER,
  MemberRolesEnum.EMPLOYEE,
]);

export function toContributionDay(date: Date): string {
  return formatInTimeZone(date, CONTRIBUTION_TIME_ZONE, 'yyyy-MM-dd');
}

export function earliestContributionDay(now: Date = new Date()): string {
  const earliest = new Date(now);
  earliest.setUTCDate(earliest.getUTCDate() - MAX_BACKDATE_DAYS);
  return toContributionDay(earliest);
}

export function resolveContributionTimestamp(
  day: string | null | undefined,
  now: Date = new Date(),
): Date | undefined {
  if (!day || day === toContributionDay(now)) return undefined;
  return new Date(`${day}T12:00:00Z`);
}

export function isAllowedContributionDay(
  day: string,
  now: Date = new Date(),
): boolean {
  return day <= toContributionDay(now) && day >= earliestContributionDay(now);
}
