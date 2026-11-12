'use client';

import * as announcementActions from '@server/announcement/actions';
import * as announcementQueries from '@server/announcement/queries';
import * as contributionActions from '@server/contribution/actions';
import * as contributionQueries from '@server/contribution/queries';
import * as fairteilerActions from '@server/fairteiler/actions';
import * as fairteilerQueries from '@server/fairteiler/queries';
import * as platformQueries from '@server/platform/queries';
import * as qrCodeActions from '@server/qr-code/actions';
import * as qrCodeQueries from '@server/qr-code/queries';
import * as tutorialActions from '@server/tutorial/actions';
import * as tutorialQueries from '@server/tutorial/queries';
import * as userActions from '@server/user/actions';
import * as userQueries from '@server/user/queries';
import * as authActions from '@/lib/auth/auth-actions';
import * as clientEnv from '@/lib/services/client-env';

// Next.js registers a server function only on pages whose client graph
// imports it. Posted to any other page, Next forwards it with a fetch to our
// own URL, which on Vercel can hang until the 300s timeout (FAIRTRACK-6B).
// Importing every client-called module in the hub layout registers them on
// all hub pages, so nothing gets forwarded.
const serverFunctionModules = [
  announcementActions,
  announcementQueries,
  contributionActions,
  contributionQueries,
  fairteilerActions,
  fairteilerQueries,
  platformQueries,
  qrCodeActions,
  qrCodeQueries,
  tutorialActions,
  tutorialQueries,
  userActions,
  userQueries,
  authActions,
  clientEnv,
];

export function ServerFunctionRegistry() {
  void serverFunctionModules;
  return null;
}
