'use client';

import { useQuery } from '@tanstack/react-query';
import { preload, SWRConfig } from 'swr';
import { BlurFade } from '@components/magicui/blur-fade';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ACCESS_VIEW_ROLES,
  MemberRolesEnum,
} from '@/lib/auth/auth-permissions';
import {
  CATEGORIES_BY_FAIRTEILER_KEY,
  CATEGORY_KEY,
  COMPANIES_BY_FAIRTEILER_KEY,
  COMPANY_KEY,
  ORIGIN_KEY,
  ORIGINS_BY_FAIRTEILER_KEY,
} from '@/lib/config/api-routes';
import { fetcher } from '@/lib/services/swr';
import { getActiveFairteiler } from '@/server/fairteiler/queries';
import { fairteilerKeys } from '@/server/fairteiler/query-keys';
import { AccessViewTable } from './access-view-table';
import { MemberTable } from './member-table';

// Catalog preloads stay on SWR until Phase 5 (downstream mutation forms
// still consume these keys).
preload(ORIGIN_KEY, fetcher);
preload(CATEGORY_KEY, fetcher);
preload(COMPANY_KEY, fetcher);
preload(ORIGINS_BY_FAIRTEILER_KEY, fetcher);
preload(CATEGORIES_BY_FAIRTEILER_KEY, fetcher);
preload(COMPANIES_BY_FAIRTEILER_KEY, fetcher);

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
    return (
      <>
        <Skeleton className='h-[250px] w-full' />
        <Skeleton className='h-[250px] w-full' />
      </>
    );
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
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnMount: false,
        revalidateIfStale: false,
        revalidateOnReconnect: true,
      }}
    >
      <BlurFade duration={0.2}>
        <MemberTable members={teamMembers} />
      </BlurFade>
      <BlurFade duration={0.2} delay={0.1}>
        <AccessViewTable accessViews={accessViews} />
      </BlurFade>
    </SWRConfig>
  );
}
