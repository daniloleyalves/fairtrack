import { describe, it, expect, vi } from 'vite-plus/test';
import { render, screen } from '@/__tests__/test-utils';
import { Milestones } from '../milestones';
import { MilestoneData } from '../milestone-utils';

vi.mock('next/image', () => ({
  // oxlint-disable-next-line @next/next/no-img-element
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

const achieved = (quantity: number) => ({
  id: `m-${quantity}`,
  quantity,
  isAchieved: true,
  achievedAt: new Date('2026-01-01'),
});

describe('Milestones', () => {
  it('stacks achieved milestones with the latest on top, then the next', () => {
    const data: MilestoneData = {
      achieved: [10, 25, 50, 100].map(achieved),
      nextMilestone: { id: 'm-250', quantity: 250, isAchieved: false },
    };

    render(<Milestones milestoneData={data} />);

    expect(
      screen.getByRole('button', { name: '4 erreichte Meilensteine' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('100')).toHaveLength(3);
    expect(screen.getByText('250')).toBeInTheDocument();
    expect(screen.queryByText('10')).not.toBeInTheDocument();
    expect(screen.queryByText('25')).not.toBeInTheDocument();
    expect(screen.queryByText('50')).not.toBeInTheDocument();
  });

  it('caps the stack at three layers', () => {
    const data: MilestoneData = {
      achieved: [10, 25, 50, 100, 250, 500].map(achieved),
      nextMilestone: { id: 'm-1000', quantity: 1000, isAchieved: false },
    };

    render(<Milestones milestoneData={data} />);

    expect(screen.getAllByAltText('Raupe')).toHaveLength(4);
  });

  it('shows a single badge with one achieved milestone', () => {
    const data: MilestoneData = {
      achieved: [10].map(achieved),
      nextMilestone: { id: 'm-25', quantity: 25, isAchieved: false },
    };

    render(<Milestones milestoneData={data} />);

    expect(screen.getAllByAltText('Raupe')).toHaveLength(2);
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('omits the next badge once every milestone is achieved', () => {
    const data: MilestoneData = {
      achieved: [500, 1000].map(achieved),
      nextMilestone: null,
    };

    render(<Milestones milestoneData={data} />);

    expect(screen.getAllByAltText('Raupe')).toHaveLength(2);
    expect(screen.getAllByText('1000')).toHaveLength(2);
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
