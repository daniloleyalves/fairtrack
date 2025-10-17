import { createApiRoute } from '@server/api-helpers';
import { getCompanies } from '@server/dto';

/**
 * Handles GET requests to the /api/platform/companies route.
 */
export const GET = createApiRoute(async () => {
  const companies = await getCompanies();
  return companies;
});
