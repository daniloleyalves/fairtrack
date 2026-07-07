'use server';
import {
  loadCategoryDistribution,
  loadKeyFigures,
  loadOriginDistribution,
  loadQuantityByFairteiler,
} from '../contribution/dal';
import { loadFairteilers } from '../fairteiler/dal';
import { initialContributionQuantity } from '@/lib/config/site-config';
import { formatNumber } from '@/lib/utils';

export interface DistributionShare {
  name: string;
  kg: number;
  share: number;
}

export interface PublicImpactStats {
  totalQuantityKg: number;
  trackedQuantityKg: number;
  totalContributions: number;
  activeContributors: number;
  totalFairteilers: number;
  categoryShares: DistributionShare[];
  originShares: DistributionShare[];
}

const MAX_DISTRIBUTION_ROWS = 6;

function toShares(
  items:
    | { name: string | null; totalQuantity: string | null }[]
    | null
    | undefined,
  fallbackName: string,
  tailName: string,
): DistributionShare[] {
  const parsed = (items ?? [])
    .map((item) => ({
      name: item.name ?? fallbackName,
      kg: parseFloat(item.totalQuantity ?? '0'),
    }))
    .filter((item) => item.kg > 0)
    .sort((a, b) => b.kg - a.kg);

  const total = parsed.reduce((acc, item) => acc + item.kg, 0);
  if (total <= 0) return [];

  const head = parsed.slice(0, MAX_DISTRIBUTION_ROWS);
  const tail = parsed.slice(MAX_DISTRIBUTION_ROWS);
  const tailKg = tail.reduce((acc, item) => acc + item.kg, 0);
  const rows = tailKg > 0 ? [...head, { name: tailName, kg: tailKg }] : head;

  return rows.map((row) => ({ ...row, share: row.kg / total }));
}

/**
 * Public impact stats for the marketing pages - no authentication required.
 * Returns raw numbers (for animated counters and bar widths) instead of
 * the pre-formatted strings of getPlatformStats.
 */
export async function getPublicImpactStats(): Promise<PublicImpactStats> {
  const [keyFigures, categoryDistribution, originDistribution, fairteilers] =
    await Promise.all([
      loadKeyFigures(),
      loadCategoryDistribution(),
      loadOriginDistribution(),
      loadFairteilers(),
    ]);

  const trackedQuantityKg = parseFloat(keyFigures?.[0]?.totalQuantity ?? '0');

  return {
    totalQuantityKg: trackedQuantityKg + initialContributionQuantity,
    trackedQuantityKg,
    totalContributions: keyFigures?.[0]?.totalContributions ?? 0,
    activeContributors: keyFigures?.[0]?.activeContributors ?? 0,
    totalFairteilers: fairteilers?.length ?? 0,
    categoryShares: toShares(
      categoryDistribution,
      'Unkategorisiert',
      'Weitere Kategorien',
    ),
    originShares: toShares(
      originDistribution,
      'Unbekannt',
      'Weitere Herkünfte',
    ),
  };
}

/**
 * Total tracked quantity per fairteiler - public, used by the directory page.
 */
export async function getFairteilerQuantities(): Promise<
  Record<string, number>
> {
  const rows = await loadQuantityByFairteiler();
  return Object.fromEntries(
    (rows ?? []).map((row) => [
      row.fairteilerId,
      parseFloat(row.totalQuantity ?? '0'),
    ]),
  );
}

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
