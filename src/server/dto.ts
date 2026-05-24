import 'server-only';
import {
  loadCheckinsWithinTimeframe,
  loadContributions,
  loadContributionVersionHistory,
  loadKeyFigures,
} from './dal';
import { loadAuthenticatedSession } from './user/dal';
import { NotFoundError } from './error-handling';
import { AuthError } from './api-helpers';
import { ANONYMOUS_USER_NAME } from '@/lib/auth/auth-helpers';

/**
 * The DTO (Data Transfer Object) layer is responsible for loading data
 * from the Data Access Layer (DAL) and shaping it for the client.
 * It acts as a boundary, ensuring the client only receives the data it needs.
 */

// CHECKIN SELECTION ----------------------------------------------------------------

export async function getRecentCheckinsWithinLastMinute(
  headers: Headers,
  submitAsUserId?: string,
) {
  const session = await loadAuthenticatedSession(headers);
  const userId = submitAsUserId ?? session.user.id;
  if (!userId) {
    throw new AuthError('No active session');
  }

  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60_000);

  const checkins = await loadCheckinsWithinTimeframe(userId, {
    from: oneMinuteAgo,
    to: now,
  });

  if (!checkins) {
    throw new NotFoundError('recentCheckins');
  }

  return checkins.map((checkin) => ({
    id: checkin.id,
    title: checkin.food.title,
    category: checkin.food.category,
    quantity: checkin.quantity,
  }));
}

// ------ HISTORY -------

/**
 * @param headers The request headers for authentication.
 * @returns The fully formatted contribution data object.
 */
export async function getContributions(
  headers: Headers,
  options?: {
    platformWide?: boolean;
    dateRange?: {
      from: Date;
      to: Date;
    };
    limit?: number;
    offset?: number;
  },
) {
  const session = await loadAuthenticatedSession(headers);
  const fairteilerId = session.session.activeOrganizationId;
  if (!fairteilerId) {
    throw new AuthError('No active organization selected.');
  }

  // 2. load raw data from the DAL
  const contributions = await loadContributions({
    fairteilerId: options?.platformWide ? null : fairteilerId,
    dateRange: options?.dateRange,
    limit: options?.limit,
    offset: options?.offset,
  });

  // 3. Apply anonymization based on user preferences
  if (contributions.data) {
    const anonymizedData = contributions.data.map((contribution) => {
      const isAnonymous = contribution.contributorIsAnonymous ?? false;

      if (isAnonymous) {
        return {
          ...contribution,
          contributorName: ANONYMOUS_USER_NAME,
          contributorEmail: null,
          contributorImage: null,
        };
      }
      return contribution;
    });

    return {
      ...contributions,
      data: anonymizedData,
    };
  }

  return contributions;
}

/**
 * @param headers The request headers for authentication.
 * @returns The fully formatted contributionVersionHistory data object.
 */
export async function getVersionHistoryByCheckinId(
  headers: Headers,
  checkinId: string,
) {
  const session = await loadAuthenticatedSession(headers);
  const fairteilerId = session.session.activeOrganizationId;
  if (!fairteilerId) {
    throw new AuthError('No active organization selected.');
  }

  const contributionVersionHistory = await loadContributionVersionHistory({
    fairteilerId,
    checkinId,
  });

  const formattedContributionVersionHistory = contributionVersionHistory?.map(
    (item) => ({
      id: item.id,
      checkinId: item.checkinId,
      fairteilerId: item.fairteilerId,
      userId: item.userId,
      authorName: item.user.name,
      authorEmail: item.user.email,
      prevValue: item.prevValue,
      newValue: item.newValue,
      field: item.field,
      changeDate: item.createdAt,
    }),
  );

  return formattedContributionVersionHistory;
}

// ----------- USER DTO --------------

export async function getKeyFigures() {
  const keyFigureData = await loadKeyFigures();
  return keyFigureData?.map((data) => ({
    activeContributors: data.activeContributors,
    totalContributions: data.totalContributions,
    totalQuantity: parseFloat(data.totalQuantity ?? ''),
  }))[0];
}
