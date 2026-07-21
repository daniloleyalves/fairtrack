import { describe, it, expect } from 'vitest';
import {
  getKeyFigures,
  getVolumeTrendData,
  getContributionsByCategory,
  getContributionsByOrigin,
  getContributionsByCompany,
  getCalendarData,
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

describe('getKeyFigures', () => {
  it('computes total quantity, contribution count, average and unique contributors by email', () => {
    const data = [
      createContribution({
        quantity: 2,
        contributorEmail: 'alice@example.com',
      }),
      createContribution({ quantity: 3, contributorEmail: 'bob@example.com' }),
      createContribution({
        quantity: 4,
        contributorEmail: 'alice@example.com',
      }),
    ];

    const result = getKeyFigures(data);

    expect(result).toEqual([
      { value: 9, description: 'gerettet', unit: 'kg', color: 'primary' },
      { value: 3, description: 'Abgaben', unit: undefined, color: 'default' },
      { value: 3, description: 'Ø Abgabemenge', unit: 'kg', color: 'default' },
      {
        value: 2,
        description: 'Registrierte Nutzer',
        unit: undefined,
        color: 'default',
      },
    ]);
  });

  it('returns zeros for empty input', () => {
    const result = getKeyFigures([]);

    expect(result.map((figure) => figure.value)).toEqual([0, 0, 0, 0]);
  });
});

describe('getVolumeTrendData', () => {
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

    expect(getVolumeTrendData(data)).toEqual([
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
      createContribution({
        contributionDate: new Date('2024-06-01T12:00:00Z'),
        quantity: 1.005,
      }),
    ];

    expect(getVolumeTrendData(data)).toEqual([
      { date: '2024-06-01', quantity: 1.3 },
    ]);
  });

  it('returns an empty array for empty input', () => {
    expect(getVolumeTrendData([])).toEqual([]);
  });
});

describe('getContributionsByCategory', () => {
  it('sums per category, sorts descending and assigns positions', () => {
    const data = [
      createContribution({ categoryName: 'Fruits', quantity: 1 }),
      createContribution({ categoryName: 'Bakery', quantity: 4 }),
      createContribution({ categoryName: 'Fruits', quantity: 2 }),
    ];

    expect(getContributionsByCategory(data)).toEqual([
      { position: 1, value: 4, description: 'Bakery' },
      { position: 2, value: 3, description: 'Fruits' },
    ]);
  });

  it('labels null categories as Uncategorized', () => {
    const data = [createContribution({ categoryName: null, quantity: 2 })];

    expect(getContributionsByCategory(data)).toEqual([
      { position: 1, value: 2, description: 'Uncategorized' },
    ]);
  });

  it('returns an empty array for empty input', () => {
    expect(getContributionsByCategory([])).toEqual([]);
  });
});

describe('getContributionsByOrigin', () => {
  it('sums per origin, sorts descending and assigns positions', () => {
    const data = [
      createContribution({ originName: 'Farm Harvest', quantity: 1 }),
      createContribution({ originName: 'Local Bakery', quantity: 3 }),
      createContribution({ originName: 'Farm Harvest', quantity: 1.5 }),
    ];

    expect(getContributionsByOrigin(data)).toEqual([
      { position: 1, value: 3, description: 'Local Bakery' },
      { position: 2, value: 2.5, description: 'Farm Harvest' },
    ]);
  });

  it('labels null origins as No Origin', () => {
    const data = [createContribution({ originName: null, quantity: 1 })];

    expect(getContributionsByOrigin(data)).toEqual([
      { position: 1, value: 1, description: 'No Origin' },
    ]);
  });
});

describe('getContributionsByCompany', () => {
  it('sums per company, sorts descending and assigns positions', () => {
    const data = [
      createContribution({ companyName: 'Local Farm', quantity: 2 }),
      createContribution({ companyName: 'Berlin Bakery', quantity: 5 }),
      createContribution({ companyName: 'Local Farm', quantity: 1 }),
    ];

    expect(getContributionsByCompany(data)).toEqual([
      { position: 1, value: 5, description: 'Berlin Bakery' },
      { position: 2, value: 3, description: 'Local Farm' },
    ]);
  });

  it('labels null companies as Nicht angegeben', () => {
    const data = [createContribution({ companyName: null, quantity: 1 })];

    expect(getContributionsByCompany(data)).toEqual([
      { position: 1, value: 1, description: 'Nicht angegeben' },
    ]);
  });
});

describe('getCalendarData', () => {
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

    expect(getCalendarData(data)).toEqual([
      { value: '2024-06-01', quantity: 1 },
      { value: '2024-06-03', quantity: 2.25 },
    ]);
  });

  it('returns an empty array for empty input', () => {
    expect(getCalendarData([])).toEqual([]);
  });
});
