import { createApiRoute } from '@server/api-helpers';
import { getMilestoneData } from '@server/dto';

/**
 * Handles GET requests to the /api/user/dashboard route.
 */
export const GET = createApiRoute(async (request) => {
  const milestoneData = await getMilestoneData(request.headers);
  return milestoneData;
});
