/**
 * Per-domain TanStack `staleTime` constants. Names mirror the refactor doc
 * §6 freshness table — pick one per `query-keys.ts` factory entry.
 */
export const STALE = {
  /** Reference catalogs (platform origins/categories/companies, tutorial step catalog). */
  CATALOG: 5 * 60_000,
  /** User profile and preferences. */
  PROFILE: 2 * 60_000,
  /** Member / access lists, invitations. */
  MEMBERS: 60_000,
  /** Dashboards and contribution history. */
  DASHBOARD: 30_000,
  /** Active-session context, tutorial state — paired with `refetchOnMount: 'always'`. */
  ACTIVE_SESSION: 30_000,
  /** Live counters (recent check-ins, contributions-today). */
  LIVE: 0,
} as const;
