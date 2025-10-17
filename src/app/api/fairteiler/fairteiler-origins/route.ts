import { createApiRoute } from '@server/api-helpers';
import { getOriginsByFairteiler } from '@server/dto';

/**
 * Handles GET requests to the /api/fairteiler/fairteiler-origins route.
 */
export const GET = createApiRoute(async (request) => {
  const headers = request.headers;
  const originsByFairteiler = await getOriginsByFairteiler(headers);
  return originsByFairteiler;
});
