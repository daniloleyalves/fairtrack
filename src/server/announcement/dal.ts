import 'server-only';
import {
  and,
  desc,
  eq,
  exists,
  gt,
  isNull,
  lte,
  notExists,
  or,
  sql,
} from 'drizzle-orm';
import { attempt } from '@/lib/attempt';
import { db } from '../db/drizzle';
import { announcement, announcementDismissal, member } from '../db/schema';
import { handleDatabaseError } from '../error-handling';

export type AnnouncementAudience =
  (typeof announcement.audience.enumValues)[number];

export async function loadVisibleAnnouncements(
  audience: AnnouncementAudience,
  userId: string,
) {
  const now = new Date();
  const userMembership = (condition: ReturnType<typeof sql>) =>
    db
      .select({ id: member.id })
      .from(member)
      .where(and(eq(member.userId, userId), condition));

  const [error, data] = await attempt(
    db
      .select({
        id: announcement.id,
        title: announcement.title,
        message: announcement.message,
        highlights: announcement.highlights,
        linkUrl: announcement.linkUrl,
        linkLabel: announcement.linkLabel,
      })
      .from(announcement)
      .where(
        and(
          eq(announcement.audience, audience),
          lte(announcement.startsAt, now),
          or(isNull(announcement.endsAt), gt(announcement.endsAt, now)),
          or(
            isNull(announcement.fairteilerId),
            exists(
              userMembership(
                sql`${member.organizationId} = ${announcement.fairteilerId}`,
              ),
            ),
          ),
          or(
            isNull(announcement.roles),
            exists(
              userMembership(sql`${member.role} = any(${announcement.roles})`),
            ),
          ),
          notExists(
            db
              .select({ userId: announcementDismissal.userId })
              .from(announcementDismissal)
              .where(
                and(
                  eq(announcementDismissal.announcementId, announcement.id),
                  eq(announcementDismissal.userId, userId),
                ),
              ),
          ),
        ),
      )
      .orderBy(desc(announcement.startsAt)),
  );

  if (error) handleDatabaseError(error, 'loadVisibleAnnouncements');
  return data ?? [];
}

export async function insertAnnouncementDismissal(
  announcementId: string,
  userId: string,
) {
  const [error] = await attempt(
    db
      .insert(announcementDismissal)
      .values({ announcementId, userId })
      .onConflictDoNothing(),
  );

  if (error) handleDatabaseError(error, 'insertAnnouncementDismissal');
}
