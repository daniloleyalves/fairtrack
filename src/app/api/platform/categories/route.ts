import { createApiRoute } from '@server/api-helpers';
import { getCategories } from '@server/dto';

/**
 * Handles GET requests to the /api/platform/categories route.
 */
export const GET = createApiRoute(async () => {
  const categories = await getCategories();
  return categories;
});
