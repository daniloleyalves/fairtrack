import 'server-only';
import {
  addMilestoneEvent,
  loadAuthenticatedSession,
  loadExperienceLevels,
  loadMilestonesByUser,
  loadSession,
  loadUserAllTimeWeeklyContributions,
  loadUserCalendarData,
  loadUserCategoryDistribution,
  loadUserContributions,
  loadUserKeyFigures,
  loadUserOriginDistribution,
  loadUserPreferences,
  loadUserRecentContributions,
} from './dal';
import { loadStepFlowProgress } from '../tutorial/dal';
import { AuthError } from '../api-helpers';
import { NotFoundError } from '../error-handling';
import {
  ExperienceLevel,
  StepFlowProgress,
  UserPreferences,
} from '../db/db-types';
import { transformMilestoneData } from '@/features/user/gamification/milestones/milestone-utils';
import { calculateUserAllTimeStreaks } from '@/features/user/gamification/streaks/streak-processor';
import { gamificationElements } from '@/features/user/gamification/gamification-config';
import { GamificationElement } from '@/features/user/onboarding/onboarding-flow-types';
import { ANONYMOUS_USER_NAME } from '@/lib/auth/auth-helpers';

export async function getSession(
  headers: Headers,
  invalidateCookieCache?: boolean,
) {
  const result = await loadSession(headers, invalidateCookieCache);
  if (!result) return null;

  return {
    session: {
      activeOrganizationId: result.session.activeOrganizationId,
      userId: result.session.userId,
    },
    user: {
      id: result.user.id,
      name: result.user.name,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      email: result.user.email,
      avatar: result.user.image,
      isFirstLogin: result.user.isFirstLogin,
      isAnonymous: result.user.isAnonymous,
    },
  };
}

export async function getLatestContributions(headers: Headers, limit?: number) {
  const session = await loadAuthenticatedSession(headers);
  const userId = session.user.id;
  if (!userId) {
    throw new AuthError('No active session');
  }

  const contributions = await loadUserRecentContributions(userId, limit);

  if (!contributions) {
    throw new NotFoundError('latestCheckins');
  }

  return contributions;
}

export async function getUserContributions(
  headers: Headers,
  options?: {
    dateRange?: {
      from: Date;
      to: Date;
    };
    limit?: number;
    offset?: number;
  },
) {
  const session = await loadAuthenticatedSession(headers);
  const userId = session.user.id;

  const contributions = await loadUserContributions({
    userId,
    dateRange: options?.dateRange,
    limit: options?.limit,
    offset: options?.offset,
  });

  if (contributions.data) {
    const anonymizedData = contributions.data.map((contribution) => {
      const isAnonymous = contribution.contributorIsAnonymous ?? false;
      const isOwnContribution = contribution.contributorId === userId;

      if (isOwnContribution || !isAnonymous) {
        return contribution;
      }

      return {
        ...contribution,
        contributorName: ANONYMOUS_USER_NAME,
        contributorEmail: null,
        contributorImage: null,
      };
    });

    return {
      ...contributions,
      data: anonymizedData,
    };
  }

  return contributions;
}

/**
 * Orchestrates loading and transforming all data required for the user dashboard.
 * @param headers The request headers for authentication.
 * @returns The fully formatted dashboard data object.
 */
export async function getUserDashboardData(headers: Headers) {
  const session = await loadAuthenticatedSession(headers);
  const userId = session.user.id;
  if (!userId) {
    throw new AuthError('No active session.');
  }

  const [
    keyFigures,
    categoryDistribution,
    originDistribution,
    recentContributions,
    calendarData,
    milestoneData,
  ] = await Promise.all([
    loadUserKeyFigures(userId),
    loadUserCategoryDistribution(userId),
    loadUserOriginDistribution(userId),
    loadUserRecentContributions(userId),
    loadUserCalendarData(userId),
    loadMilestonesByUser(userId),
  ]);

  const formattedKeyFigures = [
    {
      value: parseFloat(keyFigures?.[0].totalQuantity ?? '0'),
      description: 'gerettet',
      color: 'primary',
      unit: 'kg',
    },
    {
      value: keyFigures?.[0].totalContributions ?? 0,
      description: 'Abgaben',
      color: 'default',
    },
  ];

  const formattedCategoryDistribution = {
    name: 'Kategorien',
    data: categoryDistribution?.map((item, index) => ({
      position: index + 1,
      value: parseFloat(item.totalQuantity?.toString() ?? '0'),
      description: item.name ?? 'Unkategorisiert',
    })),
  };

  const formattedOriginDistribution = {
    name: 'Herkunft',
    data: originDistribution?.map((item, index) => ({
      position: index + 1,
      value: parseFloat(item.totalQuantity?.toString() ?? '0'),
      description: item.name ?? 'Unbekannt',
    })),
  };

  const formattedCalendarData = calendarData?.map((d) => ({
    value: d.date,
    quantity: parseFloat(d.quantity?.toString() ?? '0'),
  }));

  const transformedMilestoneData = transformMilestoneData(milestoneData);

  return {
    keyFigures: formattedKeyFigures,
    categoryDistribution: formattedCategoryDistribution,
    originDistribution: formattedOriginDistribution,
    recentContributions: recentContributions,
    calendarData: formattedCalendarData,
    milestoneData: transformedMilestoneData,
  };
}

export interface OnboardingData {
  user: {
    id: string;
    isFirstLogin: boolean;
  };
  experienceLevels: ExperienceLevel[];
  gamificationElements: GamificationElement[];
  userPreferences: UserPreferences | null | undefined;
  stepFlowProgress: StepFlowProgress | null | undefined;
}

/**
 * Get all data needed for user onboarding
 */
export async function getOnboardingData(
  headers: Headers,
): Promise<OnboardingData> {
  const session = await loadAuthenticatedSession(headers);
  const userId = session.user.id;
  if (!userId) {
    throw new AuthError('No active session.');
  }

  const [experienceLevels, userPreferences, stepFlowProgress] =
    await Promise.all([
      loadExperienceLevels(),
      loadUserPreferences(userId),
      loadStepFlowProgress(userId, 'onboarding'),
    ]);

  if (!experienceLevels) {
    throw new NotFoundError(
      'ExperienceLevels, userPreferences or stepFlowProgress not found',
    );
  }

  return {
    user: {
      id: userId,
      isFirstLogin: session.user.isFirstLogin ?? true,
    },
    experienceLevels: experienceLevels,
    gamificationElements: gamificationElements,
    userPreferences: userPreferences,
    stepFlowProgress: stepFlowProgress,
  };
}

/**
 * Get user preferences for the authenticated user
 */
export async function getUserPreferences(
  headers: Headers,
): Promise<UserPreferences | null | undefined> {
  const session = await loadAuthenticatedSession(headers);
  const userId = session.user.id;
  if (!userId) {
    throw new AuthError('No active session.');
  }

  const userPreferences = loadUserPreferences(userId);

  if (!userPreferences) {
    throw new NotFoundError(
      'ExperienceLevels, userPreferences or stepFlowProgress not found',
    );
  }

  return userPreferences;
}

export async function getUserStreak(headers: Headers) {
  const session = await loadAuthenticatedSession(headers);
  const userId = session.user.id;

  if (!userId) {
    throw new AuthError('No active session.');
  }

  const allTimeWeeklyContributions =
    await loadUserAllTimeWeeklyContributions(userId);

  if (!allTimeWeeklyContributions) {
    throw new NotFoundError('weekly contributions not found');
  }

  const userStreak = calculateUserAllTimeStreaks(allTimeWeeklyContributions);

  return userStreak;
}

export async function getMilestoneData(headers: Headers) {
  const session = await loadAuthenticatedSession(headers);
  const userId = session.user.id;

  if (!userId) {
    throw new AuthError('No active session.');
  }

  const milestoneData = await loadMilestonesByUser(userId);

  return milestoneData;
}

/**
 * Check milestone achievement for the current user
 * Contains all business logic for determining and recording achievements
 */
export async function checkMilestoneProgressForCurrentUser(headers: Headers) {
  const session = await loadAuthenticatedSession(headers);
  const userId = session.user.id;

  if (!userId) {
    throw new AuthError('No active session.');
  }

  const { milestones, milestoneEvents } = await loadMilestonesByUser(userId);

  if (!milestones || !milestoneEvents) {
    throw new NotFoundError('Keine Meilensteine gefunden');
  }

  const keyFigureData = await loadUserKeyFigures(userId);
  if (keyFigureData?.[0]?.totalContributions == null) {
    throw new NotFoundError('Uservortschritt konnte nicht ermittelt werden');
  }

  const achievedMilestoneIds = new Set(
    milestoneEvents.map((event) => event.milestoneId),
  );

  const sortedMilestones = [...milestones].sort(
    (a, b) => a.quantity - b.quantity,
  );

  const newlyAchievedMilestones = sortedMilestones.filter(
    (milestone) =>
      !achievedMilestoneIds.has(milestone.id) &&
      keyFigureData[0].totalContributions >= milestone.quantity,
  );

  if (newlyAchievedMilestones.length > 0) {
    const achievedMilestones = await Promise.all(
      newlyAchievedMilestones.map(async (milestone) => {
        const achievedAt = await addMilestoneEvent(milestone.id, userId);
        return {
          id: milestone.id,
          quantity: milestone.quantity,
          achievedAt,
        };
      }),
    );

    return {
      achieved: true,
      milestones: achievedMilestones,
    };
  }

  return { achieved: false };
}
