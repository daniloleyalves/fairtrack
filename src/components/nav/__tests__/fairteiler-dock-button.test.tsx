import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { render, screen } from '@/__tests__/test-utils';
import { useSession } from '@/lib/auth/auth-hooks';
import { FairteilerDockButton } from '../fairteiler-dock-button';

vi.mock('@/lib/auth/auth-hooks', () => ({
  useSession: vi.fn(),
}));

function mockSession(
  email: string | null,
  activeOrganizationId: string | null,
) {
  vi.mocked(useSession).mockReturnValue({
    user: email ? { email } : null,
    session: email ? { activeOrganizationId } : null,
  } as unknown as ReturnType<typeof useSession>);
}

describe('FairteilerDockButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('links members to the fairteiler dashboard', () => {
    mockSession('foodsaver@example.com', 'fairteiler-1');

    render(<FairteilerDockButton />);

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/hub/fairteiler/dashboard',
    );
  });

  it.each(['guest-1@fairteiler.local', 'employee-1@fairteiler.local'])(
    'links access view %s to the contribution form',
    (email) => {
      mockSession(email, 'fairteiler-1');

      render(<FairteilerDockButton />);

      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        '/hub/fairteiler/contribution',
      );
    },
  );

  it('renders nothing for users without a fairteiler', () => {
    mockSession('foodsaver@example.com', null);

    render(<FairteilerDockButton />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders nothing while signed out', () => {
    mockSession(null, null);

    render(<FairteilerDockButton />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
