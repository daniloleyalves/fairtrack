'use server';

import { z } from 'zod';
import { authedAction } from '../_lib/safe-action';
import { insertAnnouncementDismissal } from './dal';

export const dismissAnnouncementAction = authedAction
  .inputSchema(z.object({ id: z.string().min(1) }))
  .action(async ({ parsedInput, ctx }) => {
    await insertAnnouncementDismissal(parsedInput.id, ctx.session.user.id);
  });
