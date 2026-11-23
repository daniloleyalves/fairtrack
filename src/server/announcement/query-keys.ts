import { STALE } from '../_lib/stale-times';
import type { AnnouncementAudience } from './dal';

export const announcementKeys = {
  visible: (audience: AnnouncementAudience) => ({
    queryKey: ['announcement', audience] as const,
    staleTime: STALE.CATALOG,
  }),
};
