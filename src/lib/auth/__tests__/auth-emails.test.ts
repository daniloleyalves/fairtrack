import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vite-plus/test';
import { randomUUID } from 'node:crypto';
import { betterAuth } from 'better-auth';
import { memoryAdapter } from 'better-auth/adapters/memory';
import { organization } from 'better-auth/plugins';
import {
  createCaptureTransport,
  type CaptureTransport,
} from '@/lib/services/resend/capture-transport';
import { setEmailTransport } from '@/lib/services/resend';
import { sendInvitationEmail, sendResetPasswordEmail } from '../auth-emails';
import { auth as appAuth } from '../auth';

vi.mock('@server/db/drizzle', () => ({ db: {} }));

const BASE_URL = 'https://env.fairtrack.test';
const APP_URL = 'https://app.fairtrack.test';
const PASSWORD = randomUUID();
const NEW_PASSWORD = randomUUID();

let mail: CaptureTransport;

beforeEach(() => {
  mail = createCaptureTransport();
  setEmailTransport(mail);
  vi.stubEnv('NEXT_PUBLIC_ENV_URL', APP_URL);
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  setEmailTransport(undefined);
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function createTestAuth() {
  return betterAuth({
    baseURL: BASE_URL,
    secret: randomUUID(),
    database: memoryAdapter({
      user: [],
      session: [],
      account: [],
      verification: [],
      organization: [],
      member: [],
      invitation: [],
    }),
    rateLimit: { enabled: false },
    emailAndPassword: {
      enabled: true,
      sendResetPassword: sendResetPasswordEmail,
    },
    plugins: [organization({ sendInvitationEmail })],
  });
}

type TestAuth = ReturnType<typeof createTestAuth>;

async function signUp(auth: TestAuth, email: string, password = PASSWORD) {
  const { headers } = await auth.api.signUpEmail({
    body: { email, password, name: email.split('@')[0] },
    returnHeaders: true,
  });
  const cookie = headers.get('set-cookie')?.split(';')[0] ?? '';
  return new Headers({ cookie });
}

describe('auth email wiring', () => {
  it('uses the shared senders in the app auth config', () => {
    expect(appAuth.options.emailAndPassword?.sendResetPassword).toBe(
      sendResetPasswordEmail,
    );
    const organizationPlugin = appAuth.options.plugins?.find(
      (plugin) => plugin.id === 'organization',
    ) as { options?: { sendInvitationEmail?: unknown } } | undefined;
    expect(organizationPlugin?.options?.sendInvitationEmail).toBe(
      sendInvitationEmail,
    );
  });
});

describe('password reset email', () => {
  it('sends a reset link that resolves to a valid token on the same environment', async () => {
    const auth = createTestAuth();
    await signUp(auth, 'jane@example.com');

    await auth.api.requestPasswordReset({
      body: { email: 'jane@example.com', redirectTo: '/reset-password' },
    });

    expect(mail.sent).toHaveLength(1);
    const [email] = mail.sent;
    expect(email.from).toBe('support@fairteiler-tracker.de');
    expect(email.to).toEqual(['jane@example.com']);
    expect(email.subject).toBe('FairTrack Passwort zurücksetzen');
    const resetLinks = email.links.filter((href) =>
      href.includes('/reset-password/'),
    );
    expect(resetLinks).toHaveLength(1);

    const link = new URL(resetLinks[0]);
    expect(link.origin).toBe(BASE_URL);
    expect(link.pathname).toMatch(/^\/api\/auth\/reset-password\/[\w-]+$/);
    expect(link.searchParams.get('callbackURL')).toBe('/reset-password');
    expect(email.html).toContain(`href="${resetLinks[0]}"`);
    expect(email.text).toContain(resetLinks[0]);

    const callback = await auth.handler(new Request(link));
    expect(callback.status).toBe(302);
    const redirect = new URL(callback.headers.get('location') ?? '');
    expect(redirect.origin).toBe(BASE_URL);
    expect(redirect.pathname).toBe('/reset-password');
    const token = redirect.searchParams.get('token');
    expect(token).toBe(link.pathname.split('/').pop());

    await auth.api.resetPassword({
      body: { token: token!, newPassword: NEW_PASSWORD },
    });
    await expect(
      auth.api.signInEmail({
        body: { email: 'jane@example.com', password: NEW_PASSWORD },
      }),
    ).resolves.toMatchObject({ user: { email: 'jane@example.com' } });

    const reused = await auth.handler(new Request(link));
    expect(reused.headers.get('location')).toContain('error=INVALID_TOKEN');
  });

  it('is not sent for an unknown email address', async () => {
    const auth = createTestAuth();

    await auth.api.requestPasswordReset({
      body: { email: 'nobody@example.com', redirectTo: '/reset-password' },
    });

    expect(mail.sent).toHaveLength(0);
  });

  it('throws when the transport reports an error', async () => {
    setEmailTransport({
      send: () =>
        Promise.resolve({ data: null, error: { message: 'rejected' } }),
    });

    await expect(
      sendResetPasswordEmail({
        user: { email: 'jane@example.com' },
        url: `${BASE_URL}/api/auth/reset-password/abc`,
      }),
    ).rejects.toThrow('Failed to send reset password email');
  });
});

describe('invitation email', () => {
  it('sends the invitee a sign-up link with the invitation id', async () => {
    const auth = createTestAuth();
    const ownerHeaders = await signUp(auth, 'owner@example.com');
    const fairteiler = await auth.api.createOrganization({
      headers: ownerHeaders,
      body: { name: 'Raupe Immersatt', slug: 'raupe-immersatt' },
    });

    const invitation = await auth.api.createInvitation({
      headers: ownerHeaders,
      body: {
        email: 'invitee@example.com',
        role: 'member',
        organizationId: fairteiler!.id,
      },
    });

    expect(mail.sent).toHaveLength(1);
    const [email] = mail.sent;
    expect(email.from).toBe('support@fairteiler-tracker.de');
    expect(email.to).toEqual(['invitee@example.com']);
    expect(email.subject).toBe('FairTrack Fairteilereinladung');
    expect(email.text).toContain('Raupe Immersatt');
    expect(email.html).toContain('Raupe Immersatt');
    const inviteLink = `${APP_URL}/sign-up?invitationId=${invitation.id}`;
    expect(email.links).toContain(inviteLink);
    expect(email.text).toContain(inviteLink);
    expect(email.links.filter((href) => href.includes('/sign-up'))).toEqual([
      inviteLink,
    ]);
  });

  it('is not sent when the inviter is not a member of the fairteiler', async () => {
    const auth = createTestAuth();
    const ownerHeaders = await signUp(auth, 'owner@example.com');
    const outsiderHeaders = await signUp(auth, 'outsider@example.com');
    const fairteiler = await auth.api.createOrganization({
      headers: ownerHeaders,
      body: { name: 'Raupe Immersatt', slug: 'raupe-immersatt' },
    });

    await expect(
      auth.api.createInvitation({
        headers: outsiderHeaders,
        body: {
          email: 'invitee@example.com',
          role: 'member',
          organizationId: fairteiler!.id,
        },
      }),
    ).rejects.toThrow();

    expect(mail.sent).toHaveLength(0);
  });

  it('throws when the transport reports an error', async () => {
    setEmailTransport({
      send: () =>
        Promise.resolve({ data: null, error: { message: 'rejected' } }),
    });

    await expect(
      sendInvitationEmail({
        id: 'inv-1',
        email: 'invitee@example.com',
        organization: { name: 'Raupe Immersatt' },
      }),
    ).rejects.toThrow('Failed to send invitation email');
  });
});
