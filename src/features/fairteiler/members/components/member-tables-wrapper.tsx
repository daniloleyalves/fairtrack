'use client';

import {
  ACCESS_VIEW_ROLES,
  MemberRolesEnum,
} from '@/lib/auth/auth-permissions';
import { AccessViewTable } from './access-view-table';
import { MemberTable } from './member-table';
import { BlurFade } from '@components/magicui/blur-fade';
import { FairteilerWithMembers } from '@server/db/db-types';
import { preload, SWRConfig } from 'swr';
import useSWRSuspense, { fetcher } from '@/lib/services/swr';
import {
  ACTIVE_FAIRTEILER_KEY,
  CATEGORIES_BY_FAIRTEILER_KEY,
  CATEGORY_KEY,
  COMPANIES_BY_FAIRTEILER_KEY,
  COMPANY_KEY,
  ORIGIN_KEY,
  ORIGINS_BY_FAIRTEILER_KEY,
} from '@/lib/config/api-routes';

preload(ORIGIN_KEY, fetcher);
preload(CATEGORY_KEY, fetcher);
preload(COMPANY_KEY, fetcher);
preload(ORIGINS_BY_FAIRTEILER_KEY, fetcher);
preload(CATEGORIES_BY_FAIRTEILER_KEY, fetcher);
preload(COMPANIES_BY_FAIRTEILER_KEY, fetcher);

export function MemberTablesWrapper() {
  const { data: fairteiler } = useSWRSuspense<FairteilerWithMembers>(
    ACTIVE_FAIRTEILER_KEY,
    {
      fetcher,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnMount: false,
    },
  );

  // Filter data based on the SWR state
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
