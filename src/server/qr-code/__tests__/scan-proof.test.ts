import { describe, it, expect } from 'vite-plus/test';
import {
  createScanProof,
  decodeScanProof,
  encodeScanProof,
  SCAN_PROOF_TTL_SECONDS,
} from '../scan-proof';

const SECRET = 'test-secret';
const NOW = Date.parse('2026-10-12T10:00:00Z');

describe('scan proof', () => {
  const proof = createScanProof('fairteiler-1', 'qr-1', NOW);

  it('expires after the scan window', () => {
    expect(proof.exp).toBe(NOW + SCAN_PROOF_TTL_SECONDS * 1000);
  });

  it('round-trips a signed proof', () => {
    const value = encodeScanProof(proof, SECRET);
    expect(decodeScanProof(value, NOW + 1000, SECRET)).toEqual(proof);
  });

  it('rejects an expired proof', () => {
    const value = encodeScanProof(proof, SECRET);
    expect(decodeScanProof(value, proof.exp, SECRET)).toBeNull();
  });

  it('rejects a proof signed with another secret', () => {
    const value = encodeScanProof(proof, 'other-secret');
    expect(decodeScanProof(value, NOW, SECRET)).toBeNull();
  });

  it('rejects a payload swapped to another fairteiler', () => {
    const [, signature] = encodeScanProof(proof, SECRET).split('.');
    const forgedPayload = Buffer.from(
      JSON.stringify({ ...proof, fairteilerId: 'fairteiler-2' }),
    ).toString('base64url');
    expect(
      decodeScanProof(`${forgedPayload}.${signature}`, NOW, SECRET),
    ).toBeNull();
  });

  it('rejects missing and malformed values', () => {
    expect(decodeScanProof(undefined, NOW, SECRET)).toBeNull();
    expect(decodeScanProof('', NOW, SECRET)).toBeNull();
    expect(decodeScanProof('abc', NOW, SECRET)).toBeNull();
    expect(decodeScanProof('a.b.c', NOW, SECRET)).toBeNull();
  });
});
