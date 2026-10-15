'use server';

import { headers } from 'next/headers';
import { announcement } from '../db/schema';
import { loadSession } from '../user/dal';
import { AnnouncementAudience, loadVisibleAnnouncements } from './dal';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  highlights: string[];
  linkUrl: string | null;
  linkLabel: string | null;
}

export async function getVisibleAnnouncements(
  audience: AnnouncementAudience,
): Promise<Announcement[]> {
  if (!announcement.audience.enumValues.includes(audience)) return [];

  const session = await loadSession(await headers());
  if (!session) return [];

  const announcements = await loadVisibleAnnouncements(
    audience,
    session.user.id,
  );
  return announcements.map((item) => ({
    ...item,
    highlights: item.highlights ?? [],
  }));
}
