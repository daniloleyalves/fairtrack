/** Upper bounds for one guest submission made after a QR scan. */
export const QR_GUEST_MAX_ITEMS = 20;
export const QR_GUEST_MAX_TOTAL_QUANTITY = 200; // kg

/** Public pages of the QR flow. */
export const SCAN_PATH = '/scan';
export const SCAN_GUEST_PATH = '/scan/gast';
export const SCAN_GUEST_SUCCESS_PATH = '/scan/danke';

export function qrCodeUrl(token: string, baseUrl: string) {
  return new URL(`/q/${token}`, baseUrl).toString();
}

export function userContributionPath(fairteilerSlug: string) {
  return `/hub/user/contribution?fairteilerSlug=${encodeURIComponent(fairteilerSlug)}`;
}
