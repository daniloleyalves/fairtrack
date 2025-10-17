'use server';

import { headers } from 'next/headers';
import z, { ZodError } from 'zod';
import {
  checkInvitationAndUser,
  loadAuthenticatedSession,
  loadUserByEmail,
  toggleFairteilerVisibility,
  updateFairteiler,
  validateResetPasswordToken,
} from '@server/dal';
import { getActiveFairteiler } from '@server/dto';
import { auth, checkPermissionOnServer } from './auth';
import { generatePassword, getErrorMessage } from './auth-helpers';
import { MemberRolesEnum } from './auth-permissions';
import { fairteilerProfileSchema } from '../../features/fairteiler/profile/schemas/fairteiler-profile-schema';
import { ActionState, createAction } from '@server/action-helpers';
import { BetterAuthError } from 'better-auth';
import {
  accessViewSchema,
  changeRoleSchema,
  disableAccessViewSchema,
  inviteMemberSchema,
  removeMemberSchema,
} from '@/features/fairteiler/members/schemas/members-schema';
import { NotFoundError, PermissionError } from '@/server/error-handling';
import { AuthError, handleImageUpload } from '@/server/api-helpers';
import { userProfileSchema } from '@/features/user/settings/schemas/user-profile-schema';

export const signOutAction = createAction({
  inputSchema: z.object({}),
  handler: async ({ headers }) => {
    await auth.api.signOut({ headers });

    return {
      message: 'Erfolgreich abgemeldet.',
      data: {
        redirectTo: '/sign-in',
        shouldRefresh: true,
      },
    };
  },
});

// Custom action for FormData handling (can't use createAction with FormData directly)
export async function updateFairteilerAction(
  formData: FormData,
): Promise<ActionState<z.infer<typeof fairteilerProfileSchema>>> {
  try {
    const rawData = Object.fromEntries(formData.entries());

    const validation = fairteilerProfileSchema.safeParse({
      ...rawData,
      thumbnail: rawData.thumbnail ?? null,
    });

    if (!validation.success) {
      return {
        success: false,
        error: 'Ungültige Eingabedaten.',
        issues: validation.error.issues,
      };
    }

    const nextHeaders = await headers();

    const currentFairteiler = await getActiveFairteiler(nextHeaders);
    if (!currentFairteiler) {
      throw new AuthError('Authentifizierung fehlgeschlagen.');
    }

    const permissionResult = await checkPermissionOnServer(nextHeaders, {
      organization: ['update'],
    });

    if (!permissionResult.success) {
      throw new PermissionError('cannot update fairteiler');
    }

    const { thumbnail, ...otherValues } = validation.data;
    const newThumbnailUrl = await handleImageUpload(
      thumbnail,
      currentFairteiler.thumbnail,
      'fairteilerThumbnails',
    );

    const finalData = { ...otherValues, thumbnail: newThumbnailUrl };
    await updateFairteiler(currentFairteiler.id, finalData);

    return {
      success: true,
      message: 'Profil erfolgreich aktualisiert!',
      data: finalData,
    };
  } catch (error) {
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
      console.error(
        'Update Fairteiler BetterAuthError:',
        error.message,
        'Cause:',
        error.cause,
        error,
      );
      return { success: false, error: `Update fehlgeschlagen: ${message}` };
    }
    if (error instanceof PermissionError) {
      const message = getErrorMessage(
        'YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_ORGANIZATION',
        'de',
      );
      console.error('Update Fairteiler failed:', message);
      return { success: false, error: `Update fehlgeschlagen: ${message}` };
    }
    const message =
      error instanceof Error
        ? error.message
        : 'Ein unerwarteter Fehler ist aufgetreten.';
    console.error('Update Fairteiler Unexpected Error:', message, error);
    return { success: false, error: `Update fehlgeschlagen: ${message}` };
  }
}

const toggleDisabledSchema = z.object({
  fairteilerId: z.string(),
  disabled: z.boolean(),
});

export const toggleFairteilerDisabled = createAction({
  inputSchema: toggleDisabledSchema,
  handler: async ({ input }) => {
    const result = await toggleFairteilerVisibility(
      input.fairteilerId,
      input.disabled,
    );

    if (!result) {
      throw new NotFoundError('Toggle of Fairteiler visibility failed');
    }

    return {
      message: 'Visibility of Fairteiler changed successfully',
      data: result,
    };
  },
});

// Custom action for FormData handling (can't use createAction with FormData directly)
export async function updateUserAction(
  formData: FormData,
): Promise<ActionState<z.infer<typeof userProfileSchema>>> {
  try {
    const rawData = Object.fromEntries(formData.entries());

    const validation = userProfileSchema.safeParse({
      ...rawData,
      name: `${rawData.firstName as string} ${rawData.lastName as string}`,
      isAnonymous: rawData.isAnonymous === 'true',
      avatar: rawData.avatar ?? null,
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
    const currentUser = session.user;
    if (!currentUser) {
      throw new AuthError('Authentifizierung fehlgeschlagen.');
    }

    const { avatar, ...otherValues } = validation.data;
    const newAvatarUrl = await handleImageUpload(
      avatar,
      currentUser.image ?? null,
      'userAvatars',
    );

    const finalData = { ...otherValues, avatar: newAvatarUrl };

    await auth.api.updateUser({
      headers: nextHeaders,
      body: {
        ...otherValues,
        image: newAvatarUrl ?? undefined,
      },
    });

    return {
      success: true,
      message: 'Profil erfolgreich aktualisiert!',
      data: finalData,
    };
  } catch (error) {
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
      console.error(
        'Update User BetterAuthError:',
        error.message,
        'Cause:',
        error.cause,
        error,
      );
      return { success: false, error: `Update fehlgeschlagen: ${message}` };
    }
    if (error instanceof PermissionError) {
      const message = getErrorMessage(
        'YOU_ARE_NOT_ALLOWED_TO_UPDATE_USERS',
        'de',
      );
      console.error('Update User failed:', message);
      return { success: false, error: `Update fehlgeschlagen: ${message}` };
    }
    const message =
      error instanceof Error
        ? error.message
        : 'Ein unerwarteter Fehler ist aufgetreten.';
    console.error('Update User Unexpected Error:', message, error);
    return { success: false, error: `Update fehlgeschlagen: ${message}` };
  }
}

// Invitation check action
const checkInvitationSchema = z.object({
  invitationId: z.string().min(1),
});

export const checkInvitationAndUserAction = createAction({
  inputSchema: checkInvitationSchema,
  handler: async ({ input }) => {
    const result = await checkInvitationAndUser(input.invitationId);

    if (!result) {
      throw new NotFoundError('Invitation data');
    }

    return {
      message: 'Invitation details retrieved successfully',
      data: result,
    };
  },
});

export const addAccessViewAction = createAction({
  inputSchema: accessViewSchema,
  revalidate: '/hub/fairteiler/members',
  handler: async ({ input, headers }) => {
    const { name, role } = input;
    let newUserId: string | null = null;

    try {
      const permissionResult = await checkPermissionOnServer(headers, {
        member: ['create'],
      });

      if (!permissionResult.success) {
        throw new PermissionError(
          getErrorMessage('YOU_ARE_NOT_ALLOWED_TO_CREATE_USERS', 'de'),
        );
      }

      const fairteiler = await getActiveFairteiler(headers);
      if (!fairteiler) {
        throw new NotFoundError('Fairteiler nicht gefunden.');
      }

      const viewCount =
        fairteiler.members.filter((m) => m.user.email.startsWith(`${role}-`))
          .length + 1;
      const email = `${role}-${viewCount}@${fairteiler.slug}.local`;
      const password = generatePassword();

      const newUserResult = await auth.api.signUpEmail({
        body: {
          name,
          firstName: name,
          lastName: fairteiler.slug,
          isFirstLogin: true,
          isAnonymous: false,
          email,
          password,
        },
      });
      newUserId = newUserResult.user.id;

      await auth.api.addMember({
        body: { userId: newUserId, organizationId: fairteiler.id, role },
      });

      return {
        message: 'Zugangsprofil erfolgreich erstellt!',
        data: { email, password },
      };
    } catch (error) {
      if (newUserId) {
        console.warn(`Attempting to clean up orphaned user: ${newUserId}`);
        auth.api
          .removeUser({ body: { userId: newUserId } })
          .catch((cleanupErr) => {
            console.error(
              `CRITICAL: Failed to cleanup user ${newUserId} after failed addMember:`,
              cleanupErr,
            );
          });
      }
      throw error;
    }
  },
});

export const removeMemberAction = createAction({
  inputSchema: removeMemberSchema,
  revalidate: '/hub/fairteiler/members',
  handler: async ({ input, headers }) => {
    await auth.api.removeMember({
      headers,
      body: {
        organizationId: input.organizationId,
        memberIdOrEmail: input.email,
      },
    });
    return { message: `Mitglied ${input.email} wurde erfolgreich entfernt.` };
  },
});

export const updateMemberRoleAction = createAction({
  inputSchema: changeRoleSchema,
  revalidate: '/hub/fairteiler/members',
  handler: async ({ input, headers }) => {
    await auth.api.updateMemberRole({
      headers,
      body: { memberId: input.memberId, role: input.role },
    });

    if (input.role === MemberRolesEnum.OWNER) {
      await auth.api.setRole({
        headers,
        body: { role: 'admin', userId: input.userId },
      });
    }
    return { message: 'Rolle erfolgreich aktualisiert.' };
  },
});

export const inviteMemberAction = createAction({
  inputSchema: inviteMemberSchema,
  handler: async ({ input, headers }) => {
    await auth.api.createInvitation({
      headers,
      body: { email: input.email, role: input.role, resend: true },
    });
    return { message: `Einladung erfolgreich an ${input.email} gesendet!` };
  },
});

export const disableAccessViewAction = createAction({
  inputSchema: disableAccessViewSchema,
  revalidate: '/hub/fairteiler/members',
  handler: async ({ input, headers }) => {
    await auth.api.banUser({
      headers,
      body: { userId: input.userId, banReason: 'DISABLED ACCESS VIEW' },
    });
    const result = await auth.api.updateMemberRole({
      headers,
      body: { memberId: input.memberId, role: MemberRolesEnum.DISABLED },
    });
    return {
      success: true,
      message: 'Zugang erfolgreich deaktiviert.',
      data: result,
    };
  },
});

// Token validation action
const validateResetTokenSchema = z.object({
  token: z.string().min(1),
});

interface TokenValidationResult {
  isValid: boolean;
  reason?: 'invalid_or_expired' | 'validation_error';
}

export const validateResetPasswordTokenAction = createAction({
  inputSchema: validateResetTokenSchema,
  handler: async ({
    input,
  }): Promise<{ message: string; data: TokenValidationResult }> => {
    const result = await validateResetPasswordToken(input.token);
    if (!result) {
      return {
        message: 'Token validation completed',
        data: { isValid: false, reason: 'invalid_or_expired' },
      };
    }

    return {
      message: 'Token validation completed',
      data: { isValid: true },
    };
  },
});

// User security check action
const checkUserSecureStatusSchema = z.object({
  email: z.string().email({ message: 'Ungültige E-Mail-Adresse.' }),
});

interface UserSecureStatusResult {
  userExists: boolean;
  isSecure?: boolean;
}

export const checkUserSecureStatusAction = createAction({
  inputSchema: checkUserSecureStatusSchema,
  handler: async ({
    input,
  }): Promise<{ message: string; data: UserSecureStatusResult }> => {
    const result = await loadUserByEmail(input.email);

    if (!result) {
      return {
        message: 'User check completed',
        data: { userExists: false },
      };
    }

    return {
      message: 'User check completed',
      data: {
        userExists: true,
        isSecure: result.secure,
      },
    };
  },
});
