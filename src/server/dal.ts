import { fairteilerProfileSchema } from '@/features/fairteiler/profile/schemas/fairteiler-profile-schema';
import { attempt } from '@/lib/attempt';
import { auth } from '@/lib/auth/auth';
import type { ContributionItem } from '@features/contribution/models/contribution';
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
import { cache } from 'react';
import 'server-only';
import z from 'zod';
import { AuthError } from './api-helpers';
import { GenericItem, Tag } from './db/db-types';
import { db } from './db/drizzle';
import {
  category,
  checkin,
  company,
  contributionVersionHistory,
  fairteiler,
  fairteilerCategory,
  fairteilerCompany,
  fairteilerOrigin,
  food,
  invitation,
  origin,
  tag,
  user,
  vContributions,
} from './db/schema';
import {
  DatabaseError,
  handleDatabaseError,
  NotFoundError,
  ValidationError,
} from './error-handling';
import { DateRange } from 'react-day-picker';
import { defaultDateRange } from '@/lib/config/site-config';
import { loadAuthenticatedSession } from './user/dal';

// --- 2. Core Data Loading Functions ---

export async function loadFairteilers() {
  const [error, data] = await attempt(
    db.query.fairteiler.findMany({
      where: eq(fairteiler.disabled, false),
      with: { tags: true },
    }),
  );

  if (error) handleDatabaseError(error, 'load fairteiler');
  return data;
}

export async function loadFairteilerBySlug(fairteilerSlug: string) {
  const [error, data] = await attempt(
    db.query.fairteiler.findFirst({
      where: eq(fairteiler.slug, fairteilerSlug),
      with: { tags: true },
    }),
  );

  if (error) handleDatabaseError(error, 'loadFairteilerById');
  return data;
}

export async function loadTagsByFairteiler(fairteilerId: string) {
  const [error, data] = await attempt(
    db.query.tag.findMany({
      where: eq(tag.fairteilerId, fairteilerId),
    }),
  );

  if (error) handleDatabaseError(error, 'loadTagsByFairteiler');
  return data;
}

export const loadActiveOrganization = cache(async (headers: Headers) => {
  const session = await loadAuthenticatedSession(headers);
  const fairteilerId = session.session.activeOrganizationId;
  if (!fairteilerId) {
    throw new AuthError('No active organization');
  }

  const [error, data] = await attempt(
    db.query.fairteiler.findFirst({
      where: (table, { eq }) => eq(table.id, fairteilerId),
      with: { tags: true, members: { with: { user: true } } },
    }),
  );

  if (error) handleDatabaseError(error, 'load active organization');
  return data;
});

export const loadActiveMembership = cache(async (headers: Headers) => {
  return await auth.api.getActiveMember({ headers });
});

export async function updateFairteiler(
  fairteilerId: string,
  values: z.infer<typeof fairteilerProfileSchema>,
) {
  if (values.thumbnail && typeof values.thumbnail !== 'string') {
    throw new DatabaseError('thumbnail url is not of type string');
  }

  const [error, data] = await attempt(
    db
      .update(fairteiler)
      .set({
        ...values,
        thumbnail: values.thumbnail,
      })
      .where(eq(fairteiler.id, fairteilerId))
      .returning(),
  );

  if (error) handleDatabaseError(error, 'updateFairteiler');
  return data;
}

export async function toggleFairteilerVisibility(
  fairteilerId: string,
  disabled: boolean,
) {
  const [error, data] = await attempt(
    db
      .update(fairteiler)
      .set({
        disabled,
      })
      .where(eq(fairteiler.id, fairteilerId))
      .returning(),
  );

  if (error) handleDatabaseError(error, 'toggleFairteilerVisibility');
  return data;
}

// --- 3. Origin Management ---

export async function loadOrigins() {
  const [error, data] = await attempt(db.query.origin.findMany());
  if (error) handleDatabaseError(error, 'loadOrigins');
  return data;
}

export async function addOrigin(newOrigin: GenericItem) {
  const [error, data] = await attempt(
    db.insert(origin).values(newOrigin).returning(),
  );
  if (error) handleDatabaseError(error, 'addOrigin');
  return data;
}

export async function loadFairteilerOrigins(fairteilerId: string) {
  const [error, data] = await attempt(
    db.query.fairteilerOrigin.findMany({
      where: eq(fairteilerOrigin.fairteilerId, fairteilerId),
      with: { origin: true },
    }),
  );
  if (error) handleDatabaseError(error, 'loadFairteilerOrigins');
  return data; // Returns the raw join table data
}

export async function addFairteilerOrigin(
  fairteilerId: string,
  originToAdd: GenericItem,
) {
  const [error, data] = await attempt(
    db
      .insert(fairteilerOrigin)
      .values({ fairteilerId, originId: originToAdd.id })
      .returning(),
  );
  if (error) handleDatabaseError(error, 'addFairteilerOrigin');
  return data;
}

export async function removeFairteilerOrigin(
  fairteilerId: string,
  originToRemove: GenericItem,
) {
  const [error, data] = await attempt(
    db
      .delete(fairteilerOrigin)
      .where(
        and(
          eq(fairteilerOrigin.fairteilerId, fairteilerId),
          eq(fairteilerOrigin.originId, originToRemove.id),
        ),
      )
      .returning(),
  );
  if (error) handleDatabaseError(error, 'removeFairteilerOrigin');
  return data;
}

export async function updateOrigin(originToUpdate: GenericItem) {
  const [error, data] = await attempt(
    db
      .update(origin)
      .set({ name: originToUpdate.name })
      .where(eq(origin.id, originToUpdate.id))
      .returning(),
  );
  if (error) handleDatabaseError(error, 'updateOrigin');
  return data;
}

// --- 4. Category Management ---

export async function loadCategories() {
  const [error, data] = await attempt(db.query.category.findMany());
  if (error) handleDatabaseError(error, 'loadCategories');
  return data;
}

export async function addCategory(newCategory: GenericItem) {
  const [error, data] = await attempt(
    db.insert(category).values(newCategory).returning(),
  );
  if (error) handleDatabaseError(error, 'addCategory');
  return data;
}

export async function loadFairteilerCategories(fairteilerId: string) {
  const [error, data] = await attempt(
    db.query.fairteilerCategory.findMany({
      where: eq(fairteilerCategory.fairteilerId, fairteilerId),
      with: { category: true },
    }),
  );
  if (error) handleDatabaseError(error, 'loadFairteilerCategories');
  return data; // Returns the raw join table data
}

export async function addFairteilerCategory(
  fairteilerId: string,
  categoryToAdd: GenericItem,
) {
  const [error, data] = await attempt(
    db
      .insert(fairteilerCategory)
      .values({ fairteilerId, categoryId: categoryToAdd.id })
      .returning(),
  );
  if (error) handleDatabaseError(error, 'addFairteilerCategory');
  return data;
}

export async function removeFairteilerCategory(
  fairteilerId: string,
  categoryToRemove: GenericItem,
) {
  const [error, data] = await attempt(
    db
      .delete(fairteilerCategory)
      .where(
        and(
          eq(fairteilerCategory.fairteilerId, fairteilerId),
          eq(fairteilerCategory.categoryId, categoryToRemove.id),
        ),
      )
      .returning(),
  );
  if (error) handleDatabaseError(error, 'removeFairteilerCategory');
  return data;
}

export async function updateCategory(categoryToUpdate: GenericItem) {
  const [error, data] = await attempt(
    db
      .update(category)
      .set({ name: categoryToUpdate.name })
      .where(eq(category.id, categoryToUpdate.id))
      .returning(),
  );
  if (error) handleDatabaseError(error, 'updateCategory');
  return data;
}

// --- 5. Company Management ---

export async function loadCompanies() {
  const [error, data] = await attempt(
    db.query.company.findMany({
      with: { origin: true },
    }),
  );
  if (error) handleDatabaseError(error, 'loadCompanies');
  return data;
}

export async function addCompany(
  _fairteilerId: string,
  newCompany: GenericItem,
) {
  const [error, data] = await attempt(
    db.insert(company).values(newCompany).returning(),
  );
  if (error) handleDatabaseError(error, 'addCompany');
  return data;
}

export async function loadFairteilerCompanies(fairteilerId: string) {
  const [error, data] = await attempt(
    db.query.fairteilerCompany.findMany({
      where: eq(fairteilerCompany.fairteilerId, fairteilerId),
      with: { company: true },
    }),
  );
  if (error) handleDatabaseError(error, 'loadFairteilerCompanies');
  return data; // Returns the raw join table data
}

export async function addFairteilerCompany(
  fairteilerId: string,
  companyToAdd: GenericItem,
) {
  const [error, data] = await attempt(
    db
      .insert(fairteilerCompany)
      .values({ fairteilerId, companyId: companyToAdd.id })
      .returning(),
  );
  if (error) handleDatabaseError(error, 'addFairteilerCompany');
  return data;
}

export async function removeFairteilerCompany(
  fairteilerId: string,
  companyToRemove: GenericItem,
) {
  const [error, data] = await attempt(
    db
      .delete(fairteilerCompany)
      .where(
        and(
          eq(fairteilerCompany.fairteilerId, fairteilerId),
          eq(fairteilerCompany.companyId, companyToRemove.id),
        ),
      )
      .returning(),
  );
  if (error) handleDatabaseError(error, 'removeFairteilerCompany');
  return data;
}

export async function updateCompany(
  companyToUpdate: GenericItem & { originId?: string | null },
) {
  const updateData: { name: string; originId?: string | null } = {
    name: companyToUpdate.name,
  };

  if ('originId' in companyToUpdate) {
    updateData.originId = companyToUpdate.originId;
  }

  const [error, data] = await attempt(
    db
      .update(company)
      .set(updateData)
      .where(eq(company.id, companyToUpdate.id))
      .returning(),
  );
  if (error) handleDatabaseError(error, 'updateCompany');
  return data;
}

export async function addTagToFairteiler(newTag: Tag) {
  const [error, data] = await attempt(
    db.insert(tag).values(newTag).returning(),
  );
  if (error) handleDatabaseError(error, 'addTagToFairteiler');
  return data;
}

export async function removeTagFromFairteiler(
  fairteilerId: string,
  tagId: string,
) {
  const [error, data] = await attempt(
    db
      .delete(tag)
      .where(and(eq(tag.fairteilerId, fairteilerId), eq(tag.id, tagId)))
      .returning(),
  );
  if (error) handleDatabaseError(error, 'removeTagFromFairteiler');
  return data;
}

// --- 6. Contribution and Checkin Logic ---

/**
 * IMPORTANT: This function is NOT ATOMIC. It performs multiple database
 * inserts sequentially. If an error occurs after the first insert but
 * before the last (e.g., the `checkin` insert fails after the `food`
 * insert succeeds), the database will be in an inconsistent state
 * (an orphaned `food` record without a corresponding `checkin`).
 *
 * The ideal solution is to wrap these operations in a database transaction
 * (`db.transaction(...)`). Since that is not available in the current
- * setup, be aware of this potential data integrity issue.
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

// -------- FAIRTEILER DASHBOARD DATA ----------

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
        date: sql<Date>`${vContributions.contributionDate}::date`,
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

  // Apply pagination
  const finalQuery = (() => {
    if (offset != null && limit != null)
      return queryWithConditions.offset(offset).limit(limit);
    if (limit != null) return queryWithConditions.limit(limit);
    return queryWithConditions;
  })();

  // Count query
  const countQuery = db.select({ count: count() }).from(vContributions);
  const countQueryWithConditions = conditions.length
    ? countQuery.where(and(...conditions))
    : countQuery;

  // Execute both queries in parallel
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
      // 1. Insert the history record
      db.insert(contributionVersionHistory).values({
        checkinId: payload.checkinId,
        userId: userId,
        fairteilerId: fairteilerId,
        prevValue: payload.prevValue,
        newValue: payload.newValue,
        field: payload.field,
      }),
      // 2. Update the field in the checkin table
      db
        .update(checkin)
        .set({
          [payload.field]: payload.newValue,
        })
        .where(eq(checkin.id, payload.checkinId)),
    ]),
  );

  if (error) {
    handleDatabaseError(error, 'addVersionHistoryRecord');
  }
}

// --- 7. Invitation Management ---

export async function checkInvitationAndUser(invitationId: string) {
  const [error, data] = await attempt(
    (async () => {
      // Load invitation details with organization info
      const invitationData = await db.query.invitation.findFirst({
        where: eq(invitation.id, invitationId),
      });

      if (!invitationData) {
        throw new NotFoundError('Invitation not found');
      }

      // Check if invitation is expired
      if (invitationData.expiresAt < new Date()) {
        throw new ValidationError('Invitation has expired');
      }

      // Check if invitation is still pending
      if (invitationData.status !== 'pending') {
        throw new ValidationError('Invitation is no longer valid');
      }

      // Load organization details
      const organizationData = await db.query.fairteiler.findFirst({
        where: eq(fairteiler.id, invitationData.organizationId),
      });

      // Check if user exists with the invitation email
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
