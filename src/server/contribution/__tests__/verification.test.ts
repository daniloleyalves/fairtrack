import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  NOT_VERIFIED_MESSAGE,
  resolveContributionVerification,
} from '../verification';
import { loadFairteilerMembership } from '../../fairteiler/dal';
import { loadActiveQrCodeById } from '../../qr-code/dal';
import { readScanProof } from '../../qr-code/scan-proof';

vi.mock('../../fairteiler/dal', () => ({
  loadFairteilerMembership: vi.fn(),
}));
vi.mock('../../qr-code/dal', () => ({
  loadActiveQrCodeById: vi.fn(),
}));
vi.mock('../../qr-code/scan-proof', () => ({
  readScanProof: vi.fn(),
}));

const fairteiler = { id: 'fairteiler-1', geoLat: '48.0', geoLng: '9.0' };
const foodsaver = { id: 'user-1', role: 'user' };
const atFairteiler = { latitude: 48.0, longitude: 9.0, accuracy: 10 };
// ~1.1 km north of the fairteiler.
const farAway = { latitude: 48.01, longitude: 9.0, accuracy: 10 };

function member(role: 'employee' | 'disabled') {
  return {
    id: 'member-1',
    organizationId: fairteiler.id,
    userId: foodsaver.id,
    role,
    createdAt: new Date(),
  };
}

function activeQrCode(fairteilerId = fairteiler.id) {
  return { id: 'qr-1', fairteilerId } as Awaited<
    ReturnType<typeof loadActiveQrCodeById>
  >;
}

describe('resolveContributionVerification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadFairteilerMembership).mockResolvedValue(undefined);
    vi.mocked(readScanProof).mockResolvedValue(null);
    vi.mocked(loadActiveQrCodeById).mockResolvedValue(undefined);
  });

  it('trusts platform admins', async () => {
    await expect(
      resolveContributionVerification({
        fairteiler,
        user: { id: 'admin-1', role: 'admin' },
      }),
    ).resolves.toBe('staff');
  });

  it('trusts active members of the fairteiler', async () => {
    vi.mocked(loadFairteilerMembership).mockResolvedValue(member('employee'));
    await expect(
      resolveContributionVerification({ fairteiler, user: foodsaver }),
    ).resolves.toBe('staff');
  });

  it('does not trust disabled access views', async () => {
    vi.mocked(loadFairteilerMembership).mockResolvedValue(member('disabled'));
    await expect(
      resolveContributionVerification({ fairteiler, user: foodsaver }),
    ).rejects.toThrow(NOT_VERIFIED_MESSAGE);
  });

  it('accepts a recent scan of an active code at this fairteiler', async () => {
    vi.mocked(readScanProof).mockResolvedValue({
      fairteilerId: fairteiler.id,
      qrCodeId: 'qr-1',
      exp: Date.now() + 60_000,
    });
    vi.mocked(loadActiveQrCodeById).mockResolvedValue(activeQrCode());

    await expect(
      resolveContributionVerification({ fairteiler, user: foodsaver }),
    ).resolves.toBe('qr');
  });

  it('ignores a scan from another fairteiler', async () => {
    vi.mocked(readScanProof).mockResolvedValue({
      fairteilerId: 'fairteiler-2',
      qrCodeId: 'qr-2',
      exp: Date.now() + 60_000,
    });

    await expect(
      resolveContributionVerification({ fairteiler, user: foodsaver }),
    ).rejects.toThrow(NOT_VERIFIED_MESSAGE);
    expect(loadActiveQrCodeById).not.toHaveBeenCalled();
  });

  it('ignores a scan of a code revoked since', async () => {
    vi.mocked(readScanProof).mockResolvedValue({
      fairteilerId: fairteiler.id,
      qrCodeId: 'qr-1',
      exp: Date.now() + 60_000,
    });

    await expect(
      resolveContributionVerification({ fairteiler, user: foodsaver }),
    ).rejects.toThrow(NOT_VERIFIED_MESSAGE);
  });

  it('accepts a location at the fairteiler', async () => {
    await expect(
      resolveContributionVerification({
        fairteiler,
        user: foodsaver,
        location: atFairteiler,
      }),
    ).resolves.toBe('location');
  });

  it('rejects a location away from the fairteiler', async () => {
    await expect(
      resolveContributionVerification({
        fairteiler,
        user: foodsaver,
        location: farAway,
      }),
    ).rejects.toThrow(NOT_VERIFIED_MESSAGE);
  });

  it('rejects when there is neither a scan nor a location', async () => {
    await expect(
      resolveContributionVerification({
        fairteiler,
        user: foodsaver,
        location: null,
      }),
    ).rejects.toThrow(NOT_VERIFIED_MESSAGE);
  });

  it('prefers the scan over the location', async () => {
    vi.mocked(readScanProof).mockResolvedValue({
      fairteilerId: fairteiler.id,
      qrCodeId: 'qr-1',
      exp: Date.now() + 60_000,
    });
    vi.mocked(loadActiveQrCodeById).mockResolvedValue(activeQrCode());

    await expect(
      resolveContributionVerification({
        fairteiler,
        user: foodsaver,
        location: atFairteiler,
      }),
    ).resolves.toBe('qr');
  });
});
