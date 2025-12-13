import 'server-only';

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { admin, organization } from 'better-auth/plugins';
import {
  ac,
  disabled,
  employee,
  guest,
  member,
  owner,
  viewer,
} from './auth-permissions';
import { db } from '@server/db/drizzle';
import {
  account,
  fairteiler,
  invitation,
  jwks,
  member as memberTable,
  session,
  user,
  verification,
} from '@server/db/schema';
import { resend } from '@/lib/services/resend';
import {
  getResetPasswordTemplate,
  getResetPasswordText,
} from '@/lib/services/resend/reset-password';
import {
  getInviteMemberTemplate,
  getInviteMemberText,
} from '@/lib/services/resend/invite-member';
import { updateUserSecureStatus } from '@server/dal';
import bcrypt from 'bcrypt';

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user,
      session,
      account,
      verification,
      fairteiler,
      member: memberTable,
      invitation,
      jwks,
    },
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  rateLimit: {
    enabled: process.env.NEXT_PUBLIC_ENV !== 'testing',
    window: 10,
    max: 100,
    // customRules: {
    //     "/example/path": {
    //         window: 10,
    //         max: 100
    //     }
    // },
    storage: 'memory',
    modelName: 'rateLimit',
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => ({
          data: {
            ...session,
            activeOrganizationId: await getActiveOrganizationId(session.userId),
          },
        }),
      },
    },
    account: {
      update: {
        after: async (_account, ctx) => {
          const body = ctx?.body as { token: string; newPassword?: string };
          const verificationEntry = await db.query.verification.findFirst({
            where: (verification, { eq }) =>
              eq(verification.identifier, `reset-password:${body.token}`),
          });

          if (!verificationEntry) {
            console.error('Could not find verification entry');
            return;
          }

          const user = await db.query.user.findFirst({
            where: (user, { eq }) => eq(user.id, verificationEntry.value),
          });

          if (!user) {
            console.error('Could not find user');
            return;
          }

          // Check if password field was updated in the account
          // This happens during password reset or password change operations
          const hasPasswordUpdate =
            body && 'newPassword' in (body as Record<string, unknown>);

          if (hasPasswordUpdate) {
            try {
              await updateUserSecureStatus(user.id, true);
              console.log(
                `User ${user.name} marked as secure after password update`,
              );
            } catch (error) {
              console.error('Failed to update user secure status:', error);
              // Don't throw here to avoid breaking the password update flow
            }
          }
        },
      },
    },
    // user: {
    //     create: {
    //         after: async (user) => {
    //             await auth.api.addMember({
    //                 body: {
    //                     userId: user.id,
    //                     organizationId: defaultOrganizationId,
    //                     role: 'disabled'
    //                 }
    //             });
    //         }
    //     }
    // }
  },
  plugins: [
    // jwt(),
    admin(),
    organization({
      schema: {
        organization: {
          modelName: 'fairteiler',
          additionalFields: {
            address: {
              type: 'string',
              required: false,
            },
            geoLink: {
              type: 'string',
              required: false,
            },
            website: {
              type: 'number',
              required: false,
            },
            thumbnail: {
              type: 'number',
              required: false,
            },
          },
        },
      },
      ac: ac,
      roles: {
        owner,
        member,
        viewer,
        employee,
        guest,
        disabled,
      },
      async sendInvitationEmail(data) {
        const inviteLink = `${process.env.NEXT_PUBLIC_ENV_URL}/sign-up?invitationId=${data.id}`;
        const { error } = await resend.emails.send({
          from: 'support@fairteiler-tracker.de',
          to: data.email,
          subject: 'FairTrack Fairteilereinladung',
          html: await getInviteMemberTemplate({
            url: inviteLink,
            fairteilerName: data.organization.name,
          }),
          text: getInviteMemberText({
            url: inviteLink,
            fairteilerName: data.organization.name,
          }),
        });
        if (error) {
          console.error('Failed to send invitation email:', error);
          throw new Error('Failed to send invitation email');
        }
      },
    }),
    nextCookies(),
  ],
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    password: {
      hash: async (password) => {
        return await bcrypt.hash(password, 10);
      },
      verify: async ({ hash, password }) => {
        return await bcrypt.compare(password, hash);
      },
    },
    sendResetPassword: async ({ user, url }) => {
      const { error } = await resend.emails.send({
        from: 'support@fairteiler-tracker.de',
        to: user.email,
        subject: 'FairTrack Passwort zurücksetzen',
        html: await getResetPasswordTemplate({ url }),
        text: getResetPasswordText({ url }),
      });
      if (error) {
        console.error('Failed to send reset password email:', error);
        throw new Error('Failed to send reset password email');
      }
    },
  },
  user: {
    additionalFields: {
      firstName: {
        type: 'string',
        required: true,
      },
      lastName: {
        type: 'string',
        required: true,
      },
      phone: {
        type: 'number',
        required: false,
      },
      foodsharingId: {
        type: 'number',
        required: false,
      },
      secure: {
        type: 'boolean',
        required: false,
      },
      isAnonymous: {
        type: 'boolean',
        required: true,
      },
      isFirstLogin: {
        type: 'boolean',
        required: true,
      },
      notificationsConsent: {
        type: 'boolean',
        required: false,
      },
    },
    deleteUser: {
      enabled: true,
    },
  },
});

export async function getActiveOrganizationId(
  userId: string,
): Promise<string | null> {
  const result = await db.query.member.findFirst({
    where: (member, { eq }) => eq(member.userId, userId),
  });
  // Assuming userId is unique and only one result is expected
  return result?.organizationId ?? null;
}

/**
 * Checks permissions on the server by forwarding the request headers and
 * permission checks to the authentication service.
 * @param headers The incoming request headers.
 * @param checks An object specifying the permissions to check.
 *               Example: { "dashboard": ["read"], "settings": ["read", "write"] }
 */
export async function checkPermissionOnServer(
  headers: Headers,
  checks: Record<string, string[]>,
) {
  console.log('SERVER: Forwarding permission check to auth service.');
  return auth.api.hasPermission({
    headers: headers,
    body: {
      permission: checks,
    },
  });
}
