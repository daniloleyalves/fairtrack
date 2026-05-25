import { getFairteilerTutorialWithSteps } from '@/server/tutorial/queries';
import { createApiRoute } from '@server/api-helpers';

export const GET = createApiRoute(async () => {
  return await getFairteilerTutorialWithSteps();
});
