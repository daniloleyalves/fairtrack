import { createApiRoute } from '@server/api-helpers';
import { getPlatformStats } from '@server/dto';

/**
 * GET /api/platform/stats
 * Public endpoint - returns aggregated platform-wide statistics.
 */
export const GET = createApiRoute(async () => {
  return await getPlatformStats();
});
