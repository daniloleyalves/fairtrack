'use client';

import { useQuery } from '@tanstack/react-query';
import { BlurFade } from '@components/magicui/blur-fade';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ACCESS_VIEW_ROLES,
  MemberRolesEnum,
} from '@/lib/auth/auth-permissions';
import { getActiveFairteiler } from '@/server/fairteiler/queries';
import { fairteilerKeys } from '@/server/fairteiler/query-keys';
import { AccessViewTable } from './access-view-table';
import { MemberTable } from './member-table';

export function MemberTablesWrapper() {
  const { data: fairteiler, isPending } = useQuery({
    ...fairteilerKeys.active(),
    queryFn: () => getActiveFairteiler(),
  });

  if (isPending || !fairteiler) {
    return (
      <>
        <Skeleton className='h-[250px] w-full' />
        <Skeleton className='h-[250px] w-full' />
      </>
    );
  }

  const teamMembers = fairteiler.members.filter(
    (member) => !ACCESS_VIEW_ROLES.has(member.role as MemberRolesEnum),
  );
  const accessViews = fairteiler.members.filter((member) =>
    ACCESS_VIEW_ROLES.has(member.role as MemberRolesEnum),
  );

  return (
    <>
      <BlurFade duration={0.2}>
        <MemberTable members={teamMembers} />
      </BlurFade>
      <BlurFade duration={0.2} delay={0.1}>
        <AccessViewTable accessViews={accessViews} />
      </BlurFade>
    </>
  );
}
