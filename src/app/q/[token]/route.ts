import { NextRequest, NextResponse } from 'next/server';
import { loadActiveQrCodeByToken } from '@/server/qr-code/dal';
import {
  createScanProof,
  encodeScanProof,
  SCAN_PROOF_COOKIE,
  scanProofCookieOptions,
} from '@/server/qr-code/scan-proof';
import { SCAN_PATH } from '@/server/qr-code/constants';

/**
 * Target of the QR code printed at a fairteiler. Records the scan in a
 * short-lived signed cookie and moves on to the page where people choose how
 * to contribute, so the token itself never shows up in the address bar.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const qrCode = await loadActiveQrCodeByToken(token);

  if (!qrCode || qrCode.fairteiler.disabled) {
    const invalidUrl = new URL(SCAN_PATH, request.url);
    invalidUrl.searchParams.set('fehler', 'ungueltig');
    const response = NextResponse.redirect(invalidUrl);
    response.cookies.delete(SCAN_PROOF_COOKIE);
    return response;
  }

  const response = NextResponse.redirect(new URL(SCAN_PATH, request.url));
  response.cookies.set(
    SCAN_PROOF_COOKIE,
    encodeScanProof(createScanProof(qrCode.fairteilerId, qrCode.id)),
    scanProofCookieOptions,
  );
  return response;
}
