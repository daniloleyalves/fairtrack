import 'server-only';
import {
  and,
  count,
  countDistinct,
  desc,
  eq,
  gte,
  lte,
  sql,
  sum,
} from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import { DateRange } from 'react-day-picker';
import { attempt } from '@/lib/attempt';
import { defaultDateRange } from '@/lib/config/site-config';
import type { ContributionItem } from '@features/contribution/models/contribution';
import { db } from '../db/drizzle';
import {
  checkin,
  contributionVersionHistory,
  fairteiler,
  food,
  invitation,
  user,
  vContributions,
} from '../db/schema';
import {
  handleDatabaseError,
  NotFoundError,
  ValidationError,
} from '../error-handling';

/**
 * IMPORTANT: This function is NOT ATOMIC. It performs multiple database
 * inserts sequentially. If an error occurs after the first insert but
 * before the last (e.g., the `checkin` insert fails after the `food`
 * insert succeeds), the database will be in an inconsistent state
 * (an orphaned `food` record without a corresponding `checkin`).
 *
 * The ideal solution is to wrap these operations in a database transaction
 * (`db.transaction(...)`). Since that is not available in the current
 * setup, be aware of this potential data integrity issue.
 */
export async function checkinContribution(
  fairteilerId: string,
  userId: string,
  payload: ContributionItem[],
) {
  const insertedFoods = [];

  try {
    for (const c of payload) {
      const [newFood] = await db
        .insert(food)
        .values({
          id: c.foodId,
          title: c.title,
          originId: c.originId,
          categoryId: c.categoryId,
          companyId: c.companyId,
          company: c.company,
          cool: false,
          allergens: c.allergens,
          comment: c.comment,
        })
        .returning();

      await db.insert(checkin).values({
        id: c.id,
        userId: userId,
        foodId: c.foodId,
        fairteilerId: fairteilerId,
        quantity: c.quantity,
      });

      insertedFoods.push(newFood);
    }
    return insertedFoods;
  } catch (e) {
    handleDatabaseError(e, 'checkinContribution');
  }
}

export async function loadCheckinsWithinTimeframe(
  userId: string,
  options: { from: Date; to: Date },
) {
  const [error, data] = await attempt(
    db.query.checkin.findMany({
      where: and(
        gte(checkin.createdAt, options.from),
        lte(checkin.createdAt, options.to),
        eq(checkin.userId, userId),
      ),
      orderBy: [desc(checkin.createdAt)],
      with: { food: { with: { category: true } } },
    }),
  );

  if (error) handleDatabaseError(error, 'loadCheckinsWithinTimeframe');
  return data;
}

export async function loadKeyFigures(
  fairteilerId?: string,
  dateRange: DateRange = defaultDateRange,
) {
  const conditions = [];
  if (fairteilerId) {
    conditions.push(eq(checkin.fairteilerId, fairteilerId));
  }

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
          ...conditions,
          dateRange.from ? gte(checkin.createdAt, dateRange.from) : undefined,
          dateRange.to ? lte(checkin.createdAt, dateRange.to) : undefined,
        ),
      ),
  );
  if (error) handleDatabaseError(error, 'loadKeyFigures');
  return data;
}

export const PUBLIC_TOTAL_QUANTITY_TAG = 'public-total-quantity';

export async function loadPublicTotalQuantity() {
  'use cache';
  cacheLife('minutes');
  cacheTag(PUBLIC_TOTAL_QUANTITY_TAG);

  const [error, data] = await attempt(
    db.select({ totalQuantity: sum(checkin.quantity) }).from(checkin),
  );
  if (error) handleDatabaseError(error, 'loadPublicTotalQuantity');
  return data?.[0]?.totalQuantity ?? null;
}

export async function loadCategoryDistribution(fairteilerId?: string) {
  const query = db
    .select({
      name: vContributions.categoryName,
      totalQuantity: sum(vContributions.quantity),
    })
    .from(vContributions)
    .groupBy(vContributions.categoryName)
    .orderBy(desc(sum(vContributions.quantity)));

  const [error, data] = await attempt(
    fairteilerId
      ? query.where(eq(vContributions.fairteilerId, fairteilerId))
      : query,
  );
  if (error) handleDatabaseError(error, 'loadCategoryDistribution');
  return data;
}

export async function loadQuantityByFairteiler() {
  const [error, data] = await attempt(
    db
      .select({
        fairteilerId: checkin.fairteilerId,
        totalQuantity: sum(checkin.quantity),
      })
      .from(checkin)
      .groupBy(checkin.fairteilerId),
  );
  if (error) handleDatabaseError(error, 'loadQuantityByFairteiler');
  return data;
}

export async function loadOriginDistribution(fairteilerId?: string) {
  const query = db
    .select({
      name: vContributions.originName,
      totalQuantity: sum(vContributions.quantity),
    })
    .from(vContributions)
    .groupBy(vContributions.originName)
    .orderBy(desc(sum(vContributions.quantity)));

  const [error, data] = await attempt(
    fairteilerId
      ? query.where(eq(vContributions.fairteilerId, fairteilerId))
      : query,
  );
  if (error) handleDatabaseError(error, 'loadOriginDistribution');
  return data;
}

export async function loadLeaderboard(fairteilerId: string) {
  const [error, data] = await attempt(
    db
      .select({
        userId: vContributions.userId,
        email: vContributions.userEmail,
        userName: vContributions.userName,
        userImage: vContributions.userImage,
        userIsAnonymous: vContributions.userIsAnonymous,
        totalQuantity: sum(vContributions.quantity),
      })
      .from(vContributions)
      .where(eq(vContributions.fairteilerId, fairteilerId))
      .groupBy(
        vContributions.userId,
        vContributions.userEmail,
        vContributions.userName,
        vContributions.userImage,
        vContributions.userIsAnonymous,
      )
      .orderBy(desc(sum(vContributions.quantity))),
  );
  if (error) handleDatabaseError(error, 'loadLeaderboard');
  return data;
}

export async function loadRecentContributions(fairteilerId: string) {
  const [error, data] = await attempt(
    db
      .select({
        id: vContributions.checkinId,
        date: vContributions.contributionDate,
        title: vContributions.foodTitle,
        quantity: vContributions.quantity,
        category: {
          name: vContributions.categoryName,
          image: vContributions.categoryImage,
        },
      })
      .from(vContributions)
      .where(eq(vContributions.fairteilerId, fairteilerId))
      .orderBy(desc(vContributions.contributionDate))
      .limit(10),
  );
  if (error) handleDatabaseError(error, 'loadRecentContributions');
  return data;
}

export async function loadCalendarData(fairteilerId: string) {
  const [error, data] = await attempt(
    db
      .select({
        date: sql<string>`${vContributions.contributionDate}::date`,
        quantity: sum(vContributions.quantity),
      })
      .from(vContributions)
      .where(eq(vContributions.fairteilerId, fairteilerId))
      .groupBy(sql`${vContributions.contributionDate}::date`)
      .having(sql`${sum(vContributions.quantity)} > 0`),
  );
  if (error) handleDatabaseError(error, 'loadCalendarData');
  return data;
}

export async function loadContributions({
  fairteilerId,
  dateRange,
  limit,
  offset,
}: {
  fairteilerId?: string | null;
  dateRange?: { from: Date; to: Date };
  limit?: number;
  offset?: number;
}) {
  const conditions = [];
  if (fairteilerId) {
    conditions.push(eq(vContributions.fairteilerId, fairteilerId));
  }
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
    handleDatabaseError(error, 'loadContributions');
  }

  const [contributions, totalResult] = result ?? [[], [{ count: 0 }]];

  return {
    data: contributions,
    total: totalResult[0]?.count ?? 0,
  };
}

export async function loadContributionVersionHistory({
  fairteilerId,
  checkinId,
}: {
  fairteilerId: string;
  checkinId: string;
}) {
  const [error, data] = await attempt(
    db.query.contributionVersionHistory.findMany({
      where: (table, { and, eq }) =>
        and(
          eq(table.fairteilerId, fairteilerId),
          eq(table.checkinId, checkinId),
        ),
      with: {
        user: true,
      },
      orderBy: (table, { desc }) => desc(table.createdAt),
    }),
  );
  if (error) handleDatabaseError(error, 'loadContributionVersionHistory');
  return data;
}

export async function addVersionHistoryRecord(
  fairteilerId: string,
  userId: string,
  payload: {
    checkinId: string;
    prevValue: string;
    newValue: string;
    field: string;
  },
) {
  // --- WARNING: This is not an atomic operation ---
  // The first operation can succeed and the second one can fail,
  // leading to inconsistent data. -> no transactions in neon http driver yet (change it: TODO)

  const [error] = await attempt(
    Promise.all([
      db.insert(contributionVersionHistory).values({
        checkinId: payload.checkinId,
        userId: userId,
        fairteilerId: fairteilerId,
        prevValue: payload.prevValue,
        newValue: payload.newValue,
        field: payload.field,
      }),
      db
        .update(checkin)
        .set({
          [payload.field]: payload.newValue,
        })
        .where(
          and(
            eq(checkin.id, payload.checkinId),
            eq(checkin.fairteilerId, fairteilerId),
          ),
        ),
    ]),
  );

  if (error) {
    handleDatabaseError(error, 'addVersionHistoryRecord');
  }
}

export async function checkInvitationAndUser(invitationId: string) {
  const [error, data] = await attempt(
    (async () => {
      const invitationData = await db.query.invitation.findFirst({
        where: eq(invitation.id, invitationId),
      });

      if (!invitationData) {
        throw new NotFoundError('Invitation not found');
      }

      if (invitationData.expiresAt < new Date()) {
        throw new ValidationError('Invitation has expired');
      }

      if (invitationData.status !== 'pending') {
        throw new ValidationError('Invitation is no longer valid');
      }

      const organizationData = await db.query.fairteiler.findFirst({
        where: eq(fairteiler.id, invitationData.organizationId),
      });

      const existingUser = await db.query.user.findFirst({
        where: eq(user.email, invitationData.email),
      });

      return {
        invitation: {
          id: invitationData.id,
          email: invitationData.email,
          role: invitationData.role,
          organizationId: invitationData.organizationId,
          organizationName: organizationData?.name ?? 'Unknown Organization',
        },
        userExists: !!existingUser,
        isValid: true,
      };
    })(),
  );

  if (error) handleDatabaseError(error, 'checkInvitationAndUser');
  return data;
}
