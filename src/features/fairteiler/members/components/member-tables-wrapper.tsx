'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ACCESS_VIEW_ROLES,
  MemberRolesEnum,
} from '@/lib/auth/auth-permissions';
import { getActiveFairteiler } from '@/server/fairteiler/queries';
import { fairteilerKeys } from '@/server/fairteiler/query-keys';
import { AccessViewTable } from './access-view-table';
import { MemberTable } from './member-table';
import { MembersSkeleton } from './members-skeleton';

export function MemberTablesWrapper() {
  const {
    data: fairteiler,
    isPending,
    error,
  } = useQuery({
    ...fairteilerKeys.active(),
    queryFn: () => getActiveFairteiler(),
  });

  if (isPending) {
    return <MembersSkeleton />;
  }

  if (error) {
    throw error;
  }

  if (!fairteiler) {
    throw new Error('Fairteiler nicht gefunden.');
  }

  const teamMembers = fairteiler.members.filter(
    (member) => !ACCESS_VIEW_ROLES.has(member.role as MemberRolesEnum),
  );
  const accessViews = fairteiler.members.filter((member) =>
    ACCESS_VIEW_ROLES.has(member.role as MemberRolesEnum),
  );

  return (
    <>
      <div>
        <MemberTable members={teamMembers} />
      </div>
      <div>
        <AccessViewTable accessViews={accessViews} />
      </div>
    </>
  );
}
