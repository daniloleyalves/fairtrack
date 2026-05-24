import { createApiRoute } from '@server/api-helpers';
import { getCompaniesByFairteiler } from '@server/fairteiler/queries';

/**
 * Handles GET requests to the /api/fairteiler/fairteiler-companies route.
 */
export const GET = createApiRoute(async (request) => {
  const headers = request.headers;
  const companiesByFairteiler = await getCompaniesByFairteiler(headers);
  return companiesByFairteiler;
});
