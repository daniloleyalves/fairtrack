import { createApiRoute } from '@server/api-helpers';
import { getUserDashboardData } from '@server/dto';

/**
 * Handles GET requests to the /api/user/dashboard route.
 */
export const GET = createApiRoute(async (request) => {
  const dashboardData = await getUserDashboardData(request.headers);
  return dashboardData;
});
