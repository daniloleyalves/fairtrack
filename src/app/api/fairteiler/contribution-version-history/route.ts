import { createApiRoute } from '@server/api-helpers';
import { getVersionHistoryByCheckinId } from '@server/dto';

/**
 * Handles GET request to the /api/fairteiler/contribution-version-history route.
 */
export const GET = createApiRoute(async (request) => {
  const { searchParams } = new URL(request.url);
  const checkinId = searchParams.get('checkinId');

  if (!checkinId) {
    throw Error('checkinId not found');
  }

  const contributionVersionHistory = await getVersionHistoryByCheckinId(
    request.headers,
    checkinId,
  );

  return contributionVersionHistory;
});
