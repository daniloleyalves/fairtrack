import { createApiRoute } from '@server/api-helpers';
import { getMilestoneData } from '@server/user/queries';

export const GET = createApiRoute(async () => {
  return await getMilestoneData();
});
