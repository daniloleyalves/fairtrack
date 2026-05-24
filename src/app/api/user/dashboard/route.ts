import { createApiRoute } from '@server/api-helpers';
import { getUserDashboardData } from '@server/user/queries';

/**
 * Handles GET requests to the /api/user/dashboard route.
 */
export const GET = createApiRoute(async () => {
  return await getUserDashboardData();
});
