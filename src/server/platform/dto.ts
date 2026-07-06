import 'server-only';
import {
  loadCategoryDistribution,
  loadKeyFigures,
  loadOriginDistribution,
} from '../contribution/dal';
import { loadFairteilers } from '../fairteiler/dal';
import { initialContributionQuantity } from '@/lib/config/site-config';
import { formatNumber } from '@/lib/utils';

/**
 * Public platform stats endpoint - no authentication required.
 * Returns aggregated key data across all fairteilers.
 */
export async function getPlatformStats() {
  const [keyFigures, categoryDistribution, originDistribution, fairteilers] =
    await Promise.all([
      loadKeyFigures(),
      loadCategoryDistribution(),
      loadOriginDistribution(),
      loadFairteilers(),
    ]);

  const totalQuantityInKg =
    parseFloat(keyFigures?.[0]?.totalQuantity ?? '0') +
    initialContributionQuantity;

  return {
    keyFigures: {
      totalQuantityInKg: formatNumber(totalQuantityInKg, 2),
      totalContributions: formatNumber(
        keyFigures?.[0]?.totalContributions ?? 0,
      ),
      activeContributors: formatNumber(
        keyFigures?.[0]?.activeContributors ?? 0,
      ),
      totalFairteilers: formatNumber(fairteilers?.length ?? 0),
    },
    categoryDistribution:
      categoryDistribution?.map((item) => ({
        name: item.name ?? 'Unkategorisiert',
        totalQuantityInKg: formatNumber(
          parseFloat(item.totalQuantity ?? '0'),
          2,
        ),
      })) ?? [],
    originDistribution:
      originDistribution?.map((item) => ({
        name: item.name ?? 'Unbekannt',
        totalQuantityInKg: formatNumber(
          parseFloat(item.totalQuantity ?? '0'),
          2,
        ),
      })) ?? [],
  };
}
