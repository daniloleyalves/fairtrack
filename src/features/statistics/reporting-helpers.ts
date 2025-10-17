import { vContribution } from '@/server/db/db-types';
import { ReportFilters } from './types';

export function applyFilters(
  data: vContribution[],
  filters: ReportFilters,
): vContribution[] {
  return data.filter((c) => {
    // Date Range
    if (filters.dateRange) {
      const itemDate = new Date(c.contributionDate);
      if (isNaN(itemDate.getTime())) return false;

      const fromDate = filters.dateRange.from
        ? new Date(filters.dateRange.from)
        : null;
      const toDate = filters.dateRange.to
        ? new Date(filters.dateRange.to)
        : null;

      if (toDate) toDate.setHours(23, 59, 59, 999);

      const isAfterFrom = fromDate ? itemDate >= fromDate : true;
      const isBeforeTo = toDate ? itemDate <= toDate : true;

      if (!(isAfterFrom && isBeforeTo)) return false;
    }

    // Normalize values
    const category = c.categoryName ?? 'Unbekannte Kategorie';
    const origin = c.originName ?? 'Unbekannte Herkunft';
    const company = c.companyName ?? 'Unbekannter Betrieb';
    const cool =
      c.foodCool === true
        ? 'Kühlung erforderlich'
        : c.foodCool === false
          ? 'Keine Kühlung'
          : 'Unbekannt';
    const fairteiler = c.fairteilerName || 'Unbekannter Fairteiler';

    // Apply filters
    if (filters.category?.length && !filters.category.includes(category)) {
      return false;
    }

    if (filters.origin?.length && !filters.origin.includes(origin)) {
      return false;
    }

    if (filters.company?.length && !filters.company.includes(company)) {
      return false;
    }

    if (filters.cool?.length && !filters.cool.includes(cool)) {
      return false;
    }

    if (
      filters.fairteiler?.length &&
      !filters.fairteiler.includes(fairteiler)
    ) {
      return false;
    }

    return true;
  });
}
