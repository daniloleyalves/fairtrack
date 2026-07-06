import { createApiRoute } from '@server/api-helpers';
import { getCompaniesByFairteiler } from '@server/fairteiler/queries';

export const GET = createApiRoute(async () => {
  return await getCompaniesByFairteiler();
});
