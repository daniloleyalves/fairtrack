'use client';

import {
  adminClient,
  inferAdditionalFields,
  organizationClient,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import {
  ac,
  disabled,
  employee,
  guest,
  member,
  owner,
  viewer,
} from './auth-permissions';
import { toast } from 'sonner';
import { auth } from './auth';

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    organizationClient({
      ac: ac,
      roles: {
        owner,
        member,
        viewer,
        employee,
        guest,
        disabled,
      },
    }),
    inferAdditionalFields<typeof auth>(),
  ],
  fetchOptions: {
    onError(e) {
      // Rate limiting
      if (e.error.status === 429) {
        toast.error('Zu viele Anfragen. Bitte versuchen Sie es später erneut.');
        return;
      }

      // Authentication errors
      if (e.error.status === 401) {
        // toast.error('Sitzung abgelaufen. Bitte melden Sie sich erneut an.');
        // Don't auto-redirect here as it might cause loops
        return;
      }

      // Permission errors
      if (e.error.status === 403) {
        toast.error('Keine Berechtigung für diese Aktion.');
        return;
      }

      // Server errors
      if (e.error.status >= 500) {
        toast.error('Serverfehler. Bitte versuchen Sie es später erneut.');
        return;
      }

      // Network errors
      if (!e.error.status) {
        toast.error(
          'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.',
        );
        return;
      }

      // Generic error
      console.error('Auth client error:', e);
      toast.error('Ein Fehler ist aufgetreten.');
    },
    onRequest() {
      // Optional: Could add loading indicators here
    },
    onSuccess() {
      // Optional: Could clear error states here
    },
  },
});
