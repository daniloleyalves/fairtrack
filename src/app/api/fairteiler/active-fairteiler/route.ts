import { createApiRoute } from '@server/api-helpers';
import { getActiveFairteiler } from '@server/dto';

/**
 * Handles GET requests to the /api/fairteiler/active-fairteiler route.
 */
export const GET = createApiRoute(async (request) => {
  const headers = request.headers;
  const activeFairteiler = await getActiveFairteiler(headers);
  return activeFairteiler;
});
