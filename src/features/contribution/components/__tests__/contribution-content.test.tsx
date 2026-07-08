import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemberRolesEnum } from '@/lib/auth/auth-permissions';
import type { ContributionContextValue } from '../../context/contribution-context';

// The user/slug contribution path loads a fairteiler without its `members`
// relation (getFairteilerBySlug fetches only { tags }). ContributionContent
// must tolerate that shape — it used to crash on `.members.find(...)`.
const mockContext = vi.hoisted(() => ({ value: null as unknown }));
vi.mock('../../context/contribution-context', () => ({
  useContribution: () => mockContext.value,
}));

// Heavy children are irrelevant to the members-access guard under test.
vi.mock('../form/contribution-form', () => ({
  ContributionForm: () => <div>form</div>,
}));
vi.mock('../contribution-table', () => ({ default: () => <div>table</div> }));
vi.mock('../contribution-infos', () => ({
  ContributionInfos: () => <div>infos</div>,
}));
vi.mock('../access-view-selector', () => ({
  AccessViewSelector: () => <div>selector</div>,
}));
vi.mock('../../tutorial/components/tutorial-carousel', () => ({
  TutorialCarousel: () => <div>carousel</div>,
}));
vi.mock('@/components/magicui/blur-fade', () => ({
  BlurFade: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('next/navigation', () => ({
  usePathname: () => '/hub/user/contribution',
}));
vi.mock('@/lib/hooks/use-devices', () => ({ useIsMobile: () => false }));
vi.mock('../../hooks/use-submission-selection', () => ({
  useSubmissionSelection: () => [null, vi.fn()],
}));

import { ContributionContent } from '../contribution-content';

function baseContext(
  overrides: Partial<ContributionContextValue> = {},
): ContributionContextValue {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fairteiler: { id: 'f1', name: 'Slug Fairteiler' } as any,
    origins: [],
    categories: [],
    companies: [],
    tutorial: undefined,
    user: { id: 'u1' } as ContributionContextValue['user'],
    locationStatus: 'verified',
    coordinates: null,
    isLocationVerified: true,
    error: null,
    requestLocation: vi.fn(),
    ...overrides,
  };
}

describe('ContributionContent', () => {
  it('renders on the user/slug path when the fairteiler has no members relation', () => {
    mockContext.value = baseContext();
    expect(() => render(<ContributionContent />)).not.toThrow();
  });

  it('still resolves owner/access-view state when members are present', () => {
    mockContext.value = baseContext({
      fairteiler: {
        id: 'f1',
        name: 'Hub Fairteiler',
        members: [{ user: { id: 'u1' }, role: MemberRolesEnum.OWNER }],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    });
    expect(() => render(<ContributionContent />)).not.toThrow();
  });
});
