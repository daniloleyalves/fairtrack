'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import z from 'zod';
import { checkInvitationAndUser } from '@server/contribution/dal';
import {
  loadMemberById,
  toggleFairteilerVisibility,
  updateFairteiler,
} from '@server/fairteiler/dal';
import { loadUserByEmail, validateResetPasswordToken } from '@server/user/dal';
import { getActiveFairteiler } from '@server/fairteiler/queries';
import { auth, checkPermissionOnServer } from './auth';
import { generatePassword, getErrorMessage } from './auth-helpers';
import { MemberRolesEnum } from './auth-permissions';
import { fairteilerProfileSchema } from '../../features/fairteiler/profile/schemas/fairteiler-profile-schema';
import {
  action,
  authedAction,
  fairteilerAction,
} from '@server/_lib/safe-action';
import {
  accessViewSchema,
  changeRoleSchema,
  disableAccessViewSchema,
  inviteMemberSchema,
  removeMemberSchema,
} from '@/features/fairteiler/members/schemas/members-schema';
import { NotFoundError, PermissionError } from '@/server/error-handling';
import { handleImageUpload } from '@/server/api-helpers';
import { userProfileSchema } from '@/features/user/settings/schemas/user-profile-schema';

export const signOutAction = action
  .inputSchema(z.object({}))
  .action(async () => {
    await auth.api.signOut({ headers: await headers() });
    return {
      redirectTo: '/sign-in',
      shouldRefresh: true,
    };
  });

export const updateFairteilerAction = fairteilerAction
  .inputSchema(fairteilerProfileSchema)
  .action(async ({ parsedInput }) => {
    const currentFairteiler = await getActiveFairteiler();

    const permissionResult = await checkPermissionOnServer(await headers(), {
      organization: ['update'],
    });
    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const { thumbnail, ...otherValues } = parsedInput;
    const newThumbnailUrl = await handleImageUpload(
      thumbnail,
      currentFairteiler.thumbnail,
      'fairteilerThumbnails',
    );

    const finalData = { ...otherValues, thumbnail: newThumbnailUrl };
    await updateFairteiler(currentFairteiler.id, finalData);
    return finalData;
  });

const toggleDisabledSchema = z.object({
  disabled: z.boolean(),
});

export const toggleFairteilerDisabled = fairteilerAction
  .inputSchema(toggleDisabledSchema)
  .action(async ({ parsedInput, ctx }) => {
    const permissionResult = await checkPermissionOnServer(await headers(), {
      organization: ['update'],
    });
    if (!permissionResult.success) {
      throw new PermissionError(
        'Du bist nicht befugt diese Aktion auszuführen',
      );
    }

    const result = await toggleFairteilerVisibility(
      ctx.fairteilerId,
      parsedInput.disabled,
    );
    if (!result) {
      throw new NotFoundError('Toggle of Fairteiler visibility failed');
    }
    return result;
  });

export const updateUserAction = authedAction
  .inputSchema(userProfileSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { avatar, ...otherValues } = parsedInput;
    const newAvatarUrl = await handleImageUpload(
      avatar,
      ctx.session.user.image ?? null,
      'userAvatars',
    );
    const name = `${otherValues.firstName} ${otherValues.lastName}`.trim();

    const finalData = { ...otherValues, name, avatar: newAvatarUrl };

    await auth.api.updateUser({
      headers: await headers(),
      body: {
        ...otherValues,
        name,
        image: newAvatarUrl ?? undefined,
      },
    });

    return finalData;
  });

const checkInvitationSchema = z.object({
  invitationId: z.string().min(1),
});

export const checkInvitationAndUserAction = action
  .inputSchema(checkInvitationSchema)
  .action(async ({ parsedInput }) => {
    const result = await checkInvitationAndUser(parsedInput.invitationId);
    if (!result) {
      throw new NotFoundError('Invitation data');
    }
    return result;
  });

export const addAccessViewAction = fairteilerAction
  .inputSchema(accessViewSchema)
  .action(async ({ parsedInput }) => {
    const { name, role } = parsedInput;
    let newUserId: string | null = null;

    try {
      const permissionResult = await checkPermissionOnServer(await headers(), {
        member: ['create'],
      });
      if (!permissionResult.success) {
        throw new PermissionError(
          getErrorMessage('YOU_ARE_NOT_ALLOWED_TO_CREATE_USERS', 'de'),
        );
      }

      const fairteiler = await getActiveFairteiler();
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

      revalidatePath('/hub/fairteiler/members');
      return { email, password };
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
  });

export const removeMemberAction = authedAction
  .inputSchema(removeMemberSchema)
  .action(async ({ parsedInput }) => {
    await auth.api.removeMember({
      headers: await headers(),
      body: {
        organizationId: parsedInput.organizationId,
        memberIdOrEmail: parsedInput.email,
      },
    });
    revalidatePath('/hub/fairteiler/members');
  });

export const updateMemberRoleAction = fairteilerAction
  .inputSchema(changeRoleSchema)
  .action(async ({ parsedInput, ctx }) => {
    const reqHeaders = await headers();
    await auth.api.updateMemberRole({
      headers: reqHeaders,
      body: { memberId: parsedInput.memberId, role: parsedInput.role },
    });

    if (parsedInput.role === MemberRolesEnum.OWNER) {
      const targetMember = await loadMemberById(
        parsedInput.memberId,
        ctx.fairteilerId,
      );
      if (!targetMember) {
        throw new NotFoundError('Member', parsedInput.memberId);
      }
      await auth.api.setRole({
        headers: reqHeaders,
        body: { role: 'admin', userId: targetMember.userId },
      });
    }
    revalidatePath('/hub/fairteiler/members');
  });

export const inviteMemberAction = authedAction
  .inputSchema(inviteMemberSchema)
  .action(async ({ parsedInput }) => {
    await auth.api.createInvitation({
      headers: await headers(),
      body: {
        email: parsedInput.email,
        role: parsedInput.role,
        resend: true,
      },
    });
  });

export const disableAccessViewAction = authedAction
  .inputSchema(disableAccessViewSchema)
  .action(async ({ parsedInput }) => {
    const reqHeaders = await headers();
    await auth.api.banUser({
      headers: reqHeaders,
      body: { userId: parsedInput.userId, banReason: 'DISABLED ACCESS VIEW' },
    });
    const result = await auth.api.updateMemberRole({
      headers: reqHeaders,
      body: { memberId: parsedInput.memberId, role: MemberRolesEnum.DISABLED },
    });
    revalidatePath('/hub/fairteiler/members');
    return result;
  });

const validateResetTokenSchema = z.object({
  token: z.string().min(1),
});

interface TokenValidationResult {
  isValid: boolean;
  reason?: 'invalid_or_expired' | 'validation_error';
}

export const validateResetPasswordTokenAction = action
  .inputSchema(validateResetTokenSchema)
  .action(async ({ parsedInput }): Promise<TokenValidationResult> => {
    const result = await validateResetPasswordToken(parsedInput.token);
    if (!result) {
      return { isValid: false, reason: 'invalid_or_expired' };
    }
    return { isValid: true };
  });

const checkUserSecureStatusSchema = z.object({
  email: z.string().email({ message: 'Ungültige E-Mail-Adresse.' }),
});

interface UserSecureStatusResult {
  userExists: boolean;
  isSecure?: boolean;
}

export const checkUserSecureStatusAction = action
  .inputSchema(checkUserSecureStatusSchema)
  .action(async ({ parsedInput }): Promise<UserSecureStatusResult> => {
    const result = await loadUserByEmail(parsedInput.email);
    if (!result) {
      return { userExists: false };
    }
    return {
      userExists: true,
      isSecure: result.secure,
    };
  });
