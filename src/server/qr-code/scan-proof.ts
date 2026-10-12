import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

/**
 * A scan proof is a short-lived, signed cookie set when someone opens a
 * fairteiler's QR code. It shows that this browser was at the fairteiler
 * recently, which verifies contributions made through either an own account
 * or the fairteiler's guest access view.
 */
export const SCAN_PROOF_COOKIE = 'fairtrack_qr_scan';
export const SCAN_PROOF_TTL_SECONDS = 30 * 60;

export interface ScanProof {
  fairteilerId: string;
  qrCodeId: string;
  /** Expiry as a Unix timestamp in milliseconds. */
  exp: number;
}

function getSecret() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error('BETTER_AUTH_SECRET is required to sign QR scan proofs');
  }
  return secret;
}

function sign(payload: string, secret: string) {
  return createHmac('sha256', secret)
    .update(`qr-scan:${payload}`)
    .digest('base64url');
}

export function createScanProof(
  fairteilerId: string,
  qrCodeId: string,
  now: number = Date.now(),
): ScanProof {
  return { fairteilerId, qrCodeId, exp: now + SCAN_PROOF_TTL_SECONDS * 1000 };
}

export function encodeScanProof(
  proof: ScanProof,
  secret: string = getSecret(),
): string {
  const payload = Buffer.from(JSON.stringify(proof)).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
}

/** Returns the proof if the signature is valid and it has not expired. */
export function decodeScanProof(
  value: string | undefined,
  now: number = Date.now(),
  secret: string = getSecret(),
): ScanProof | null {
  if (!value) return null;
  const [payload, signature, ...rest] = value.split('.');
  if (!payload || !signature || rest.length) return null;

  const expected = Buffer.from(sign(payload, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }

  try {
    const proof = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf-8'),
    ) as Partial<ScanProof>;
    if (
      typeof proof.fairteilerId !== 'string' ||
      typeof proof.qrCodeId !== 'string' ||
      typeof proof.exp !== 'number' ||
      proof.exp <= now
    ) {
      return null;
    }
    return proof as ScanProof;
  } catch {
    return null;
  }
}

export const scanProofCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SCAN_PROOF_TTL_SECONDS,
};

/** Reads the current request's scan proof, if any. */
export async function readScanProof(): Promise<ScanProof | null> {
  const cookieStore = await cookies();
  return decodeScanProof(cookieStore.get(SCAN_PROOF_COOKIE)?.value);
}
