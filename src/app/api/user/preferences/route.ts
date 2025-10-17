import { createApiRoute } from '@server/api-helpers';
import { getUserPreferences } from '@server/dto';

/**
 * Handles GET requests to the /api/user/preferences route.
 */
export const GET = createApiRoute(async (request) => {
  const perferencesData = await getUserPreferences(request.headers);
  return perferencesData;
});
