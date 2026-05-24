import 'server-only';
import { loadAuthenticatedSession } from '../dal';
import { AuthError } from '../api-helpers';
import { StepFlowProgress } from '../db/db-types';
import { loadFairteilerTutorialWithSteps, loadStepFlowProgress } from './dal';

export async function getFairteilerTutorialWithSteps(
  headers: Headers,
  fairteilerId?: string,
) {
  let fairteilerIdentifier;

  if (fairteilerId) {
    fairteilerIdentifier = fairteilerId;
  } else {
    const session = await loadAuthenticatedSession(headers);
    fairteilerIdentifier = session.session.activeOrganizationId;
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
