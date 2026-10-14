import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/__tests__/test-utils';
import { Milestones } from '../milestones';
import { MilestoneData } from '../milestone-utils';

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

const achieved = (quantity: number) => ({
  id: `m-${quantity}`,
  quantity,
  isAchieved: true,
  achievedAt: new Date('2026-01-01'),
});

describe('Milestones', () => {
  it('shows earlier milestones as one stack before the latest and next', () => {
    const data: MilestoneData = {
      achieved: [10, 25, 50, 100].map(achieved),
      nextMilestone: { id: 'm-250', quantity: 250, isAchieved: false },
    };

    render(<Milestones milestoneData={data} />);

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('250')).toBeInTheDocument();
    expect(screen.queryByText('10')).not.toBeInTheDocument();
    expect(screen.queryByText('25')).not.toBeInTheDocument();
    expect(screen.queryByText('50')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '3 frühere Meilensteine' }),
    ).toBeInTheDocument();
  });

  it('caps the stack at three layers', () => {
    const data: MilestoneData = {
      achieved: [10, 25, 50, 100, 250, 500].map(achieved),
      nextMilestone: { id: 'm-1000', quantity: 1000, isAchieved: false },
    };

    render(<Milestones milestoneData={data} />);

    expect(screen.getAllByAltText('Raupe')).toHaveLength(5);
  });

  it('shows no stack with a single achieved milestone', () => {
    const data: MilestoneData = {
      achieved: [10].map(achieved),
      nextMilestone: { id: 'm-25', quantity: 25, isAchieved: false },
    };

    render(<Milestones milestoneData={data} />);

    expect(screen.getAllByAltText('Raupe')).toHaveLength(2);
    expect(screen.queryByRole('button', { name: /frühere/ })).toBeNull();
  });

  it('omits the next badge once every milestone is achieved', () => {
    const data: MilestoneData = {
      achieved: [500, 1000].map(achieved),
      nextMilestone: null,
    };

    render(<Milestones milestoneData={data} />);

    expect(screen.getAllByAltText('Raupe')).toHaveLength(2);
    expect(screen.getByText('1000')).toBeInTheDocument();
  });

  it('shows only the next milestone before any is achieved', () => {
    const data: MilestoneData = {
      achieved: [],
      nextMilestone: { id: 'm-10', quantity: 10, isAchieved: false },
    };

    render(<Milestones milestoneData={data} />);

    expect(screen.getAllByAltText('Raupe')).toHaveLength(1);
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});
