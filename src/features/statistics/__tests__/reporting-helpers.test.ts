import { describe, it, expect } from 'vitest';
import { applyFilters } from '../reporting-helpers';
import { vContribution } from '@/server/db/db-types';

const createContribution = (
  overrides: Partial<vContribution> = {},
): vContribution => ({
  checkinId: 'checkin-1',
  contributionDate: new Date(2024, 5, 5, 12, 0, 0),
  quantity: 1,
  shelfLife: null,
  categoryName: 'Fruits',
  categoryImage: null,
  originName: 'Farm Harvest',
  companyName: 'Local Farm',
  foodTitle: null,
  foodCompany: null,
  foodCool: null,
  foodAllergens: null,
  foodComment: null,
  contributorId: 'user-1',
  contributorName: 'Alice',
  contributorImage: null,
  contributorEmail: 'alice@example.com',
  fairteilerId: 'ft-1',
  fairteilerName: 'Fridge Berlin',
  ...overrides,
});

describe('applyFilters', () => {
  it('returns all items when no filters are set', () => {
    const data = [
      createContribution({ checkinId: 'a' }),
      createContribution({ checkinId: 'b' }),
    ];

    expect(applyFilters(data, {})).toEqual(data);
  });

  it('returns all items when filter arrays are empty', () => {
    const data = [createContribution()];

    const result = applyFilters(data, {
      category: [],
      origin: [],
      company: [],
      fairteiler: [],
    });

    expect(result).toEqual(data);
  });

  describe('date range', () => {
    it('includes items on the to date because the bound extends to end of day', () => {
      const onToDateEvening = createContribution({
        checkinId: 'on-to-date',
        contributionDate: new Date(2024, 5, 10, 18, 0, 0),
      });
      const dayAfter = createContribution({
        checkinId: 'day-after',
        contributionDate: new Date(2024, 5, 11, 8, 0, 0),
      });

      const result = applyFilters([onToDateEvening, dayAfter], {
        dateRange: { from: new Date(2024, 5, 1), to: new Date(2024, 5, 10) },
      });

      expect(result.map((c) => c.checkinId)).toEqual(['on-to-date']);
    });

    it('includes items exactly at the from date midnight', () => {
      const atFromMidnight = createContribution({
        checkinId: 'at-from',
        contributionDate: new Date(2024, 5, 1, 0, 0, 0),
      });
      const dayBefore = createContribution({
        checkinId: 'day-before',
        contributionDate: new Date(2024, 4, 31, 23, 0, 0),
      });

      const result = applyFilters([atFromMidnight, dayBefore], {
        dateRange: { from: new Date(2024, 5, 1) },
      });

      expect(result.map((c) => c.checkinId)).toEqual(['at-from']);
    });

    it('applies only the upper bound when from is missing', () => {
      const early = createContribution({
        checkinId: 'early',
        contributionDate: new Date(2020, 0, 1),
      });
      const late = createContribution({
        checkinId: 'late',
        contributionDate: new Date(2024, 5, 11),
      });

      const result = applyFilters([early, late], {
        dateRange: { to: new Date(2024, 5, 10) },
      });

      expect(result.map((c) => c.checkinId)).toEqual(['early']);
    });

    it('excludes items with unparseable dates when a date range is set', () => {
      const invalid = createContribution({
        contributionDate: 'not-a-date',
      });

      const result = applyFilters([invalid], {
        dateRange: { from: new Date(2024, 5, 1) },
      });

      expect(result).toEqual([]);
    });

    it('keeps items with unparseable dates when no date range is set', () => {
      const invalid = createContribution({
        contributionDate: 'not-a-date',
      });

      expect(applyFilters([invalid], {})).toHaveLength(1);
    });
  });

  describe('attribute filters', () => {
    const data = [
      createContribution({
        checkinId: 'apples',
        categoryName: 'Fruits',
        originName: 'Farm Harvest',
        companyName: 'Local Farm',
        fairteilerName: 'Fridge Berlin',
      }),
      createContribution({
        checkinId: 'bread',
        categoryName: 'Bakery',
        originName: 'Local Bakery',
        companyName: 'Berlin Bakery',
        fairteilerName: 'Fridge Hamburg',
      }),
    ];

    it('filters by category', () => {
      const result = applyFilters(data, { category: ['Bakery'] });

      expect(result.map((c) => c.checkinId)).toEqual(['bread']);
    });

    it('filters by origin', () => {
      const result = applyFilters(data, { origin: ['Farm Harvest'] });

      expect(result.map((c) => c.checkinId)).toEqual(['apples']);
    });

    it('filters by company', () => {
      const result = applyFilters(data, { company: ['Berlin Bakery'] });

      expect(result.map((c) => c.checkinId)).toEqual(['bread']);
    });

    it('filters by fairteiler', () => {
      const result = applyFilters(data, { fairteiler: ['Fridge Berlin'] });

      expect(result.map((c) => c.checkinId)).toEqual(['apples']);
    });

    it('matches items against any value in a filter array', () => {
      const result = applyFilters(data, { category: ['Fruits', 'Bakery'] });

      expect(result).toHaveLength(2);
    });

    it('requires all active filters to match', () => {
      const result = applyFilters(data, {
        category: ['Fruits'],
        fairteiler: ['Fridge Hamburg'],
      });

      expect(result).toEqual([]);
    });

    it('combines date range with attribute filters', () => {
      const inRangeBakery = createContribution({
        checkinId: 'in-range-bakery',
        categoryName: 'Bakery',
        contributionDate: new Date(2024, 5, 5),
      });
      const outOfRangeBakery = createContribution({
        checkinId: 'out-of-range-bakery',
        categoryName: 'Bakery',
        contributionDate: new Date(2024, 6, 5),
      });
      const inRangeFruits = createContribution({
        checkinId: 'in-range-fruits',
        categoryName: 'Fruits',
        contributionDate: new Date(2024, 5, 5),
      });

      const result = applyFilters(
        [inRangeBakery, outOfRangeBakery, inRangeFruits],
        {
          dateRange: { from: new Date(2024, 5, 1), to: new Date(2024, 5, 30) },
          category: ['Bakery'],
        },
      );

      expect(result.map((c) => c.checkinId)).toEqual(['in-range-bakery']);
    });
  });

  describe('null-value normalization', () => {
    it('matches null category via the Unbekannte Kategorie label', () => {
      const item = createContribution({ categoryName: null });

      expect(
        applyFilters([item], { category: ['Unbekannte Kategorie'] }),
      ).toHaveLength(1);
      expect(applyFilters([item], { category: ['Fruits'] })).toHaveLength(0);
    });

    it('matches null origin via the Unbekannte Herkunft label', () => {
      const item = createContribution({ originName: null });

      expect(
        applyFilters([item], { origin: ['Unbekannte Herkunft'] }),
      ).toHaveLength(1);
    });

    it('matches null company via the Unbekannter Betrieb label', () => {
      const item = createContribution({ companyName: null });

      expect(
        applyFilters([item], { company: ['Unbekannter Betrieb'] }),
      ).toHaveLength(1);
    });

    it('matches empty fairteiler name via the Unbekannter Fairteiler label', () => {
      const item = createContribution({ fairteilerName: '' });

      expect(
        applyFilters([item], { fairteiler: ['Unbekannter Fairteiler'] }),
      ).toHaveLength(1);
      expect(applyFilters([item], { fairteiler: [''] })).toHaveLength(0);
    });
  });
});
