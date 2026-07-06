import { createApiRoute } from '@server/api-helpers';
import { getOrigins } from '@server/fairteiler/dto';

/**
 * Handles GET requests to the /api/platform/origins route.
 */
export const GET = createApiRoute(async () => {
  const origins = await getOrigins();
  return origins;
});
