'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import {
  fairteilerTutorialSchema,
  fairteilerTutorialStepSchema,
} from '@/features/fairteiler/tutorial/schemas/fairteiler-tutorial-schema';
import { checkPermissionOnServer } from '@/lib/auth/auth';
import { handleImageUpload } from '../api-helpers';
import { fairteilerAction } from '../_lib/safe-action';
import { PermissionError } from '../error-handling';
import {
  addFairteilerTutorial,
  addFairteilerTutorialStep,
  removeFairteilerTutorial,
  removeFairteilerTutorialStep,
  tutorialBelongsToFairteiler,
  updateFairteilerTutorial,
  updateFairteilerTutorialStep,
} from './dal';

export const addFairteilerTutorialAction = fairteilerAction
  .inputSchema(fairteilerTutorialSchema)
  .action(async ({ parsedInput, ctx }) => {
    const permissionResult = await checkPermissionOnServer(await headers(), {
      preferences: ['create'],
    });
    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const result = await addFairteilerTutorial(ctx.fairteilerId, {
      ...parsedInput,
      fairteilerId: ctx.fairteilerId,
    });
    if (!result) {
      throw new Error('Failed to create tutorial');
    }
    return result;
  });

export const updateFairteilerTutorialAction = fairteilerAction
  .inputSchema(fairteilerTutorialSchema)
  .action(async ({ parsedInput, ctx }) => {
    const permissionResult = await checkPermissionOnServer(await headers(), {
      preferences: ['update'],
    });
    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    if (!parsedInput.id) {
      throw new Error('Failed to update tutorial');
    }

    const result = await updateFairteilerTutorial(
      parsedInput.id,
      ctx.fairteilerId,
      {
        fairteilerId: ctx.fairteilerId,
        title: parsedInput.title,
        isActive: parsedInput.isActive,
      },
    );
    if (!result?.length) {
      throw new Error('Failed to update tutorial');
    }
    return result;
  });

export const removeFairteilerTutorialAction = fairteilerAction
  .inputSchema(z.object({ id: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    const permissionResult = await checkPermissionOnServer(await headers(), {
      preferences: ['delete'],
    });
    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const result = await removeFairteilerTutorial(
      parsedInput.id,
      ctx.fairteilerId,
    );
    if (!result?.length) {
      throw new Error('Failed to delete tutorial');
    }
    return result;
  });

const tutorialStepCreateSchema = fairteilerTutorialStepSchema
  .omit({ id: true })
  .extend({ tutorialId: z.string() });

export const addFairteilerTutorialStepAction = fairteilerAction
  .inputSchema(tutorialStepCreateSchema)
  .action(async ({ parsedInput, ctx }) => {
    const permissionResult = await checkPermissionOnServer(await headers(), {
      preferences: ['create'],
    });
    if (!permissionResult.success) {
      throw new PermissionError('cannot create tutorial step');
    }

    const { media, tutorialId, ...otherValues } = parsedInput;

    if (!(await tutorialBelongsToFairteiler(tutorialId, ctx.fairteilerId))) {
      throw new PermissionError('cannot create tutorial step');
    }

    const newMediaUrl = await handleImageUpload(
      media,
      null,
      'fairteilerTutorialMedia',
    );

    await addFairteilerTutorialStep(tutorialId, {
      ...otherValues,
      media: newMediaUrl,
      tutorialId,
    });

    return parsedInput;
  });

const tutorialStepUpdateSchema = fairteilerTutorialStepSchema.extend({
  id: z.string(),
  tutorialId: z.string(),
});

export const updateFairteilerTutorialStepAction = fairteilerAction
  .inputSchema(tutorialStepUpdateSchema)
  .action(async ({ parsedInput, ctx }) => {
    const permissionResult = await checkPermissionOnServer(await headers(), {
      preferences: ['update'],
    });
    if (!permissionResult.success) {
      throw new PermissionError('cannot update tutorial step');
    }

    const { media, id, tutorialId, ...otherValues } = parsedInput;

    if (!(await tutorialBelongsToFairteiler(tutorialId, ctx.fairteilerId))) {
      throw new PermissionError('cannot update tutorial step');
    }

    const newMediaUrl = await handleImageUpload(
      media,
      null,
      'fairteilerTutorialMedia',
    );

    const result = await updateFairteilerTutorialStep(id, ctx.fairteilerId, {
      ...otherValues,
      media: newMediaUrl,
      tutorialId,
    });

    if (!result?.length) {
      throw new PermissionError('cannot update tutorial step');
    }

    return parsedInput;
  });

export const removeFairteilerTutorialStepAction = fairteilerAction
  .inputSchema(z.object({ id: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    const permissionResult = await checkPermissionOnServer(await headers(), {
      preferences: ['delete'],
    });
    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const result = await removeFairteilerTutorialStep(
      parsedInput.id,
      ctx.fairteilerId,
    );
    if (!result?.length) {
      throw new Error('Failed to delete tutorial');
    }
    return result;
  });
