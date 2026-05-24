import { createApiRoute } from '@server/api-helpers';
import { getFairteilerDashboardData } from '@server/fairteiler/queries';

/**
 * Handles GET requests to the /api/fairteiler/dashboard route.
 */
export const GET = createApiRoute(async () => {
  return await getFairteilerDashboardData();
});
