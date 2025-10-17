import { createApiRoute } from '@server/api-helpers';
import { getFairteilerDashboardData } from '@server/dto';

/**
 * Handles GET requests to the /api/fairteiler/dashboard route.
 */
export const GET = createApiRoute(async (request) => {
  const dashboardData = await getFairteilerDashboardData(request.headers);
  return dashboardData;
});
