'use server';
import { headers } from 'next/headers';
import { loadAuthenticatedSession } from '../user/dal';
import { AuthError } from '../api-helpers';
import { StepFlowProgress } from '../db/db-types';
import { loadFairteilerTutorialWithSteps, loadStepFlowProgress } from './dal';

export async function getFairteilerTutorialWithSteps(fairteilerId?: string) {
  let fairteilerIdentifier = fairteilerId;

  if (!fairteilerIdentifier) {
    const session = await loadAuthenticatedSession(await headers());
    fairteilerIdentifier = session.session.activeOrganizationId ?? undefined;
  }

  if (!fairteilerIdentifier) {
    throw new AuthError('No active organization.');
  }

  return await loadFairteilerTutorialWithSteps(fairteilerIdentifier);
}

/**
 * Get contribution tutorial progress for the authenticated user
 */
export async function getContributionTutorialProgress(
  headers: Headers,
  fairteilerId: string,
): Promise<StepFlowProgress | null | undefined> {
  const session = await loadAuthenticatedSession(headers);
  const userId = session.user.id;

  if (!userId) {
    throw new AuthError('No active session.');
  }

  const flowId = `contribution-tutorial-${fairteilerId}`;

  const stepFlowProgress = await loadStepFlowProgress(userId, flowId);

  return stepFlowProgress;
}
