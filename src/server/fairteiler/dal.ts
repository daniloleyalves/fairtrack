import 'server-only';
import { cache } from 'react';
import { and, eq } from 'drizzle-orm';
import z from 'zod';
import { attempt } from '@/lib/attempt';
import { auth } from '@/lib/auth/auth';
import { fairteilerProfileSchema } from '@/features/fairteiler/profile/schemas/fairteiler-profile-schema';
import { db } from '../db/drizzle';
import {
  category,
  company,
  fairteiler,
  fairteilerCategory,
  fairteilerCompany,
  fairteilerOrigin,
  origin,
  tag,
} from '../db/schema';
import { GenericItem, Tag } from '../db/db-types';
import { AuthError } from '../api-helpers';
import { DatabaseError, handleDatabaseError } from '../error-handling';
import { loadAuthenticatedSession } from '../user/dal';

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

// --- Origin Management ---

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
  return data;
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

// --- Category Management ---

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
  return data;
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

// --- Company Management ---

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
  return data;
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
