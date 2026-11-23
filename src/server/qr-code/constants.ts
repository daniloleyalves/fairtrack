export const SCAN_PATH = '/scan';
export const SCAN_GUEST_PATH = '/scan/gast';
export const SCAN_GUEST_SUCCESS_PATH = '/scan/danke';

export function qrCodeUrl(token: string, baseUrl: string) {
  return new URL(`/q/${token}`, baseUrl).toString();
}

export function userContributionPath(fairteilerSlug: string) {
  return `/hub/user/contribution?fairteilerSlug=${encodeURIComponent(fairteilerSlug)}`;
}
