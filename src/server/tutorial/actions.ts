'use server';

import { headers } from 'next/headers';
import { z, ZodError } from 'zod';
import { BetterAuthError } from 'better-auth';
import {
  fairteilerTutorialSchema,
  fairteilerTutorialStepSchema,
} from '@/features/fairteiler/tutorial/schemas/fairteiler-tutorial-schema';
import { getErrorMessage } from '@/lib/auth/auth-helpers';
import { checkPermissionOnServer } from '@/lib/auth/auth';
import { loadAuthenticatedSession } from '../dal';
import { AuthError, handleImageUpload } from '../api-helpers';
import { ActionState, createAction } from '../action-helpers';
import { PermissionError } from '../error-handling';
import {
  addFairteilerTutorial,
  addFairteilerTutorialStep,
  removeFairteilerTutorial,
  removeFairteilerTutorialStep,
  updateFairteilerTutorial,
  updateFairteilerTutorialStep,
} from './dal';

export const addFairteilerTutorialAction = createAction({
  inputSchema: fairteilerTutorialSchema,
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

    const result = await addFairteilerTutorial(fairteilerId, {
      ...input,
      fairteilerId,
    });

    if (!result) {
      throw new Error('Failed to create tutorial');
    }

    return {
      message: 'Tutorial erfolgreich erstellt!',
      data: result,
    };
  },
});

export const updateFairteilerTutorialAction = createAction({
  inputSchema: fairteilerTutorialSchema,
  handler: async ({ input, headers }) => {
    const session = await loadAuthenticatedSession(headers);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(headers, {
      preferences: ['update'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    if (!input.id) {
      throw new Error('Failed to update tutorial');
    }

    const updatedTutorial = {
      fairteilerId,
      title: input.title,
      isActive: input.isActive,
    };

    const result = await updateFairteilerTutorial(input.id, updatedTutorial);

    if (!result) {
      throw new Error('Failed to update tutorial');
    }

    return {
      message: 'Tutorial erfolgreich aktualisiert!',
      data: result,
    };
  },
});

export const removeFairteilerTutorialAction = createAction({
  inputSchema: z.object({ id: z.string() }),
  handler: async ({ input, headers }) => {
    const session = await loadAuthenticatedSession(headers);

    if (!session.session.activeOrganizationId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(headers, {
      preferences: ['delete'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const result = await removeFairteilerTutorial(input.id);

    if (!result) {
      throw new Error('Failed to delete tutorial');
    }

    return {
      message: 'Tutorial erfolgreich gelöscht!',
      data: result,
    };
  },
});

// Custom action for FormData handling (tutorial step creation)
export async function addFairteilerTutorialStepAction(
  formData: FormData,
): Promise<ActionState<z.infer<typeof fairteilerTutorialStepSchema>>> {
  try {
    const rawData = Object.fromEntries(formData.entries());

    const validation = fairteilerTutorialStepSchema
      .omit({ id: true })
      .safeParse({
        ...rawData,
        sortIndex: rawData.sortIndex ? Number(rawData.sortIndex) : 1,
        media: rawData.media ?? null,
      });

    if (!validation.success) {
      return {
        success: false,
        error: 'Ungültige Eingabedaten.',
        issues: validation.error.issues,
      };
    }

    const tutorialId = rawData.tutorialId as string;
    if (!tutorialId) {
      throw new Error('Tutorial ID is required for creating steps');
    }

    const nextHeaders = await headers();

    const session = await loadAuthenticatedSession(nextHeaders);
    const fairteilerId = session.session.activeOrganizationId;
    if (!fairteilerId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(nextHeaders, {
      preferences: ['create'],
    });

    if (!permissionResult.success) {
      throw new PermissionError('cannot create tutorial step');
    }

    const { media, ...otherValues } = validation.data;

    const newMediaUrl = await handleImageUpload(
      media,
      null,
      'fairteilerTutorialMedia',
    );

    const finalData = {
      ...otherValues,
      media: newMediaUrl,
      tutorialId,
    };

    await addFairteilerTutorialStep(tutorialId, finalData);

    return {
      success: true,
      message: 'Anleitungs-Schritt erfolgreich erstellt!',
      data: validation.data,
    };
  } catch (error) {
    console.error('Add tutorial step error:', error);
    if (error instanceof ZodError) {
      return {
        success: false,
        error: 'Ungültige Eingabedaten.',
        issues: error.issues,
      };
    }
    if (error instanceof BetterAuthError) {
      const message = getErrorMessage(
        typeof error.cause === 'string' ? error.cause : undefined,
        'de',
      );
      return { success: false, error: `Erstellung fehlgeschlagen: ${message}` };
    }
    if (error instanceof PermissionError) {
      const message = getErrorMessage(
        'YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_ORGANIZATION',
        'de',
      );
      return { success: false, error: `Erstellung fehlgeschlagen: ${message}` };
    }
    const message =
      error instanceof Error
        ? error.message
        : 'Ein unerwarteter Fehler ist aufgetreten.';
    return { success: false, error: `Erstellung fehlgeschlagen: ${message}` };
  }
}

// Custom action for FormData handling (tutorial step updates)
export async function updateFairteilerTutorialStepAction(
  formData: FormData,
): Promise<ActionState<z.infer<typeof fairteilerTutorialStepSchema>>> {
  try {
    const rawData = Object.fromEntries(formData.entries());

    const validation = fairteilerTutorialStepSchema.safeParse({
      ...rawData,
      sortIndex: rawData.sortIndex ? Number(rawData.sortIndex) : 1,
      media: rawData.media ?? null,
    });

    if (!validation.success) {
      return {
        success: false,
        error: 'Ungültige Eingabedaten.',
        issues: validation.error.issues,
      };
    }

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
      throw new PermissionError('cannot update tutorial step');
    }

    if (!validation.data.id) {
      throw new Error('Tutorial step ID is required for updates');
    }

    const { media, id, ...otherValues } = validation.data;

    const newMediaUrl = await handleImageUpload(
      media,
      null,
      'fairteilerTutorialMedia',
    );

    const tutorialId = rawData.tutorialId as string;
    if (!tutorialId) {
      throw new Error('Tutorial ID is required for updating steps');
    }

    const finalData = {
      ...otherValues,
      media: newMediaUrl,
      tutorialId,
    };

    await updateFairteilerTutorialStep(id, finalData);

    return {
      success: true,
      message: 'Anleitungs-Schritt erfolgreich aktualisiert!',
      data: validation.data,
    };
  } catch (error) {
    console.error('Update tutorial step error:', error);
    if (error instanceof ZodError) {
      return {
        success: false,
        error: 'Ungültige Eingabedaten.',
        issues: error.issues,
      };
    }
    if (error instanceof BetterAuthError) {
      const message = getErrorMessage(
        typeof error.cause === 'string' ? error.cause : undefined,
        'de',
      );
      return { success: false, error: `Update fehlgeschlagen: ${message}` };
    }
    if (error instanceof PermissionError) {
      const message = getErrorMessage(
        'YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_ORGANIZATION',
        'de',
      );
      return { success: false, error: `Update fehlgeschlagen: ${message}` };
    }
    const message =
      error instanceof Error
        ? error.message
        : 'Ein unerwarteter Fehler ist aufgetreten.';
    return { success: false, error: `Update fehlgeschlagen: ${message}` };
  }
}

export const removeFairteilerTutorialStepAction = createAction({
  inputSchema: z.object({ id: z.string() }),
  handler: async ({ input, headers }) => {
    const session = await loadAuthenticatedSession(headers);

    if (!session.session.activeOrganizationId) {
      throw new AuthError('No active organization');
    }

    const permissionResult = await checkPermissionOnServer(headers, {
      preferences: ['delete'],
    });

    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const result = await removeFairteilerTutorialStep(input.id);

    if (!result) {
      throw new Error('Failed to delete tutorial');
    }

    return {
      message: 'Tutorial erfolgreich gelöscht!',
      data: result,
    };
  },
});
