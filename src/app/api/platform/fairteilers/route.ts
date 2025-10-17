import { createApiRoute } from '@server/api-helpers';
import { getFairteilers } from '@server/dto';

/**
 * Handles GET request to the /api/platform/fairteilers route.
 */
export const GET = createApiRoute(async () => {
  const fairteilers = await getFairteilers();
  return fairteilers;
});
