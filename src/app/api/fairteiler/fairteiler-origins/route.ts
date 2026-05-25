import { createApiRoute } from '@server/api-helpers';
import { getOriginsByFairteiler } from '@server/fairteiler/queries';

export const GET = createApiRoute(async () => {
  return await getOriginsByFairteiler();
});
