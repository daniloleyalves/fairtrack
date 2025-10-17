import { createApiRoute } from '@server/api-helpers';
import { getContributions } from '@server/dto';

/**
 * Handles GET request to the /api/fairteiler/contributions route.
 */
export const GET = createApiRoute(async (request) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') ?? '1');
  const limit = parseInt(url.searchParams.get('limit') ?? '20');
  const offset = (page - 1) * limit;

  const contributionsData = await getContributions(request.headers, {
    limit,
    offset,
  });

  return {
    data: contributionsData.data,
    pagination: {
      page,
      limit,
      total: contributionsData.total,
      hasMore: contributionsData.data.length === limit,
    },
  };
});
