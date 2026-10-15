import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { loadActiveQrCodeByToken } from '@/server/qr-code/dal';
import {
  decodeScanProof,
  SCAN_PROOF_COOKIE,
} from '@/server/qr-code/scan-proof';
import { GET } from '../route';

vi.mock('@/server/qr-code/dal', () => ({ loadActiveQrCodeByToken: vi.fn() }));

const SECRET = 'route-test-secret';

function scan(token: string) {
  return GET(new NextRequest(`https://fairtrack.test/q/${token}`), {
    params: Promise.resolve({ token }),
  });
}

function qrCode(disabled = false) {
  return {
    id: 'qr-1',
    fairteilerId: 'fairteiler-1',
    fairteiler: { disabled },
  } as unknown as Awaited<ReturnType<typeof loadActiveQrCodeByToken>>;
}

describe('GET /q/[token]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('BETTER_AUTH_SECRET', SECRET);
  });

  it('stores a signed scan proof and opens the scan page', async () => {
    vi.mocked(loadActiveQrCodeByToken).mockResolvedValue(qrCode());

    const response = await scan('valid-token');

    expect(loadActiveQrCodeByToken).toHaveBeenCalledWith('valid-token');
    expect(response.headers.get('location')).toBe(
      'https://fairtrack.test/scan',
    );
    const cookie = response.cookies.get(SCAN_PROOF_COOKIE);
    expect(cookie?.httpOnly).toBe(true);
    expect(decodeScanProof(cookie?.value, Date.now(), SECRET)).toMatchObject({
      fairteilerId: 'fairteiler-1',
      qrCodeId: 'qr-1',
    });
  });

  it.each([
    ['an unknown or revoked code', undefined],
    ['a disabled fairteiler', qrCode(true)],
  ])('rejects %s and clears an earlier scan', async (_, result) => {
    vi.mocked(loadActiveQrCodeByToken).mockResolvedValue(result);

    const response = await scan('bad-token');

    expect(response.headers.get('location')).toBe(
      'https://fairtrack.test/scan?fehler=ungueltig',
    );
    expect(response.cookies.get(SCAN_PROOF_COOKIE)?.value).toBe('');
  });
});
