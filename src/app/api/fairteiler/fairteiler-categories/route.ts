import { createApiRoute } from '@server/api-helpers';
import { getCategoriesByFairteiler } from '@server/dto';

/**
 * Handles GET requests to the /api/fairteiler/fairteiler-categories route.
 */
export const GET = createApiRoute(async (request) => {
  const headers = request.headers;
  const categoriesByFairteiler = await getCategoriesByFairteiler(headers);
  return categoriesByFairteiler;
});
