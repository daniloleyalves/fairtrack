'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import {
  addCategory,
  addCompany,
  addFairteilerCategory,
  addFairteilerCompany,
  addFairteilerOrigin,
  addOrigin,
  addTagToFairteiler,
  removeFairteilerCategory,
  removeFairteilerCompany,
  removeFairteilerOrigin,
  removeTagFromFairteiler,
  updateCategory,
  updateCompany,
  updateOrigin,
} from './dal';
import { authedAction, fairteilerAction } from '../_lib/safe-action';
import { NotFoundError, PermissionError } from '../error-handling';
import { checkPermissionOnServer } from '@/lib/auth/auth';

const genericItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name ist erforderlich'),
  status: z.enum(['active', 'pending', 'disabled']).optional(),
  originId: z.string().nullable().optional(),
});

const tagSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name ist erforderlich'),
  fairteilerId: z.string().optional(),
});

async function assertPermission(
  scope: Record<string, string[]>,
  errorMessage = 'Du bist nicht befugt diese Aktion auszuführen',
) {
  const result = await checkPermissionOnServer(await headers(), scope);
  if (!result.success) {
    throw new PermissionError(errorMessage);
  }
}

// --- ORIGIN ---

export const suggestNewOriginAction = authedAction
  .inputSchema(genericItemSchema)
  .action(async ({ parsedInput }) => {
    await assertPermission({ preferences: ['create'] });
    const added = await addOrigin(parsedInput);
    if (!added) throw new NotFoundError('Origin', 'after creation');
    return parsedInput;
  });

export const addFairteilerOriginAction = fairteilerAction
  .inputSchema(genericItemSchema)
  .action(async ({ parsedInput, ctx }) => {
    await assertPermission({ preferences: ['update'] });
    const result = await addFairteilerOrigin(ctx.fairteilerId, parsedInput);
    if (!result) throw new Error('Failed to add origin to fairteiler');
    return parsedInput;
  });

export const removeFairteilerOriginAction = fairteilerAction
  .inputSchema(genericItemSchema)
  .action(async ({ parsedInput, ctx }) => {
    await assertPermission({ preferences: ['delete'] });
    const removed = await removeFairteilerOrigin(ctx.fairteilerId, parsedInput);
    if (!removed) throw new NotFoundError('Origin to remove');
    return parsedInput;
  });

export const updateOriginAction = fairteilerAction
  .inputSchema(genericItemSchema)
  .action(async ({ parsedInput }) => {
    await assertPermission({ preferences: ['update'] });
    const updated = await updateOrigin(parsedInput);
    if (!updated) throw new NotFoundError('Origin to update');
    return parsedInput;
  });

// --- CATEGORY ---

export const suggestNewCategoryAction = fairteilerAction
  .inputSchema(genericItemSchema)
  .action(async ({ parsedInput }) => {
    await assertPermission({ preferences: ['create'] });
    const added = await addCategory(parsedInput);
    if (!added) throw new NotFoundError('Category', 'after creation');
    return parsedInput;
  });

export const addFairteilerCategoryAction = fairteilerAction
  .inputSchema(genericItemSchema)
  .action(async ({ parsedInput, ctx }) => {
    await assertPermission({ preferences: ['update'] });
    const result = await addFairteilerCategory(ctx.fairteilerId, parsedInput);
    if (!result) throw new Error('Failed to add category to fairteiler');
    return parsedInput;
  });

export const removeFairteilerCategoryAction = fairteilerAction
  .inputSchema(genericItemSchema)
  .action(async ({ parsedInput, ctx }) => {
    await assertPermission({ preferences: ['delete'] });
    const removed = await removeFairteilerCategory(
      ctx.fairteilerId,
      parsedInput,
    );
    if (!removed) throw new NotFoundError('Category to remove');
    return parsedInput;
  });

export const updateCategoryAction = fairteilerAction
  .inputSchema(genericItemSchema)
  .action(async ({ parsedInput }) => {
    await assertPermission({ preferences: ['update'] });
    const updated = await updateCategory(parsedInput);
    if (!updated) throw new NotFoundError('Category to update');
    return parsedInput;
  });

// --- COMPANY ---

export const suggestNewCompanyAction = fairteilerAction
  .inputSchema(genericItemSchema)
  .action(async ({ parsedInput, ctx }) => {
    await assertPermission({ preferences: ['create'] });
    const added = await addCompany(ctx.fairteilerId, parsedInput);
    if (!added) throw new Error('Failed to create new company');
    return parsedInput;
  });

export const addFairteilerCompanyAction = fairteilerAction
  .inputSchema(genericItemSchema)
  .action(async ({ parsedInput, ctx }) => {
    await assertPermission({ preferences: ['update'] });
    const result = await addFairteilerCompany(ctx.fairteilerId, parsedInput);
    if (!result) throw new Error('Failed to add company to fairteiler');
    return parsedInput;
  });

export const removeFairteilerCompanyAction = fairteilerAction
  .inputSchema(genericItemSchema)
  .action(async ({ parsedInput, ctx }) => {
    await assertPermission({ preferences: ['delete'] });
    const removed = await removeFairteilerCompany(
      ctx.fairteilerId,
      parsedInput,
    );
    if (!removed) throw new NotFoundError('Company to remove');
    return parsedInput;
  });

export const updateCompanyAction = fairteilerAction
  .inputSchema(genericItemSchema)
  .action(async ({ parsedInput }) => {
    await assertPermission({ preferences: ['update'] });
    const updated = await updateCompany(parsedInput);
    if (!updated) throw new NotFoundError('Company to update');
    return parsedInput;
  });

// --- TAGS ---

export const addTagToFairteilerAction = fairteilerAction
  .inputSchema(tagSchema)
  .action(async ({ parsedInput, ctx }) => {
    await assertPermission({ organization: ['update'] });
    const tag = { ...parsedInput, fairteilerId: ctx.fairteilerId };
    const added = await addTagToFairteiler(tag);
    if (!added) throw new Error('Failed to add tag to fairteiler');
    return tag;
  });

export const removeTagFromFairteilerAction = fairteilerAction
  .inputSchema(tagSchema)
  .action(async ({ parsedInput, ctx }) => {
    await assertPermission({ organization: ['update'] });
    const removed = await removeTagFromFairteiler(
      ctx.fairteilerId,
      parsedInput.id ?? '',
    );
    if (!removed) throw new NotFoundError('Tag to remove');
    return { ...parsedInput, fairteilerId: ctx.fairteilerId };
  });
