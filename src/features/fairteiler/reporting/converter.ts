import { KeyFigure } from '@/features/statistics/components/key-figure';
import { VolumeDataPoint } from '@/features/statistics/components/volume-trend-chart';
import { vContribution } from '@/server/db/db-types';

export function getKeyFigures(filteredData: vContribution[]) {
  const totalQuantity = filteredData.reduce(
    (sum, contribution) => sum + contribution.quantity,
    0,
  );

  const totalContributions = filteredData.length;

  const uniqueContributors = new Set(
    filteredData.map((contribution) => contribution.contributorEmail),
  );
  const activeContributors = uniqueContributors.size;

  const averageContribution =
    totalContributions > 0 ? totalQuantity / totalContributions : 0;

  const keyFigures: KeyFigure[] = [
    {
      value: totalQuantity,
      description: 'gerettet',
      unit: 'kg',
      color: 'primary',
    },

    {
      value: totalContributions,
      description: 'Abgaben',
      unit: undefined,
      color: 'default',
    },
    {
      value: averageContribution,
      description: 'Ø Abgabemenge',
      unit: 'kg',
      color: 'default',
    },
    {
      value: activeContributors,
      description: 'Registrierte Nutzer',
      unit: undefined,
      color: 'default',
    },
  ];
  return keyFigures;
}

export function getVolumeTrendData(
  filteredData: vContribution[],
): VolumeDataPoint[] {
  // Step 2: Aggregate data by day
  const dailyTotals = new Map<string, number>();

  filteredData.forEach((contribution) => {
    const date = new Date(contribution.contributionDate);
    // Use a consistent key like 'YYYY-MM-DD' for sorting and grouping
    const dateKey = date.toISOString().split('T')[0];
    const currentTotal = dailyTotals.get(dateKey) ?? 0;
    dailyTotals.set(dateKey, currentTotal + contribution.quantity);
  });

  // Step 3: Convert map to sorted array for the chart
  const chartData = Array.from(dailyTotals.entries())
    .map(([dateKey, quantity]) => {
      const date = new Date(dateKey);
      return {
        date: date.toISOString().split('T')[0], // Keep raw date as YYYY-MM-DD
        quantity: parseFloat(quantity.toFixed(2)),
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return chartData;
}

// --- B. Variety & Sourcing Converters ---

export interface AttributeDataPoint {
  position: number;
  value: number;
  description: string;
  [key: string]: string | number;
}
export function getContributionsByCategory(
  filteredData: vContribution[],
): AttributeDataPoint[] {
  const totals = new Map<string, number>();
  filteredData.forEach((c) => {
    const categoryName = c.categoryName ?? 'Uncategorized';
    const currentTotal = totals.get(categoryName) ?? 0;
    totals.set(categoryName, currentTotal + c.quantity);
  });

  return Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1]) // Sort by quantity descending
    .map(([description, value], index) => ({
      position: index + 1, // Assign position 1, 2, 3...
      value: parseFloat(value.toFixed(2)),
      description,
    }));
}

// 2. For Contributions by Origin
export function getContributionsByOrigin(
  filteredData: vContribution[],
): AttributeDataPoint[] {
  const totals = new Map<string, number>();
  filteredData.forEach((c) => {
    const originName = c.originName ?? 'No Origin';
    const currentTotal = totals.get(originName) ?? 0;
    totals.set(originName, currentTotal + c.quantity);
  });

  return Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1]) // Sort by quantity descending
    .map(([description, value], index) => ({
      position: index + 1, // Assign position 1, 2, 3...
      value: parseFloat(value.toFixed(2)),
      description,
    }));
}

// 3. For Cooling Requirements
export interface CoolingDataPoint {
  name: 'Kühlen notwendig' | 'Kein Kühlen';
  quantity: number;
  fill: string;
}

export function getCoolingRequirements(data: vContribution[]) {
  const counts: Record<string, number> = {};

  data.forEach((c) => {
    let label: string;
    if (c.foodCool === true) label = 'Kühlung erforderlich';
    else if (c.foodCool === false) label = 'Keine Kühlung';
    else label = 'Unbekannt';

    counts[label] = (counts[label] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1]) // sort descending by value
    .map(([description, value], index) => ({
      position: index + 1, // highest count gets position 1
      value,
      description,
    }));
}

// 4. For Contributions by Company
export function getContributionsByCompany(
  filteredData: vContribution[],
): AttributeDataPoint[] {
  const totals = new Map<string, number>();
  filteredData.forEach((c) => {
    const companyName = c.companyName ?? 'No Company';
    const currentTotal = totals.get(companyName) ?? 0;
    totals.set(companyName, currentTotal + c.quantity);
  });

  return Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([description, value], index) => ({
      position: index + 1,
      value: parseFloat(value.toFixed(2)),
      description,
    }));
}
