import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import {
  CardSkeleton,
  ListSkeleton,
  PieChartSkeleton,
  Skeleton,
  StatSkeleton,
  TableSkeleton,
} from '..';

describe('Skeleton primitives', () => {
  describe('Skeleton (base)', () => {
    it('defaults to bg-white (onPage) and animate-pulse', () => {
      const { container } = render(<Skeleton className='h-4 w-10' />);
      const el = container.firstChild as HTMLElement;
      expect(el.className).toContain('animate-pulse');
      expect(el.className).toContain('bg-white');
      expect(el.className).toContain('h-4');
      expect(el.dataset.slot).toBe('skeleton');
    });

    it("variant='onCard' switches to bg-secondary", () => {
      const { container } = render(<Skeleton variant='onCard' />);
      const el = container.firstChild as HTMLElement;
      expect(el.className).toContain('bg-secondary');
      expect(el.className).not.toContain('bg-white');
    });
  });

  describe('CardSkeleton', () => {
    it('renders a single bar when given height + no children', () => {
      const { container } = render(<CardSkeleton height='h-8 w-32' />);
      const el = container.firstChild as HTMLElement;
      expect(el.dataset.slot).toBe('skeleton');
      expect(el.className).toContain('h-8');
    });

    it('renders a card container when given children', () => {
      const { container } = render(
        <CardSkeleton>
          <Skeleton variant='onCard' className='h-4' />
        </CardSkeleton>,
      );
      const root = container.firstChild as HTMLElement;
      expect(root.className).toContain('rounded-lg');
      expect(root.className).toContain('border');
      expect(root.querySelectorAll('[data-slot="skeleton"]').length).toBe(1);
    });
  });

  describe('StatSkeleton', () => {
    it("renders `count` tiles in the 'icon-label' shape", () => {
      const { container } = render(
        <StatSkeleton count={3} variant='icon-label' />,
      );
      const tiles = container.querySelectorAll('.rounded-lg.border');
      expect(tiles.length).toBe(3);
      // each tile holds the circular icon + label bar = 2 skeletons
      expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBe(
        6,
      );
    });

    it("renders 3 bars per tile in the 'number-unit-desc' variant", () => {
      const { container } = render(
        <StatSkeleton count={4} variant='number-unit-desc' />,
      );
      expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBe(
        12,
      );
    });
  });

  describe('ListSkeleton', () => {
    it('renders `rows` row placeholders', () => {
      const { container } = render(<ListSkeleton rows={5} />);
      expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBe(
        5,
      );
    });

    it('adds avatar + trailing + title bars when those flags are on', () => {
      const { container } = render(
        <ListSkeleton rows={4} showAvatar showTrailing title />,
      );
      // 4 rows × (avatar + main + trailing) + 1 title = 13
      expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBe(
        13,
      );
    });
  });

  describe('TableSkeleton', () => {
    it('renders header + body rows × columns', () => {
      const { container } = render(<TableSkeleton rows={3} columns={4} />);
      // header row (4) + 3 body rows × 4 = 16
      expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBe(
        16,
      );
    });

    it('adds toolbar + pagination when those flags are on', () => {
      const { container } = render(
        <TableSkeleton rows={2} columns={3} showToolbar showPagination />,
      );
      // toolbar (2) + header (3) + 2×3 body + pagination (3) = 14
      expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBe(
        14,
      );
    });
  });

  describe('PieChartSkeleton', () => {
    it('renders the pie + default 6 legend rows', () => {
      const { container } = render(<PieChartSkeleton />);
      // 1 pie + 6 legend rows × (swatch + bar) = 13
      expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBe(
        13,
      );
    });

    it('respects legendItems', () => {
      const { container } = render(<PieChartSkeleton legendItems={3} />);
      // 1 pie + 3 × 2 = 7
      expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBe(
        7,
      );
    });
  });
});
