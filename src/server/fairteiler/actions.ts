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
import { loadAuthenticatedSession } from '../user/dal';
import { createAction } from '../action-helpers';
import { NotFoundError, PermissionError } from '../error-handling';
import { AuthError } from '../api-helpers';
import { GenericItem, Tag } from '../db/db-types';
import { checkPermissionOnServer } from '@/lib/auth/auth';

const genericItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name ist erforderlich'),
  status: z.enum(['active', 'pending', 'disabled']).optional(),
  originId: z.string().nullable().optional(),
});

export const suggestNewOriginAction = createAction({
  inputSchema: genericItemSchema,
  handler: async ({ input, headers }) => {
    const permissionResult = await checkPermissionOnServer(headers, {
      preferences: ['create'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const addedOrigin = await addOrigin(input);

    if (!addedOrigin) {
      throw new NotFoundError('Origin', 'after creation');
    }

    return {
      message: 'Herkunft erfolgreich vorgeschlagen.',
      data: input,
    };
  },
});

export async function addFairteilerOriginAction(
  originToAdd: GenericItem,
): Promise<GenericItem> {
  try {
    const nextHeaders = await headers();
    const session = await loadAuthenticatedSession(nextHeaders);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(nextHeaders, {
      preferences: ['update'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const fairteilerOrigins = await addFairteilerOrigin(
      fairteilerId,
      originToAdd,
    );

    if (!fairteilerOrigins) {
      throw new Error('Failed to add origin to fairteiler');
    }

    return originToAdd;
  } catch (error) {
    console.error('Error in addFairteilerOriginAction:', error);
    throw error;
  }
}

export async function removeFairteilerOriginAction(
  originToRemove: GenericItem,
): Promise<GenericItem> {
  try {
    const nextHeaders = await headers();
    const session = await loadAuthenticatedSession(nextHeaders);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(nextHeaders, {
      preferences: ['delete'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const removedOriginFromFairteiler = await removeFairteilerOrigin(
      fairteilerId,
      originToRemove,
    );

    if (!removedOriginFromFairteiler) {
      throw new NotFoundError('Origin to remove');
    }

    return originToRemove;
  } catch (error) {
    console.error('Error in removeFairteilerOriginAction:', error);
    throw error;
  }
}

export async function updateOriginAction(
  originToUpdate: GenericItem,
): Promise<GenericItem> {
  try {
    const nextHeaders = await headers();
    const session = await loadAuthenticatedSession(nextHeaders);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(nextHeaders, {
      preferences: ['update'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const updatedOrigin = await updateOrigin(originToUpdate);

    if (!updatedOrigin) {
      throw new NotFoundError('Origin to update');
    }

    return originToUpdate;
  } catch (error) {
    console.error('Error in updateOriginAction:', error);
    throw error;
  }
}

// CATEGORY SELECTION

export const suggestNewCategoryAction = createAction({
  inputSchema: genericItemSchema,
  handler: async ({ input, headers }) => {
    const session = await loadAuthenticatedSession(headers);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(headers, {
      preferences: ['create'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const addedCategory = await addCategory(input);

    if (!addedCategory) {
      throw new NotFoundError('Category', 'after creation');
    }

    return {
      message: 'Kategorie erfolgreich vorgeschlagen.',
      data: input,
    };
  },
});

export async function addFairteilerCategoryAction(
  categoryToAdd: GenericItem,
): Promise<GenericItem> {
  const nextHeaders = await headers();
  const session = await loadAuthenticatedSession(nextHeaders);
  const fairteilerId = session.session.activeOrganizationId;
  if (!fairteilerId) {
    throw new AuthError('No active organization');
  }

  try {
    const permissionResult = await checkPermissionOnServer(nextHeaders, {
      preferences: ['update'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const fairteilerCategories = await addFairteilerCategory(
      fairteilerId,
      categoryToAdd,
    );

    if (!fairteilerCategories) {
      throw new Error('Failed to add category to fairteiler');
    }

    return categoryToAdd;
  } catch (error) {
    console.error('Error in addFairteilerCategoryAction:', error);
    throw error;
  }
}

export async function removeFairteilerCategoryAction(
  categoryToRemove: GenericItem,
): Promise<GenericItem> {
  try {
    const nextHeaders = await headers();
    const session = await loadAuthenticatedSession(nextHeaders);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(nextHeaders, {
      preferences: ['delete'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const removedCategoryFromFairteiler = await removeFairteilerCategory(
      fairteilerId,
      categoryToRemove,
    );

    if (!removedCategoryFromFairteiler) {
      throw new NotFoundError('Category to remove');
    }

    return categoryToRemove;
  } catch (error) {
    console.error('Error in removeFairteilerCategoryAction:', error);
    throw error;
  }
}

export async function updateCategoryAction(
  categoryToUpdate: GenericItem,
): Promise<GenericItem> {
  try {
    const nextHeaders = await headers();
    const session = await loadAuthenticatedSession(nextHeaders);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(nextHeaders, {
      preferences: ['update'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const updatedCategory = await updateCategory(categoryToUpdate);

    if (!updatedCategory) {
      throw new NotFoundError('Category to update');
    }

    return categoryToUpdate;
  } catch (error) {
    console.error('Error in updateCategoryAction:', error);
    throw error;
  }
}

// COMPANY SELECTION

export const suggestNewCompanyAction = createAction({
  inputSchema: genericItemSchema,
  handler: async ({ input, headers }) => {
    const session = await loadAuthenticatedSession(headers);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(headers, {
      preferences: ['create'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const addedCompany = await addCompany(fairteilerId, input);

    if (!addedCompany) {
      throw new Error('Failed to create new company');
    }

    return {
      message: 'Betrieb erfolgreich vorgeschlagen.',
      data: input,
    };
  },
});

export async function addFairteilerCompanyAction(
  companyToAdd: GenericItem,
): Promise<GenericItem> {
  try {
    const nextHeaders = await headers();
    const session = await loadAuthenticatedSession(nextHeaders);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(nextHeaders, {
      preferences: ['update'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const fairteilerCompanies = await addFairteilerCompany(
      fairteilerId,
      companyToAdd,
    );

    if (!fairteilerCompanies) {
      throw new Error('Failed to add company to fairteiler');
    }

    return companyToAdd;
  } catch (error) {
    console.error('Error in addFairteilerCompanyAction:', error);
    throw error;
  }
}

export async function removeFairteilerCompanyAction(
  companyToRemove: GenericItem,
): Promise<GenericItem> {
  try {
    const nextHeaders = await headers();
    const session = await loadAuthenticatedSession(nextHeaders);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(nextHeaders, {
      preferences: ['delete'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const removedCompanyFromFairteiler = await removeFairteilerCompany(
      fairteilerId,
      companyToRemove,
    );

    if (!removedCompanyFromFairteiler) {
      throw new NotFoundError('Company to remove');
    }

    return companyToRemove;
  } catch (error) {
    console.error('Error in removeFairteilerCompanyAction:', error);
    throw error;
  }
}

export async function updateCompanyAction(
  companyToUpdate: GenericItem & { originId?: string | null },
): Promise<GenericItem> {
  try {
    const nextHeaders = await headers();
    const session = await loadAuthenticatedSession(nextHeaders);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(nextHeaders, {
      preferences: ['update'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const updatedCompany = await updateCompany(companyToUpdate);

    if (!updatedCompany) {
      throw new NotFoundError('Company to update');
    }

    return companyToUpdate;
  } catch (error) {
    console.error('Error in updateCompanyAction:', error);
    throw error;
  }
}

export async function addTagToFairteilerAction(tag: Tag) {
  try {
    const nextHeaders = await headers();
    const session = await loadAuthenticatedSession(nextHeaders);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(nextHeaders, {
      organization: ['update'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const newTag = await addTagToFairteiler({ ...tag, fairteilerId });

    if (!newTag) {
      throw new Error('Failed to add tag to fairteiler');
    }

    return tag;
  } catch (error) {
    console.error('Error in addTagToFairteilerAction:', error);
    throw error;
  }
}

export async function removeTagFromFairteilerAction(tagToRemove: Tag) {
  try {
    const nextHeaders = await headers();
    const session = await loadAuthenticatedSession(nextHeaders);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(nextHeaders, {
      organization: ['update'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const removedTagFromFairteiler = await removeTagFromFairteiler(
      fairteilerId,
      tagToRemove.id ?? '',
    );

    if (!removedTagFromFairteiler) {
      throw new NotFoundError('Tag to remove');
    }

    return tagToRemove;
  } catch (error) {
    console.error('Error in removeTagFromFairteilerAction:', error);
    throw error;
  }
}
