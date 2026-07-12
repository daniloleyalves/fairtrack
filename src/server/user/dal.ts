import 'server-only';
import { cache } from 'react';
import {
  and,
  asc,
  count,
  countDistinct,
  desc,
  eq,
  gt,
  gte,
  lte,
  sql,
  sum,
} from 'drizzle-orm';
import { DateRange } from 'react-day-picker';
import { attempt } from '@/lib/attempt';
import { auth } from '@/lib/auth/auth';
import { defaultDateRange } from '@/lib/config/site-config';
import { db } from '../db/drizzle';
import {
  account,
  checkin,
  experienceLevels,
  experiencLevelEvents,
  fairteiler,
  milestoneEvents,
  milestones,
  onboardingStepsEvents,
  questBadgeEvents,
  session,
  user,
  userFeedback,
  userPreferences,
  vContributions,
  verification,
} from '../db/schema';
import { AuthError } from '../api-helpers';
import { handleDatabaseError } from '../error-handling';

/**
 * A cached helper to load the authenticated session.
 * Throws an AuthError if the session is not found.
 */
export const loadAuthenticatedSession = cache(
  async (headers: Headers, invalidateCookieCache?: boolean) => {
    const session = await loadSession(headers, invalidateCookieCache);
    if (!session) {
      throw new AuthError();
    }
    return session;
  },
);

export const loadSession = cache(
  async (headers: Headers, invalidateCookieCache = false) => {
    return await auth.api.getSession({
      query: {
        disableCookieCache: invalidateCookieCache,
      },
      headers,
    });
  },
);

export async function updateFirstLogin(userId: string, isFirstLogin: boolean) {
  const [error, data] = await attempt(
    db
      .update(user)
      .set({ isFirstLogin: isFirstLogin })
      .where(eq(user.id, userId))
      .returning(),
  );

  if (error) handleDatabaseError(error, 'updateFairteiler');
  return data;
}

export async function validateResetPasswordToken(token: string) {
  const [error, data] = await attempt(
    db.query.verification.findFirst({
      where: and(
        eq(verification.identifier, `reset-password:${token}`),
        gt(verification.expiresAt, new Date()),
      ),
    }),
  );
  if (error) handleDatabaseError(error, 'validateResetPasswordToken');
  return data;
}

export async function loadUserByEmail(email: string) {
  const [error, data] = await attempt(
    db
      .select({
        id: user.id,
        email: user.email,
        hasPassword: sql<boolean>`${account.password} is not null`,
      })
      .from(user)
      .leftJoin(
        account,
        and(eq(account.userId, user.id), eq(account.providerId, 'credential')),
      )
      .where(eq(user.email, email))
      .limit(1),
  );
  if (error) handleDatabaseError(error, 'loadUserByEmail');
  return data?.[0];
}

export async function updateUserSecureStatus(userId: string, secure: boolean) {
  const [error, data] = await attempt(
    db.update(user).set({ secure }).where(eq(user.id, userId)).returning(),
  );
  if (error) handleDatabaseError(error, 'updateUserSecureStatus');
  return data;
}

/**
 * Server-authority counterpart to better-auth's admin-gated `banUser`
 * endpoint: bans the user and deletes their sessions so an active login
 * is terminated immediately. Callers must authorize the operation
 * themselves (e.g. via an organization-level permission check).
 */
export async function banUserAndRevokeSessions(userId: string, reason: string) {
  const [error] = await attempt(
    Promise.all([
      db
        .update(user)
        .set({ banned: true, banReason: reason })
        .where(eq(user.id, userId)),
      db.delete(session).where(eq(session.userId, userId)),
    ]),
  );
  if (error) handleDatabaseError(error, 'banUserAndRevokeSessions');
}

// ------- USER DASHBOARD DATA ----------

export async function loadUserKeyFigures(
  userId: string,
  dateRange: DateRange = defaultDateRange,
) {
  const [error, data] = await attempt(
    db
      .select({
        totalQuantity: sum(checkin.quantity),
        totalContributions: count(checkin.id),
        activeContributors: countDistinct(checkin.userId),
      })
      .from(checkin)
      .where(
        and(
          eq(checkin.userId, userId),
          dateRange.from ? gte(checkin.createdAt, dateRange.from) : undefined,
          dateRange.to ? lte(checkin.createdAt, dateRange.to) : undefined,
        ),
      ),
  );
  if (error) handleDatabaseError(error, 'loadUserKeyFigures');
  return data;
}

export async function loadUserCategoryDistribution(userId: string) {
  const [error, data] = await attempt(
    db
      .select({
        name: vContributions.categoryName,
        totalQuantity: sum(vContributions.quantity),
      })
      .from(vContributions)
      .where(eq(vContributions.userId, userId))
      .groupBy(vContributions.categoryName)
      .orderBy(desc(sum(vContributions.quantity))),
  );
  if (error) handleDatabaseError(error, 'loadUserCategoryDistribution');
  return data;
}

export async function loadUserOriginDistribution(userId: string) {
  const [error, data] = await attempt(
    db
      .select({
        name: vContributions.originName,
        totalQuantity: sum(vContributions.quantity),
      })
      .from(vContributions)
      .where(eq(vContributions.userId, userId))
      .groupBy(vContributions.originName)
      .orderBy(desc(sum(vContributions.quantity))),
  );
  if (error) handleDatabaseError(error, 'loadUserOriginDistribution');
  return data;
}

export async function loadUserRecentContributions(userId: string, limit = 10) {
  const [error, data] = await attempt(
    db
      .select({
        id: vContributions.checkinId,
        date: vContributions.contributionDate,
        quantity: vContributions.quantity,
        shelfLife: vContributions.shelfLife,
        title: vContributions.foodTitle,
        cool: vContributions.foodCool,
        allergens: vContributions.foodAllergens,
        comment: vContributions.foodComment,
        origin: {
          name: vContributions.originName,
        },
        category: {
          name: vContributions.categoryName,
          image: vContributions.categoryImage,
        },
        company: {
          name: vContributions.companyName,
        },
        fairteiler: {
          name: vContributions.fairteilerName,
        },
      })
      .from(vContributions)
      .where(eq(vContributions.userId, userId))
      .orderBy(desc(vContributions.contributionDate))
      .limit(limit),
  );
  if (error) handleDatabaseError(error, 'loadUserRecentContributions');
  return data;
}

export async function loadUserCalendarData(userId: string) {
  const [error, data] = await attempt(
    db
      .select({
        date: sql<string>`${vContributions.contributionDate}::date`,
        quantity: sum(vContributions.quantity),
      })
      .from(vContributions)
      .where(eq(vContributions.userId, userId))
      .groupBy(sql`${vContributions.contributionDate}::date`)
      .having(sql`${sum(vContributions.quantity)} > 0`),
  );
  if (error) handleDatabaseError(error, 'loadUserCalendarData');
  return data;
}

export async function loadUserContributions({
  fairteilerId,
  userId,
  dateRange,
  limit,
  offset,
}: {
  fairteilerId?: string | null;
  userId?: string;
  dateRange?: { from: Date; to: Date };
  limit?: number;
  offset?: number;
}) {
  const conditions = [];
  if (fairteilerId)
    conditions.push(eq(vContributions.fairteilerId, fairteilerId));
  if (userId) conditions.push(eq(vContributions.userId, userId));
  if (dateRange) {
    conditions.push(gte(vContributions.contributionDate, dateRange.from));
    conditions.push(lte(vContributions.contributionDate, dateRange.to));
  }

  const baseQuery = db
    .select({
      checkinId: vContributions.checkinId,
      contributionDate: vContributions.contributionDate,
      quantity: vContributions.quantity,
      shelfLife: vContributions.shelfLife,
      foodTitle: vContributions.foodTitle,
      foodCompany: vContributions.foodCompany,
      foodCool: vContributions.foodCool,
      foodAllergens: vContributions.foodAllergens,
      foodComment: vContributions.foodComment,
      categoryName: vContributions.categoryName,
      categoryImage: vContributions.categoryImage,
      originName: vContributions.originName,
      companyName: vContributions.companyName,
      contributorId: vContributions.userId,
      contributorName: vContributions.userName,
      contributorEmail: vContributions.userEmail,
      contributorImage: vContributions.userImage,
      contributorIsAnonymous: vContributions.userIsAnonymous,
      fairteilerId: vContributions.fairteilerId,
      fairteilerName: vContributions.fairteilerName,
    })
    .from(vContributions)
    .orderBy(desc(vContributions.contributionDate));

  const queryWithConditions = conditions.length
    ? baseQuery.where(and(...conditions))
    : baseQuery;

  const finalQuery = (() => {
    if (offset != null && limit != null)
      return queryWithConditions.offset(offset).limit(limit);
    if (limit != null) return queryWithConditions.limit(limit);
    return queryWithConditions;
  })();

  const countQuery = db.select({ count: count() }).from(vContributions);
  const countQueryWithConditions = conditions.length
    ? countQuery.where(and(...conditions))
    : countQuery;

  const [error, result] = await attempt(
    Promise.all([finalQuery, countQueryWithConditions]),
  );

  if (error) {
    handleDatabaseError(error, 'loadUserContributions');
  }

  const [contributions, totalResult] = result ?? [[], [{ count: 0 }]];

  return {
    data: contributions,
    total: totalResult[0]?.count ?? 0,
  };
}

/**
 * Load all experience levels ordered by sortIndex
 */
export const loadExperienceLevels = cache(async () => {
  const [error, data] = await attempt(
    db.query.experienceLevels.findMany({
      orderBy: [asc(experienceLevels.sortIndex)],
    }),
  );

  if (error) handleDatabaseError(error, 'loadExperienceLevels');
  return data;
});

/**
 * Load user preferences by user ID
 */
export const loadUserPreferences = cache(async (userId: string) => {
  const [error, data] = await attempt(
    db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    }),
  );

  if (error) handleDatabaseError(error, 'loadUserPreferences');
  return data;
});

/**
 * Add or update user preferences
 */
export const addUserPreferences = async (
  userId: string,
  preferences: {
    enableStreaks?: boolean;
    enableQuests?: boolean;
    enableAIFeedback?: boolean;
    isAnonymous?: boolean;
  },
) => {
  const [error, data] = await attempt(
    db
      .insert(userPreferences)
      .values({
        userId,
        ...preferences,
      })
      .returning(),
  );

  if (error) handleDatabaseError(error, 'addUserPreferences');
  return data?.[0];
};

/**
 * Update user preferences (for when you know the record exists)
 */
export const updateUserPreferences = async (
  userId: string,
  preferences: {
    formTableView?: 'fast' | 'wizard';
    enableStreaks?: boolean;
    enableQuests?: boolean;
    enableAIFeedback?: boolean;
  },
) => {
  const [error, data] = await attempt(
    db
      .insert(userPreferences)
      .values({ userId, ...preferences })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: preferences,
      })
      .returning(),
  );

  if (error) handleDatabaseError(error, 'updateUserPreferences');
  return data?.[0];
};

/**
 * Submit user feedback
 */
export const submitUserFeedback = async (
  userId: string,
  fairteilerId: string | null,
  category: 'bug' | 'feature' | 'improvement' | 'general',
  message: string,
) => {
  const [error, data] = await attempt(
    db
      .insert(userFeedback)
      .values({
        userId,
        fairteilerId,
        category,
        message,
      })
      .returning(),
  );

  if (error) handleDatabaseError(error, 'submitUserFeedback');
  return data?.[0];
};

/**
 * Submit user feedback and return with user and fairteiler details for email
 */
export const submitUserFeedbackWithDetails = async (
  userId: string,
  fairteilerId: string | null,
  category: 'bug' | 'feature' | 'improvement' | 'general',
  message: string,
) => {
  const feedback = await submitUserFeedback(
    userId,
    fairteilerId,
    category,
    message,
  );

  if (!feedback) {
    return null;
  }

  const [error, details] = await attempt(
    db
      .select({
        feedbackId: userFeedback.id,
        category: userFeedback.category,
        message: userFeedback.message,
        createdAt: userFeedback.createdAt,
        userName: user.name,
        userEmail: user.email,
        fairteilerName: fairteiler.name,
      })
      .from(userFeedback)
      .innerJoin(user, eq(userFeedback.userId, user.id))
      .leftJoin(fairteiler, eq(userFeedback.fairteilerId, fairteiler.id))
      .where(eq(userFeedback.id, feedback.id))
      .limit(1),
  );

  if (error) handleDatabaseError(error, 'submitUserFeedbackWithDetails');
  return details?.[0];
};

// GAMIFICATION QUERIES ----------------

export const loadUserAllTimeWeeklyContributions = async (userId: string) => {
  const [error, data] = await attempt(
    db
      .select({
        week: sql<string>`DATE_TRUNC('week', contribution_date)`.as('week'),
        weekStart: sql<string>`DATE_TRUNC('week', contribution_date)::date`.as(
          'week_start',
        ),
        totalQuantity: sql<number>`SUM(quantity)`.as('total_quantity'),
        contributionCount: sql<number>`COUNT(*)`.as('contribution_count'),
        uniqueDays: sql<number>`COUNT(DISTINCT DATE(contribution_date))`.as(
          'unique_days',
        ),
        fairteilerCount: sql<number>`COUNT(DISTINCT fairteiler_id)`.as(
          'fairteiler_count',
        ),
        categoryCount: sql<number>`COUNT(DISTINCT category_name)`.as(
          'category_count',
        ),
      })
      .from(vContributions)
      .where(eq(vContributions.userId, userId))
      .groupBy(sql`DATE_TRUNC('week', contribution_date)`)
      .orderBy(sql`DATE_TRUNC('week', contribution_date) ASC`),
  );

  if (error) handleDatabaseError(error, 'loadUserAllTimeWeeklyContributions');
  return data;
};

/**
 * Add experience level event
 */
export const addExperienceLevelEvent = async (
  levelId: string,
  userId: string,
) => {
  const [error, data] = await attempt(
    db
      .insert(experiencLevelEvents)
      .values({
        levelId,
        userId,
      })
      .returning(),
  );

  if (error) handleDatabaseError(error, 'addExperienceLevelEvent');
  return data?.[0];
};

/**
 * Add quest badge event
 */
export const addQuestBadgeEvent = async (questId: string, userId: string) => {
  const [error, data] = await attempt(
    db
      .insert(questBadgeEvents)
      .values({
        questId,
        userId,
      })
      .returning(),
  );

  if (error) handleDatabaseError(error, 'addQuestBadgeEvent');
  return data;
};

/**
 * Load milestones and milestone events for a user
 */
export async function loadMilestonesByUser(userId: string) {
  const [milestoneError, milestoneData] = await attempt(
    db.select().from(milestones),
  );
  if (milestoneError) {
    handleDatabaseError(milestoneError, 'loadMilestonesByUser');
  }

  const [milestoneEventError, milestoneEventData] = await attempt(
    db.select().from(milestoneEvents).where(eq(milestoneEvents.userId, userId)),
  );
  if (milestoneEventError) {
    handleDatabaseError(milestoneEventError, 'loadMilestoneEventsByUser');
  }

  return {
    milestones: milestoneData,
    milestoneEvents: milestoneEventData,
  };
}

/**
 * Add milestone event
 */
export const addMilestoneEvent = async (
  milestoneId: string,
  userId: string,
) => {
  const [error, data] = await attempt(
    db
      .insert(milestoneEvents)
      .values({
        milestoneId,
        userId,
      })
      .returning(),
  );

  if (error) handleDatabaseError(error, 'addMilestoneEvent');
  return data;
};

/**
 * Add onboarding step event
 */
export const addOnboardingStepEvent = async (
  onboardingStepId: string,
  userId: string,
) => {
  const [error, data] = await attempt(
    db
      .insert(onboardingStepsEvents)
      .values({
        onboardingStepId,
        userId,
      })
      .returning(),
  );

  if (error) handleDatabaseError(error, 'addOnboardingStepEvent');
  return data;
};
