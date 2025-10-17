import { createApiRoute } from '@server/api-helpers';
import { getSession } from '@server/dto';

/**
 * Handles GET requests to the /api/user/preferences route.
 */
export const GET = createApiRoute(async (request) => {
  const session = await getSession(request.headers);
  const user = session?.user;
  return user;
});
