export const SCAN_PATH = '/scan';
export const FAIRTEILER_CONTRIBUTION_PATH = '/hub/fairteiler/contribution';

export function qrCodeUrl(token: string, baseUrl: string) {
  return new URL(`/q/${token}`, baseUrl).toString();
}

export function userContributionPath(fairteilerSlug: string) {
  return `/hub/user/contribution?fairteilerSlug=${encodeURIComponent(fairteilerSlug)}`;
}
