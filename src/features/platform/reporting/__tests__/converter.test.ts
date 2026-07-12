import { describe, it, expect } from 'vitest';
import {
  getPlatformKeyFigures,
  getPlatformVolumeTrendData,
  getPlatformContributionsByCategory,
  getPlatformContributionsByOrigin,
  getPlatformContributionsByCompany,
  getPlatformContributionsByFairteiler,
  getPlatformCalendarData,
} from '../converter';
import { vContribution } from '@/server/db/db-types';

const createContribution = (
  overrides: Partial<vContribution> = {},
): vContribution => ({
  checkinId: 'checkin-1',
  contributionDate: new Date('2024-06-01T10:00:00Z'),
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

describe('getPlatformKeyFigures', () => {
  it('computes totals, unique contributors by id and unique fairteilers by id', () => {
    const data = [
      createContribution({
        quantity: 2,
        contributorId: 'user-1',
        fairteilerId: 'ft-1',
      }),
      createContribution({
        quantity: 3,
        contributorId: 'user-2',
        fairteilerId: 'ft-2',
      }),
      createContribution({
        quantity: 5,
        contributorId: 'user-1',
        fairteilerId: 'ft-2',
      }),
    ];

    const result = getPlatformKeyFigures(data);

    expect(result).toEqual([
      { value: 10, description: 'gerettet', unit: 'kg', color: 'primary' },
      { value: 3, description: 'Abgaben', unit: undefined, color: 'default' },
      {
        value: 2,
        description: 'Aktive Fairteiler',
        unit: undefined,
        color: 'default',
      },
      {
        value: 2,
        description: 'Registrierte Nutzer',
        unit: undefined,
        color: 'default',
      },
    ]);
  });

  it('returns zeros for empty input', () => {
    const result = getPlatformKeyFigures([]);

    expect(result.map((figure) => figure.value)).toEqual([0, 0, 0, 0]);
  });
});

describe('getPlatformVolumeTrendData', () => {
  it('groups quantities by ISO day and sorts ascending by date', () => {
    const data = [
      createContribution({
        contributionDate: new Date('2024-06-02T08:00:00Z'),
        quantity: 5,
      }),
      createContribution({
        contributionDate: new Date('2024-06-01T10:00:00Z'),
        quantity: 1.5,
      }),
      createContribution({
        contributionDate: new Date('2024-06-01T22:00:00Z'),
        quantity: 2,
      }),
    ];

    expect(getPlatformVolumeTrendData(data)).toEqual([
      { date: '2024-06-01', quantity: 3.5 },
      { date: '2024-06-02', quantity: 5 },
    ]);
  });

  it('rounds daily totals to two decimals', () => {
    const data = [
      createContribution({
        contributionDate: new Date('2024-06-01T10:00:00Z'),
        quantity: 0.1,
      }),
      createContribution({
        contributionDate: new Date('2024-06-01T11:00:00Z'),
        quantity: 0.2,
      }),
    ];

    expect(getPlatformVolumeTrendData(data)).toEqual([
      { date: '2024-06-01', quantity: 0.3 },
    ]);
  });

  it('returns an empty array for empty input', () => {
    expect(getPlatformVolumeTrendData([])).toEqual([]);
  });
});

describe('getPlatformContributionsByCategory', () => {
  it('sums per category, sorts descending and assigns positions', () => {
    const data = [
      createContribution({ categoryName: 'Fruits', quantity: 1 }),
      createContribution({ categoryName: 'Bakery', quantity: 4 }),
      createContribution({ categoryName: 'Fruits', quantity: 2 }),
    ];

    expect(getPlatformContributionsByCategory(data)).toEqual([
      { position: 1, value: 4, description: 'Bakery' },
      { position: 2, value: 3, description: 'Fruits' },
    ]);
  });

  it('labels null categories as Uncategorized', () => {
    const data = [createContribution({ categoryName: null, quantity: 2 })];

    expect(getPlatformContributionsByCategory(data)).toEqual([
      { position: 1, value: 2, description: 'Uncategorized' },
    ]);
  });

  it('returns an empty array for empty input', () => {
    expect(getPlatformContributionsByCategory([])).toEqual([]);
  });
});

describe('getPlatformContributionsByOrigin', () => {
  it('sums per origin, sorts descending and assigns positions', () => {
    const data = [
      createContribution({ originName: 'Farm Harvest', quantity: 1 }),
      createContribution({ originName: 'Local Bakery', quantity: 3 }),
      createContribution({ originName: 'Farm Harvest', quantity: 1.5 }),
    ];

    expect(getPlatformContributionsByOrigin(data)).toEqual([
      { position: 1, value: 3, description: 'Local Bakery' },
      { position: 2, value: 2.5, description: 'Farm Harvest' },
    ]);
  });

  it('labels null origins as No Origin', () => {
    const data = [createContribution({ originName: null, quantity: 1 })];

    expect(getPlatformContributionsByOrigin(data)).toEqual([
      { position: 1, value: 1, description: 'No Origin' },
    ]);
  });
});

describe('getPlatformContributionsByCompany', () => {
  it('sums per company, sorts descending and assigns positions', () => {
    const data = [
      createContribution({ companyName: 'Local Farm', quantity: 2 }),
      createContribution({ companyName: 'Berlin Bakery', quantity: 5 }),
      createContribution({ companyName: 'Local Farm', quantity: 1 }),
    ];

    expect(getPlatformContributionsByCompany(data)).toEqual([
      { position: 1, value: 5, description: 'Berlin Bakery' },
      { position: 2, value: 3, description: 'Local Farm' },
    ]);
  });

  it('labels null companies as Nicht angegeben', () => {
    const data = [createContribution({ companyName: null, quantity: 1 })];

    expect(getPlatformContributionsByCompany(data)).toEqual([
      { position: 1, value: 1, description: 'Nicht angegeben' },
    ]);
  });
});

describe('getPlatformContributionsByFairteiler', () => {
  it('sums per fairteiler, sorts descending and assigns positions', () => {
    const data = [
      createContribution({ fairteilerName: 'Fridge Berlin', quantity: 2 }),
      createContribution({ fairteilerName: 'Fridge Hamburg', quantity: 6 }),
      createContribution({ fairteilerName: 'Fridge Berlin', quantity: 1.25 }),
      createContribution({ fairteilerName: 'Fridge Munich', quantity: 0.5 }),
    ];

    expect(getPlatformContributionsByFairteiler(data)).toEqual([
      { position: 1, value: 6, description: 'Fridge Hamburg' },
      { position: 2, value: 3.25, description: 'Fridge Berlin' },
      { position: 3, value: 0.5, description: 'Fridge Munich' },
    ]);
  });

  it('returns an empty array for empty input', () => {
    expect(getPlatformContributionsByFairteiler([])).toEqual([]);
  });
});

describe('getPlatformCalendarData', () => {
  it('groups quantities by ISO day into value/quantity pairs sorted ascending', () => {
    const data = [
      createContribution({
        contributionDate: new Date('2024-06-03T09:00:00Z'),
        quantity: 2,
      }),
      createContribution({
        contributionDate: new Date('2024-06-01T09:00:00Z'),
        quantity: 1,
      }),
      createContribution({
        contributionDate: new Date('2024-06-03T18:00:00Z'),
        quantity: 0.25,
      }),
    ];

    expect(getPlatformCalendarData(data)).toEqual([
      { value: '2024-06-01', quantity: 1 },
      { value: '2024-06-03', quantity: 2.25 },
    ]);
  });

  it('returns an empty array for empty input', () => {
    expect(getPlatformCalendarData([])).toEqual([]);
  });
});
