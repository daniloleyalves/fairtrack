import { createApiRoute } from '@server/api-helpers';
import { getCategoriesByFairteiler } from '@server/fairteiler/queries';

export const GET = createApiRoute(async () => {
  return await getCategoriesByFairteiler();
});
