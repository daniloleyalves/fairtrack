import { createApiRoute } from '@server/api-helpers';
import { getActiveFairteiler } from '@server/fairteiler/queries';

/**
 * Handles GET requests to the /api/fairteiler/active-fairteiler route.
 */
export const GET = createApiRoute(async () => {
  return await getActiveFairteiler();
});
