import { getFairteilerTutorialWithSteps } from '@/server/dto';
import { createApiRoute } from '@server/api-helpers';

/**
 * Handles GET requests to the /api/fairteiler/tutorial route.
 */
export const GET = createApiRoute(async (request) => {
  const headers = request.headers;
  const fairteilerTags = await getFairteilerTutorialWithSteps(headers);
  return fairteilerTags;
});
