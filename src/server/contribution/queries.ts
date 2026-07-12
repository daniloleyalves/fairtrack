'use server';

import { headers } from 'next/headers';
import {
  loadCheckinsWithinTimeframe,
  loadContributions,
  loadContributionVersionHistory,
  loadKeyFigures,
} from './dal';
import { loadAuthenticatedSession } from '../user/dal';
import { NotFoundError, PermissionError } from '../error-handling';
import { AuthError } from '../api-helpers';
import { ANONYMOUS_USER_NAME } from '@/lib/auth/auth-helpers';
import { checkPermissionOnServer } from '@/lib/auth/auth';

export async function getRecentCheckinsWithinLastMinute(
  headers: Headers,
  submitAsUserId?: string,
) {
  const session = await loadAuthenticatedSession(headers);
  let userId = session.user.id;

  if (submitAsUserId && submitAsUserId !== session.user.id) {
    const permissionResult = await checkPermissionOnServer(headers, {
      member: ['create'],
    });
    if (!permissionResult.success) {
      throw new PermissionError(
        'Nur Inhaber:innen dürfen Beiträge im Namen von Zugangsprofilen einsehen.',
      );
    }
    userId = submitAsUserId;
  }

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

export async function getContributions(options?: {
  platformWide?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
  limit?: number;
  offset?: number;
}) {
  const session = await loadAuthenticatedSession(await headers());
  const fairteilerId = session.session.activeOrganizationId;
  if (!fairteilerId) {
    throw new AuthError('No active organization selected.');
  }

  const contributions = await loadContributions({
    fairteilerId: options?.platformWide ? null : fairteilerId,
    dateRange: options?.dateRange,
    limit: options?.limit,
    offset: options?.offset,
  });

  if (contributions.data) {
    const sanitizedData = contributions.data.map((contribution) => {
      if (options?.platformWide) {
        return {
          ...contribution,
          contributorName: null,
          contributorEmail: null,
          contributorImage: null,
        };
      }

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
      data: sanitizedData,
    };
  }

  return contributions;
}

export async function getVersionHistoryByCheckinId(checkinId: string) {
  const session = await loadAuthenticatedSession(await headers());
  const fairteilerId = session.session.activeOrganizationId;
  if (!fairteilerId) {
    throw new AuthError('No active organization selected.');
  }

  const contributionVersionHistory = await loadContributionVersionHistory({
    fairteilerId,
    checkinId,
  });

  return (
    contributionVersionHistory?.map((item) => ({
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
    })) ?? []
  );
}

export async function getKeyFigures() {
  const keyFigureData = await loadKeyFigures();
  return keyFigureData?.map((data) => ({
    activeContributors: data.activeContributors,
    totalContributions: data.totalContributions,
    totalQuantity: parseFloat(data.totalQuantity ?? ''),
  }))[0];
}
