import { describe, it, expect, vi, beforeEach } from 'vite-plus/test';
import {
  createQrCodeAction,
  revokeQrCodeAction,
  updateQrCodeAction,
} from '../actions';
import { insertQrCode, revokeQrCode, updateQrCode } from '../dal';
import { loadFairteilerMembership } from '../../fairteiler/dal';
import { loadAuthenticatedSession } from '../../user/dal';
import { checkPermissionOnServer } from '@/lib/auth/auth';
import { mockSession } from '@/__tests__/mocks/server-only';

vi.mock('@lib/auth/auth', () => ({
  auth: { api: {} },
  checkPermissionOnServer: vi.fn(),
}));
vi.mock('../dal', () => ({
  insertQrCode: vi.fn(),
  updateQrCode: vi.fn(),
  revokeQrCode: vi.fn(),
}));
vi.mock('../../fairteiler/dal', () => ({
  loadFairteilerMembership: vi.fn(),
}));
vi.mock('../../user/dal', () => ({
  loadAuthenticatedSession: vi.fn(),
}));

const fairteilerId = mockSession.session.activeOrganizationId as string;

function membership(role: 'guest' | 'employee') {
  return {
    id: 'member-1',
    organizationId: fairteilerId,
    userId: 'guest-view-1',
    role,
    createdAt: new Date(),
  };
}

describe('QR code actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadAuthenticatedSession).mockResolvedValue(mockSession);
    vi.mocked(checkPermissionOnServer).mockResolvedValue({
      success: true,
      error: null,
    });
  });

  it('creates a code linked to a guest access view', async () => {
    vi.mocked(loadFairteilerMembership).mockResolvedValue(membership('guest'));
    vi.mocked(insertQrCode).mockResolvedValue({ id: 'qr-1' } as Awaited<
      ReturnType<typeof insertQrCode>
    >);

    const result = await createQrCodeAction({
      label: '  Eingang ',
      guestAccessViewId: 'guest-view-1',
    });

    expect(result?.serverError).toBeUndefined();
    expect(insertQrCode).toHaveBeenCalledWith({
      fairteilerId,
      label: 'Eingang',
      guestAccessViewId: 'guest-view-1',
    });
  });

  it('stores an empty label as none', async () => {
    await createQrCodeAction({ label: '   ', guestAccessViewId: null });

    expect(insertQrCode).toHaveBeenCalledWith({
      fairteilerId,
      label: null,
      guestAccessViewId: null,
    });
  });

  it('only lets owners manage codes', async () => {
    vi.mocked(checkPermissionOnServer).mockResolvedValue({
      success: false,
      error: null,
    });

    const result = await createQrCodeAction({
      label: null,
      guestAccessViewId: null,
    });

    expect(result?.serverError).toContain('Inhaber');
    expect(insertQrCode).not.toHaveBeenCalled();
  });

  it('refuses to link an employee access view', async () => {
    vi.mocked(loadFairteilerMembership).mockResolvedValue(
      membership('employee'),
    );

    const result = await updateQrCodeAction({
      id: 'qr-1',
      label: null,
      guestAccessViewId: 'guest-view-1',
    });

    expect(result?.serverError).toContain('Gastzugang');
    expect(updateQrCode).not.toHaveBeenCalled();
  });

  it('revokes a code of the active fairteiler', async () => {
    vi.mocked(revokeQrCode).mockResolvedValue({ id: 'qr-1' } as Awaited<
      ReturnType<typeof revokeQrCode>
    >);

    const result = await revokeQrCodeAction({ id: 'qr-1' });

    expect(result?.data).toEqual({ id: 'qr-1' });
    expect(revokeQrCode).toHaveBeenCalledWith('qr-1', fairteilerId);
  });

  it('reports a code that is already gone', async () => {
    vi.mocked(revokeQrCode).mockResolvedValue(undefined);

    const result = await revokeQrCodeAction({ id: 'qr-1' });

    expect(result?.serverError).toBeDefined();
  });
});
