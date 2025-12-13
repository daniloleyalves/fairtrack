import { AttributeDataPoint } from '@/features/fairteiler/reporting/converter';
import { KeyFigure } from '@/features/statistics/components/key-figure';
import { VolumeDataPoint } from '@/features/statistics/components/volume-trend-chart';
import { vContribution } from '@/server/db/db-types';

export function getPlatformKeyFigures(
  filteredData: vContribution[],
): KeyFigure[] {
  const totalQuantity = filteredData.reduce(
    (sum, contribution) => sum + contribution.quantity,
    0,
  );

  const totalContributions = filteredData.length;

  const uniqueContributors = new Set(
    filteredData.map((contribution) => contribution.contributorEmail),
  );
  const activeContributors = uniqueContributors.size;

  const uniqueFairteilers = new Set(
    filteredData.map((contribution) => contribution.fairteilerId),
  );
  const activeFairteilers = uniqueFairteilers.size;

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
      value: activeFairteilers,
      description: 'Aktive Fairteiler',
      unit: undefined,
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

export function getPlatformVolumeTrendData(
  filteredData: vContribution[],
): VolumeDataPoint[] {
  const dailyTotals = new Map<string, number>();

  filteredData.forEach((contribution) => {
    const date = new Date(contribution.contributionDate);
    const dateKey = date.toISOString().split('T')[0];
    const currentTotal = dailyTotals.get(dateKey) ?? 0;
    dailyTotals.set(dateKey, currentTotal + contribution.quantity);
  });

  const chartData = Array.from(dailyTotals.entries())
    .map(([dateKey, quantity]) => {
      return {
        date: dateKey, // Keep raw date as YYYY-MM-DD
        quantity: parseFloat(quantity.toFixed(2)),
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return chartData;
}

export function getPlatformContributionsByCategory(
  filteredData: vContribution[],
): AttributeDataPoint[] {
  const totals = new Map<string, number>();
  filteredData.forEach((c) => {
    const categoryName = c.categoryName ?? 'Uncategorized';
    const currentTotal = totals.get(categoryName) ?? 0;
    totals.set(categoryName, currentTotal + c.quantity);
  });

  return Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([description, value], index) => ({
      position: index + 1,
      value: parseFloat(value.toFixed(2)),
      description,
    }));
}

export function getPlatformContributionsByOrigin(
  filteredData: vContribution[],
): AttributeDataPoint[] {
  const totals = new Map<string, number>();
  filteredData.forEach((c) => {
    const originName = c.originName ?? 'No Origin';
    const currentTotal = totals.get(originName) ?? 0;
    totals.set(originName, currentTotal + c.quantity);
  });

  return Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([description, value], index) => ({
      position: index + 1,
      value: parseFloat(value.toFixed(2)),
      description,
    }));
}

export function getPlatformContributionsByCompany(
  filteredData: vContribution[],
): AttributeDataPoint[] {
  const totals = new Map<string, number>();
  filteredData.forEach((c) => {
    const companyName = c.companyName ?? 'Nicht angegeben';
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

export function getPlatformContributionsByFairteiler(
  filteredData: vContribution[],
): AttributeDataPoint[] {
  const totals = new Map<string, number>();
  filteredData.forEach((c) => {
    const fairteilerName = c.fairteilerName ?? 'Unknown Fairteiler';
    const currentTotal = totals.get(fairteilerName) ?? 0;
    totals.set(fairteilerName, currentTotal + c.quantity);
  });

  return Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([description, value], index) => ({
      position: index + 1,
      value: parseFloat(value.toFixed(2)),
      description,
    }));
}

export function getPlatformCoolingRequirements(
  filteredData: vContribution[],
): AttributeDataPoint[] {
  const counts: Record<string, number> = {};

  filteredData.forEach((c) => {
    let label: string;
    if (c.foodCool === true) label = 'Kühlung erforderlich';
    else if (c.foodCool === false) label = 'Keine Kühlung';
    else label = 'Unbekannt';

    counts[label] = (counts[label] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([description, value], index) => ({
      position: index + 1,
      value,
      description,
    }));
}

export interface CalendarDataPoint {
  value: string;
  quantity: number;
}

export function getPlatformCalendarData(
  filteredData: vContribution[],
): CalendarDataPoint[] {
  const dailyTotals = new Map<string, number>();

  filteredData.forEach((contribution) => {
    const date = new Date(contribution.contributionDate);
    const dateKey = date.toISOString().split('T')[0];
    const currentTotal = dailyTotals.get(dateKey) ?? 0;
    dailyTotals.set(dateKey, currentTotal + contribution.quantity);
  });

  return Array.from(dailyTotals.entries())
    .map(([dateKey, quantity]) => ({
      value: dateKey,
      quantity: parseFloat(quantity.toFixed(2)),
    }))
    .sort((a, b) => new Date(a.value).getTime() - new Date(b.value).getTime());
}
