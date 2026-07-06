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
import { updateUserSecureStatus } from '@server/user/dal';

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  advanced: {
    disableCSRFCheck: process.env.NEXT_PUBLIC_ENV === 'testing',
  },
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
    freshAge: 0,
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
        after: async (account, ctx) => {
          const body = ctx?.body as { newPassword?: string } | undefined;
          if (!body?.newPassword) return;
          try {
            await updateUserSecureStatus(account.userId, true);
          } catch (error) {
            console.error('Failed to update user secure status:', error);
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
      requireEmailVerificationOnInvitation: false,
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
        if (
          process.env.NEXT_PUBLIC_ENV === 'testing' ||
          process.env.NEXT_PUBLIC_ENV === 'demo'
        ) {
          console.log('Skipping invitation email in test environment');
          return;
        }
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
    onPasswordReset: async ({ user }) => {
      try {
        await updateUserSecureStatus(user.id, true);
      } catch (error) {
        console.error('Failed to update user secure status:', error);
      }
    },
    sendResetPassword: async ({ user, url }) => {
      if (
        process.env.NEXT_PUBLIC_ENV === 'testing' ||
        process.env.NEXT_PUBLIC_ENV === 'demo'
      ) {
        console.log('Skipping reset password email in test environment');
        return;
      }
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
        type: 'string',
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
      permissions: checks,
    },
  });
}
