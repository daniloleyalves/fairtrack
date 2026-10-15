import { STALE } from '../_lib/stale-times';

export const qrCodeKeys = {
  all: () => ({
    queryKey: ['qr-code'] as const,
    staleTime: STALE.MEMBERS,
  }),
};
