import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { vContribution } from '@/server/db/db-types';
import {
  ANONYMOUS_CONTRIBUTOR_KEY,
  columns,
  getContributorAccessType,
  getContributorKey,
  getContributorLabel,
} from '../history-table-config';

vi.mock('@/server/contribution/queries', () => ({
  getVersionHistoryByCheckinId: vi.fn(),
}));
vi.mock('../components/history-edit-modal', () => ({
  HistoryEditModal: () => null,
}));
vi.mock('../components/history-version-history', () => ({
  HistoryVersionHistory: () => null,
}));
vi.mock('@/features/fairteiler/contribution-info-modal', () => ({
  ContributionInfoModal: () => null,
}));

function contribution(overrides: Partial<vContribution>): vContribution {
  return {
    checkinId: `checkin-${overrides.contributorId}`,
    contributorId: 'user-1',
    contributorName: 'Erika Muster',
    contributorImage: null,
    contributorEmail: 'erika@example.com',
    contributorIsAnonymous: false,
    contributorRole: 'member',
    ...overrides,
  } as vContribution;
}

const erika = contribution({ contributorId: 'user-1' });
const guest = contribution({
  contributorId: 'guest-1',
  contributorName: 'Gast',
  contributorRole: 'guest',
});
const employee = contribution({
  contributorId: 'employee-1',
  contributorName: 'Team',
  contributorRole: 'employee',
});
const anonymousA = contribution({
  contributorId: 'user-2',
  contributorName: 'Anonyme Person',
  contributorIsAnonymous: true,
});
const anonymousB = contribution({
  contributorId: 'user-3',
  contributorName: 'Anonyme Person',
  contributorIsAnonymous: true,
});
const data = [erika, guest, employee, anonymousA, anonymousB];

function filteredIds(columnFilters: ColumnFiltersState) {
  const { result } = renderHook(() =>
    useReactTable({
      data,
      columns,
      state: { columnFilters },
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
    }),
  );
  return result.current
    .getFilteredRowModel()
    .rows.map((row) => row.original.contributorId);
}

describe('history contributor helpers', () => {
  it('maps member roles to access types', () => {
    expect(getContributorAccessType(guest)).toBe('guest');
    expect(getContributorAccessType(employee)).toBe('employee');
    expect(
      getContributorAccessType(contribution({ contributorRole: 'disabled' })),
    ).toBe('disabled');
    expect(getContributorAccessType(erika)).toBe('user');
    expect(
      getContributorAccessType(contribution({ contributorRole: 'owner' })),
    ).toBe('user');
    expect(
      getContributorAccessType(contribution({ contributorRole: null })),
    ).toBe('user');
  });

  it('groups anonymous contributors under one key', () => {
    expect(getContributorKey(anonymousA)).toBe(ANONYMOUS_CONTRIBUTOR_KEY);
    expect(getContributorKey(anonymousB)).toBe(ANONYMOUS_CONTRIBUTOR_KEY);
    expect(getContributorKey(erika)).toBe('user-1');
  });

  it('falls back to a label for contributors without a name', () => {
    expect(getContributorLabel(contribution({ contributorName: null }))).toBe(
      'Unbekannt',
    );
    expect(getContributorLabel(erika)).toBe('Erika Muster');
  });
});

describe('history contributor filters', () => {
  it('shows every row without a filter', () => {
    expect(filteredIds([])).toHaveLength(data.length);
  });

  it('filters by contributor', () => {
    expect(filteredIds([{ id: 'contributor', value: ['user-1'] }])).toEqual([
      'user-1',
    ]);
  });

  it('filters all anonymous contributions together', () => {
    expect(
      filteredIds([{ id: 'contributor', value: [ANONYMOUS_CONTRIBUTOR_KEY] }]),
    ).toEqual(['user-2', 'user-3']);
  });

  it('filters by access type', () => {
    expect(
      filteredIds([{ id: 'access', value: ['guest', 'employee'] }]),
    ).toEqual(['guest-1', 'employee-1']);
    expect(filteredIds([{ id: 'access', value: ['user'] }])).toEqual([
      'user-1',
      'user-2',
      'user-3',
    ]);
  });

  it('combines contributor and access filters', () => {
    expect(
      filteredIds([
        { id: 'contributor', value: ['user-1', 'guest-1'] },
        { id: 'access', value: ['guest'] },
      ]),
    ).toEqual(['guest-1']);
  });
});
