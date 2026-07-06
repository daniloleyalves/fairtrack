'use server';
import { loadAuthenticatedSession } from '../user/dal';
import { loadMembership } from '../fairteiler/dal';
import { AuthError } from '../api-helpers';
import { PermissionError } from '../error-handling';
import { StepFlowProgress } from '../db/db-types';
import { loadFairteilerTutorialWithSteps, loadStepFlowProgress } from './dal';

export async function getFairteilerTutorialWithSteps(
  headers: Headers,
  fairteilerId?: string,
) {
  const session = await loadAuthenticatedSession(headers);
  let fairteilerIdentifier: string | undefined = fairteilerId;

  if (!fairteilerIdentifier) {
    fairteilerIdentifier = session.session.activeOrganizationId ?? undefined;
  } else if (fairteilerIdentifier !== session.session.activeOrganizationId) {
    const membership = await loadMembership(
      session.user.id,
      fairteilerIdentifier,
    );
    if (!membership) {
      throw new PermissionError('Kein Zugriff auf diesen Fairteiler.');
    }
  }

  if (!fairteilerIdentifier) {
    throw new AuthError('No active organization.');
  }

  const fairteilerTutorialWithSteps =
    await loadFairteilerTutorialWithSteps(fairteilerIdentifier);

  return fairteilerTutorialWithSteps;
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
