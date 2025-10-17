import { createApiRoute } from '@server/api-helpers';
import { getTags } from '@server/dto';

/**
 * Handles GET requests to the /api/fairteiler/tags route.
 */
export const GET = createApiRoute(async (request) => {
  const headers = request.headers;
  const fairteilerTags = await getTags(headers);
  return fairteilerTags;
});
