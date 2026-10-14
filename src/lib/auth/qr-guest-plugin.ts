import 'server-only';
import type { BetterAuthPlugin } from 'better-auth';
import { APIError, createAuthEndpoint } from 'better-auth/api';
import { setSessionCookie } from 'better-auth/cookies';
import { loadScanContext } from '@/server/qr-code/scan-context';

export const qrGuestPlugin = () =>
  ({
    id: 'qr-guest',
    schema: {
      session: {
        fields: {
          qrCodeId: { type: 'string', required: false, input: false },
        },
      },
    },
    endpoints: {
      signInQrGuest: createAuthEndpoint(
        '/qr-guest/sign-in',
        { method: 'POST', metadata: { SERVER_ONLY: true } },
        async (ctx) => {
          const scan = await loadScanContext();
          if (!scan?.guestAccessViewId) {
            throw new APIError('FORBIDDEN', {
              message:
                'Bitte scanne den QR-Code am Fairteiler erneut, um als Gast beizutragen.',
            });
          }

          const user = await ctx.context.internalAdapter.findUserById(
            scan.guestAccessViewId,
          );
          if (!user) {
            throw new APIError('FORBIDDEN', {
              message:
                'Für diesen Fairteiler ist gerade kein Gastzugang eingerichtet.',
            });
          }

          const session = await ctx.context.internalAdapter.createSession(
            user.id,
            true,
            { expiresAt: scan.expiresAt, qrCodeId: scan.qrCodeId },
            true,
          );
          await setSessionCookie(ctx, { session, user }, true);

          return ctx.json({ success: true });
        },
      ),
    },
  }) satisfies BetterAuthPlugin;
