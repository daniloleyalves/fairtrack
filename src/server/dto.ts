import 'server-only';
import {
  loadCalendarData,
  loadCategoryDistribution,
  loadContributions,
  loadContributionVersionHistory,
  loadKeyFigures,
  loadLeaderboard,
  loadOriginDistribution,
  loadRecentContributions,
  loadUserCalendarData,
  loadUserCategoryDistribution,
  loadUserKeyFigures,
  loadUserOriginDistribution,
  loadUserRecentContributions,
  loadAuthenticatedSession,
  loadCheckinsWithinTimeframe,
  loadActiveMembership,
  loadActiveOrganization,
  loadCategories,
  loadCompanies,
  loadExperienceLevels,
  loadFairteilerBySlug,
  loadFairteilerCategories,
  loadFairteilerCompanies,
  loadFairteilerOrigins,
  loadFairteilers,
  loadOrigins,
  loadStepFlowProgress,
  loadTagsByFairteiler,
  loadUserPreferences,
  loadFairteilerTutorialWithSteps,
  loadUserAllTimeWeeklyContributions,
  loadMilestonesByUser,
  addMilestoneEvent,
  loadSession,
} from './dal';
import { MemberRoles } from '@/lib/auth/auth-permissions';
import {
  ExperienceLevel,
  Fairteiler,
  FairteilerWithMembers,
  GenericItem,
  StepFlowProgress,
  UserPreferences,
} from './db/db-types';
import { NotFoundError } from './error-handling';
import { AuthError } from './api-helpers';
import { GamificationElement } from '@/features/user/onboarding/onboarding-flow-types';
import { gamificationElements } from '@/features/user/gamification/gamification-config';
import { calculateUserAllTimeStreaks } from '@/features/user/gamification/streaks/streak-processor';
import { transformMilestoneData } from '@/features/user/gamification/milestones/milestone-utils';
import { ANONYMOUS_USER_NAME } from '@/lib/auth/auth-helpers';

/**
 * The DTO (Data Transfer Object) layer is responsible for loading data
 * from the Data Access Layer (DAL) and shaping it for the client.
 * It acts as a boundary, ensuring the client only receives the data it needs.
 */

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

export async function getFairteilers() {
  const fairteilers = await loadFairteilers();

  if (!fairteilers) {
    throw new NotFoundError('fairteilers');
  }

  return fairteilers.map((fairteiler) => ({
    id: fairteiler.id,
    name: fairteiler.name,
    thumbnail: fairteiler.thumbnail,
    address: fairteiler.address,
    website: fairteiler.website,
    geoLink: fairteiler.geoLink,
    geoLat: fairteiler.geoLat,
    geoLng: fairteiler.geoLng,
    disabled: fairteiler.disabled,
    tags: fairteiler.tags,
    slug: fairteiler.slug,
  })) satisfies Fairteiler[];
}

export async function getTags(headers: Headers) {
  const session = await loadAuthenticatedSession(headers);
  const fairteilerId = session.session.activeOrganizationId;
  if (!fairteilerId) {
    throw new AuthError('No active organization selected.');
  }

  const tags = await loadTagsByFairteiler(fairteilerId);
  return tags;
}

export async function getActiveFairteiler(headers: Headers) {
  const fairteiler = await loadActiveOrganization(headers);
  if (!fairteiler) {
    throw new NotFoundError('active fairteiler');
  }

  return {
    id: fairteiler.id,
    name: fairteiler.name,
    thumbnail: fairteiler.thumbnail,
    address: fairteiler.address,
    website: fairteiler.website,
    geoLink: fairteiler.geoLink,
    geoLat: fairteiler.geoLat,
    geoLng: fairteiler.geoLng,
    disabled: fairteiler.disabled,
    tags: fairteiler.tags,
    slug: fairteiler.slug,
    members: fairteiler.members.map((member) => ({
      id: member.id,
      user: {
        id: member.user.id,
        name: member.user.name,
        firstName: member.user.firstName,
        lastName: member.user.lastName,
        email: member.user.email,
        avatar: member.user.image,
        isFirstLogin: member.user.isFirstLogin,
        isAnonymous: member.user.isAnonymous,
      },
      role: member.role,
      fairteilerId: member.organizationId,
    })),
  } satisfies FairteilerWithMembers;
}

export async function getFairteilerBySlug(fairteilerSlug: string) {
  const fairteilerData = await loadFairteilerBySlug(fairteilerSlug);

  if (!fairteilerData) {
    throw new NotFoundError('could not load fairteilerData for contribution');
  }

  const [originsData, categoriesData, companiesData, tutorialData] =
    await Promise.all([
      loadFairteilerOrigins(fairteilerData.id),
      loadFairteilerCategories(fairteilerData.id),
      loadFairteilerCompanies(fairteilerData.id),
      loadFairteilerTutorialWithSteps(fairteilerData.id),
    ]);

  return {
    fairteiler: fairteilerData,
    origins: originsData?.map((item) => item.origin) ?? [],
    categories: categoriesData?.map((item) => item.category) ?? [],
    companies: companiesData?.map((item) => item.company) ?? [],
    tutorial: tutorialData ?? undefined,
  };
}

export async function getActiveMembership(headers: Headers) {
  const membership = await loadActiveMembership(headers);
  if (!membership) {
    throw new NotFoundError('membership');
  }

  return {
    user: {
      id: membership.user.id,
      email: membership.user.email,
      name: membership.user.name,
      avatar: membership.user.image,
    },
    fairteilerId: membership.organizationId,
    role: membership.role as MemberRoles,
  };
}

// ORIGIN SELECTION ---------------------------------------------------------------

export async function getOrigins(): Promise<GenericItem[]> {
  const origins = await loadOrigins();
  if (!origins) {
    throw new NotFoundError('origins');
  }

  return origins.map((origin) => ({
    id: origin.id,
    name: origin.name,
    status: origin.status,
  }));
}

export async function getOriginsByFairteiler(
  headers: Headers,
): Promise<GenericItem[]> {
  const session = await loadAuthenticatedSession(headers);
  const fairteilerId = session.session.activeOrganizationId;
  if (!fairteilerId) {
    throw new AuthError('No active organization');
  }
  const fairteilerOrigins = await loadFairteilerOrigins(fairteilerId);
  if (!fairteilerOrigins) {
    throw new NotFoundError('originsByFairteiler');
  }

  return fairteilerOrigins
    .filter((mapping) => mapping.origin && mapping.origin.status === 'active')
    .map((mapping) => mapping.origin as GenericItem);
}

// CATEGORY SELECTION ----------------------------------------------------------------

export async function getCategories(): Promise<GenericItem[]> {
  const categories = await loadCategories();
  if (!categories) {
    throw new NotFoundError('categories');
  }

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    status: category.status,
  }));
}

export async function getCategoriesByFairteiler(
  headers: Headers,
): Promise<GenericItem[]> {
  const session = await loadAuthenticatedSession(headers);
  const fairteilerId = session.session.activeOrganizationId;
  if (!fairteilerId) {
    throw new AuthError('No active organization');
  }
  const fairteilerCategories = await loadFairteilerCategories(fairteilerId);
  if (!fairteilerCategories) {
    throw new NotFoundError('categoriesByFairteiler');
  }

  return fairteilerCategories
    .filter(
      (mapping) => mapping.category && mapping.category.status === 'active',
    )
    .map((mapping) => mapping.category as GenericItem);
}

// COMPANY SELECTION ----------------------------------------------------------------

export async function getCompanies(): Promise<GenericItem[]> {
  const companies = await loadCompanies();
  if (!companies) {
    throw new NotFoundError('companies');
  }

  return companies.map((company) => ({
    id: company.id,
    name: company.name,
    status: company.status,
  }));
}

export async function getCompaniesByFairteiler(
  headers: Headers,
): Promise<GenericItem[]> {
  const session = await loadAuthenticatedSession(headers);
  const fairteilerId = session.session.activeOrganizationId;
  if (!fairteilerId) {
    throw new AuthError('No active organization');
  }
  const fairteilerCompanies = await loadFairteilerCompanies(fairteilerId);
  if (!fairteilerCompanies) {
    throw new NotFoundError('companiesByFairteiler');
  }

  return fairteilerCompanies
    .filter((mapping) => mapping.company && mapping.company.status === 'active')
    .map((mapping) => mapping.company as GenericItem);
}

// CHECKIN SELECTION ----------------------------------------------------------------

export async function getRecentCheckinsWithinLastMinute(headers: Headers) {
  const session = await loadAuthenticatedSession(headers);
  const userId = session.user.id;
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

// ------ DASHBOARD -------

/**
 * Orchestrates loading and transforming all data required for the fairteiler dashboard.
 * @param headers The request headers for authentication.
 * @returns The fully formatted dashboard data object.
 */
export async function getFairteilerDashboardData(headers: Headers) {
  const session = await loadAuthenticatedSession(headers);
  const fairteilerId = session.session.activeOrganizationId;
  if (!fairteilerId) {
    throw new AuthError('No active organization selected.');
  }

  const [
    keyFigures,
    categoryDistribution,
    originDistribution,
    leaderboard,
    recentContributions,
    calendarData,
  ] = await Promise.all([
    loadKeyFigures(fairteilerId),
    loadCategoryDistribution(fairteilerId),
    loadOriginDistribution(fairteilerId),
    loadLeaderboard(fairteilerId),
    loadRecentContributions(fairteilerId),
    loadCalendarData(fairteilerId),
  ]);

  // 3. Transform raw data into the required DTO format
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

  const formattedLeaderboardEntries =
    leaderboard?.map((e) => {
      const isAnonymous = e.userIsAnonymous ?? false;

      return {
        id: e.userId,
        name: isAnonymous ? ANONYMOUS_USER_NAME : (e.userName ?? 'N/A'),
        email: isAnonymous ? null : e.email,
        image: isAnonymous ? null : (e.userImage ?? null),
        totalQuantity: parseFloat(e.totalQuantity?.toString() ?? '0'),
      };
    }) ?? [];

  const formattedCalendarData = calendarData?.map((d) => ({
    value: d.date,
    quantity: parseFloat(d.quantity?.toString() ?? '0'),
  }));

  // 4. Assemble and return the final object
  return {
    keyFigures: formattedKeyFigures,
    categoryDistribution: formattedCategoryDistribution,
    originDistribution: formattedOriginDistribution,
    leaderboardEntries: formattedLeaderboardEntries,
    recentContributions: recentContributions,
    calendarData: formattedCalendarData,
  };
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

// ----------- FAIRTEILER TUTORIAL DTO --------------

export async function getFairteilerTutorialWithSteps(
  headers: Headers,
  fairteilerId?: string,
) {
  let fairteilerIdentifier;

  if (fairteilerId) {
    fairteilerIdentifier = fairteilerId;
  } else {
    const session = await loadAuthenticatedSession(headers);
    fairteilerIdentifier = session.session.activeOrganizationId;
  }

  if (!fairteilerIdentifier) {
    throw new AuthError('No active organization.');
  }

  const fairteilerTutorialWithSteps =
    await loadFairteilerTutorialWithSteps(fairteilerIdentifier);

  return fairteilerTutorialWithSteps;
}

// ----------- USER DTO --------------

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

  // 3. Transform raw data into the required DTO format
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

  // 4. Assemble and return the final object
  return {
    keyFigures: formattedKeyFigures,
    categoryDistribution: formattedCategoryDistribution,
    originDistribution: formattedOriginDistribution,
    recentContributions: recentContributions,
    calendarData: formattedCalendarData,
    milestoneData: transformedMilestoneData,
  };
}

// ONBOARDING DATA TRANSFER OBJECTS

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
  // Get authenticated user session
  const session = await loadAuthenticatedSession(headers);
  const userId = session.user.id;
  if (!userId) {
    throw new AuthError('No active session.');
  }

  // Load all data concurrently
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

// USER SETTINGS DATA TRANSFER OBJECTS

/**
 * Get all data needed for user onboarding
 */
export async function getUserPreferences(
  headers: Headers,
): Promise<UserPreferences | null | undefined> {
  // Get authenticated user session
  const session = await loadAuthenticatedSession(headers);
  const userId = session.user.id;
  if (!userId) {
    throw new AuthError('No active session.');
  }

  // Load all data concurrently
  const userPreferences = loadUserPreferences(userId);

  if (!userPreferences) {
    throw new NotFoundError(
      'ExperienceLevels, userPreferences or stepFlowProgress not found',
    );
  }

  return userPreferences;
}

/**
 * Get contribution tutorial progress for the authenticated user
 */
export async function getContributionTutorialProgress(
  headers: Headers,
  fairteilerId: string,
): Promise<StepFlowProgress | null | undefined> {
  // Get authenticated user session
  const session = await loadAuthenticatedSession(headers);
  const userId = session.user.id;

  if (!userId) {
    throw new AuthError('No active session.');
  }

  const flowId = `contribution-tutorial-${fairteilerId}`;

  // Load step flow progress for contribution tutorial
  const stepFlowProgress = await loadStepFlowProgress(userId, flowId);

  return stepFlowProgress;
}

// GAMIFICATION DTO ---------------
export async function getUserStreak(headers: Headers) {
  // Get authenticated user session
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
  // Get authenticated user session
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
  // Get authenticated user session
  const session = await loadAuthenticatedSession(headers);
  const userId = session.user.id;

  if (!userId) {
    throw new AuthError('No active session.');
  }

  // Fetch all required data in parallel
  const { milestones, milestoneEvents } = await loadMilestonesByUser(userId);

  if (!milestones || !milestoneEvents) {
    throw new NotFoundError('Keine Meilensteine gefunden');
  }

  const keyFigureData = await loadUserKeyFigures(userId);
  if (keyFigureData?.[0]?.totalContributions == null) {
    throw new NotFoundError('Uservortschritt konnte nicht ermittelt werden');
  }

  // Create a set of achieved milestone IDs for fast lookup
  const achievedMilestoneIds = new Set(
    milestoneEvents.map((event) => event.milestoneId),
  );

  // Sort milestones by quantity to find all unachieved milestones in order
  const sortedMilestones = [...milestones].sort(
    (a, b) => a.quantity - b.quantity,
  );

  // Find ALL unachieved milestones that the user has reached
  const newlyAchievedMilestones = sortedMilestones.filter(
    (milestone) =>
      !achievedMilestoneIds.has(milestone.id) &&
      keyFigureData[0].totalContributions >= milestone.quantity,
  );

  // If any new milestones are achieved, record them all
  if (newlyAchievedMilestones.length > 0) {
    // Record all newly achieved milestones
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

export async function getKeyFigures() {
  const keyFigureData = await loadKeyFigures();
  return keyFigureData?.map((data) => ({
    activeContributors: data.activeContributors,
    totalContributions: data.totalContributions,
    totalQuantity: parseFloat(data.totalQuantity ?? ''),
  }))[0];
}
