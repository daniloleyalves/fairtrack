import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadFairteilerMembership } from '../../fairteiler/dal';
import { loadActiveQrCodeById } from '../dal';
import { loadScanContext } from '../scan-context';
import { readScanProof } from '../scan-proof';

vi.mock('../scan-proof', () => ({ readScanProof: vi.fn() }));
vi.mock('../dal', () => ({ loadActiveQrCodeById: vi.fn() }));
vi.mock('../../fairteiler/dal', () => ({ loadFairteilerMembership: vi.fn() }));

const proof = {
  fairteilerId: 'fairteiler-1',
  qrCodeId: 'qr-1',
  exp: Date.parse('2026-10-14T12:30:00Z'),
};

function qrCode(overrides: Record<string, unknown> = {}) {
  return {
    id: 'qr-1',
    fairteilerId: 'fairteiler-1',
    guestAccessViewId: 'guest-1',
    fairteiler: { id: 'fairteiler-1', name: 'QR Fairteiler', disabled: false },
    ...overrides,
  } as unknown as Awaited<ReturnType<typeof loadActiveQrCodeById>>;
}

function membership(role: string) {
  return { role } as Awaited<ReturnType<typeof loadFairteilerMembership>>;
}

describe('loadScanContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(readScanProof).mockResolvedValue(proof);
    vi.mocked(loadActiveQrCodeById).mockResolvedValue(qrCode());
    vi.mocked(loadFairteilerMembership).mockResolvedValue(membership('guest'));
  });

  it('returns the scanned fairteiler with its guest access view', async () => {
    const context = await loadScanContext();

    expect(loadActiveQrCodeById).toHaveBeenCalledWith('qr-1');
    expect(loadFairteilerMembership).toHaveBeenCalledWith(
      'fairteiler-1',
      'guest-1',
    );
    expect(context).toEqual({
      fairteiler: {
        id: 'fairteiler-1',
        name: 'QR Fairteiler',
        disabled: false,
      },
      qrCodeId: 'qr-1',
      guestAccessViewId: 'guest-1',
      expiresAt: new Date(proof.exp),
    });
  });

  it('returns nothing without a valid scan', async () => {
    vi.mocked(readScanProof).mockResolvedValue(null);

    expect(await loadScanContext()).toBeNull();
    expect(loadActiveQrCodeById).not.toHaveBeenCalled();
  });

  it('returns nothing once the code is revoked', async () => {
    vi.mocked(loadActiveQrCodeById).mockResolvedValue(undefined);

    expect(await loadScanContext()).toBeNull();
  });

  it('returns nothing when the proof names another fairteiler', async () => {
    vi.mocked(loadActiveQrCodeById).mockResolvedValue(
      qrCode({ fairteilerId: 'fairteiler-2' }),
    );

    expect(await loadScanContext()).toBeNull();
  });

  it('returns nothing for a disabled fairteiler', async () => {
    vi.mocked(loadActiveQrCodeById).mockResolvedValue(
      qrCode({
        fairteiler: {
          id: 'fairteiler-1',
          name: 'QR Fairteiler',
          disabled: true,
        },
      }),
    );

    expect(await loadScanContext()).toBeNull();
  });

  it('offers no guest path when the code has no guest access view', async () => {
    vi.mocked(loadActiveQrCodeById).mockResolvedValue(
      qrCode({ guestAccessViewId: null }),
    );

    const context = await loadScanContext();

    expect(context?.guestAccessViewId).toBeNull();
    expect(loadFairteilerMembership).not.toHaveBeenCalled();
  });

  it('offers no guest path once the linked account is no longer a guest', async () => {
    vi.mocked(loadFairteilerMembership).mockResolvedValue(
      membership('disabled'),
    );

    const context = await loadScanContext();

    expect(context?.qrCodeId).toBe('qr-1');
    expect(context?.guestAccessViewId).toBeNull();
  });
});
