'use server';

import { headers } from 'next/headers';
import {
  loadActiveMembership,
  loadActiveOrganization,
  loadCategories,
  loadCompanies,
  loadFairteilerBySlug,
  loadFairteilerCategories,
  loadFairteilerCompanies,
  loadFairteilerOrigins,
  loadFairteilers,
  loadOrigins,
  loadTagsByFairteiler,
} from './dal';
import {
  loadCalendarData,
  loadCategoryDistribution,
  loadKeyFigures,
  loadLeaderboard,
  loadOriginDistribution,
  loadRecentContributions,
} from '../contribution/dal';
import { loadAuthenticatedSession } from '../user/dal';
import { loadFairteilerTutorialWithSteps } from '../tutorial/dal';
import { MemberRoles } from '@/lib/auth/auth-permissions';
import {
  CompanyWithOrigin,
  Fairteiler,
  FairteilerWithMembers,
  GenericItem,
} from '../db/db-types';
import { NotFoundError } from '../error-handling';
import { AuthError } from '../api-helpers';
import { ANONYMOUS_USER_NAME } from '@/lib/auth/auth-helpers';

export async function getFairteilers() {
  const fairteilers = await loadFairteilers();

  if (!fairteilers) {
    throw new NotFoundError('fairteilers');
  }

  return fairteilers.map((fairteiler) => ({
    id: fairteiler.id,
    name: fairteiler.name,
    thumbnail: fairteiler.thumbnail,
    address: fairteiler.address,
    website: fairteiler.website,
    geoLink: fairteiler.geoLink,
    geoLat: fairteiler.geoLat,
    geoLng: fairteiler.geoLng,
    disabled: fairteiler.disabled,
    tags: fairteiler.tags,
    slug: fairteiler.slug,
  })) satisfies Fairteiler[];
}

export async function getTags(headers: Headers) {
  const session = await loadAuthenticatedSession(headers);
  const fairteilerId = session.session.activeOrganizationId;
  if (!fairteilerId) {
    throw new AuthError('No active organization selected.');
  }

  const tags = await loadTagsByFairteiler(fairteilerId);
  return tags;
}

export async function getActiveFairteiler() {
  const fairteiler = await loadActiveOrganization(await headers());
  if (!fairteiler) {
    throw new NotFoundError('active fairteiler');
  }

  return {
    id: fairteiler.id,
    name: fairteiler.name,
    thumbnail: fairteiler.thumbnail,
    address: fairteiler.address,
    website: fairteiler.website,
    geoLink: fairteiler.geoLink,
    geoLat: fairteiler.geoLat,
    geoLng: fairteiler.geoLng,
    disabled: fairteiler.disabled,
    tags: fairteiler.tags,
    slug: fairteiler.slug,
    members: fairteiler.members.map((member) => ({
      id: member.id,
      user: {
        id: member.user.id,
        name: member.user.name,
        firstName: member.user.firstName,
        lastName: member.user.lastName,
        email: member.user.email,
        avatar: member.user.image,
        isFirstLogin: member.user.isFirstLogin,
        isAnonymous: member.user.isAnonymous,
      },
      role: member.role,
      fairteilerId: member.organizationId,
    })),
  } satisfies FairteilerWithMembers;
}

export async function getFairteilerBySlug(fairteilerSlug: string) {
  const fairteilerData = await loadFairteilerBySlug(fairteilerSlug);

  if (!fairteilerData) {
    throw new NotFoundError('could not load fairteilerData for contribution');
  }

  const [originsData, categoriesData, companiesData, tutorialData] =
    await Promise.all([
      loadFairteilerOrigins(fairteilerData.id),
      loadFairteilerCategories(fairteilerData.id),
      loadFairteilerCompanies(fairteilerData.id),
      loadFairteilerTutorialWithSteps(fairteilerData.id),
    ]);

  return {
    fairteiler: fairteilerData,
    origins: originsData?.map((item) => item.origin) ?? [],
    categories: categoriesData?.map((item) => item.category) ?? [],
    companies: companiesData?.map((item) => item.company) ?? [],
    tutorial: tutorialData ?? undefined,
  };
}

export async function getActiveMembership(headers: Headers) {
  const membership = await loadActiveMembership(headers);
  if (!membership) {
    throw new NotFoundError('membership');
  }

  return {
    user: {
      id: membership.user.id,
      email: membership.user.email,
      name: membership.user.name,
      avatar: membership.user.image,
    },
    fairteilerId: membership.organizationId,
    role: membership.role as MemberRoles,
  };
}

export async function getOrigins(): Promise<GenericItem[]> {
  const origins = await loadOrigins();
  if (!origins) {
    throw new NotFoundError('origins');
  }

  return origins.map((origin) => ({
    id: origin.id,
    name: origin.name,
    status: origin.status,
  }));
}

export async function getOriginsByFairteiler(
  headers: Headers,
): Promise<GenericItem[]> {
  const session = await loadAuthenticatedSession(headers);
  const fairteilerId = session.session.activeOrganizationId;
  if (!fairteilerId) {
    throw new AuthError('No active organization');
  }
  const fairteilerOrigins = await loadFairteilerOrigins(fairteilerId);
  if (!fairteilerOrigins) {
    throw new NotFoundError('originsByFairteiler');
  }

  return fairteilerOrigins
    .filter((mapping) => mapping.origin?.status === 'active')
    .map((mapping) => mapping.origin as GenericItem);
}

export async function getCategories(): Promise<GenericItem[]> {
  const categories = await loadCategories();
  if (!categories) {
    throw new NotFoundError('categories');
  }

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    status: category.status,
  }));
}

export async function getCategoriesByFairteiler(
  headers: Headers,
): Promise<GenericItem[]> {
  const session = await loadAuthenticatedSession(headers);
  const fairteilerId = session.session.activeOrganizationId;
  if (!fairteilerId) {
    throw new AuthError('No active organization');
  }
  const fairteilerCategories = await loadFairteilerCategories(fairteilerId);
  if (!fairteilerCategories) {
    throw new NotFoundError('categoriesByFairteiler');
  }

  return fairteilerCategories
    .filter((mapping) => mapping.category?.status === 'active')
    .map((mapping) => mapping.category as GenericItem);
}

export async function getCompanies(): Promise<CompanyWithOrigin[]> {
  const companies = await loadCompanies();
  if (!companies) {
    throw new NotFoundError('companies');
  }

  return companies.map((company) => ({
    id: company.id,
    name: company.name,
    status: company.status,
    originId: company.originId,
    originName: company.origin?.name ?? null,
  }));
}

export async function getCompaniesByFairteiler(
  headers: Headers,
): Promise<GenericItem[]> {
  const session = await loadAuthenticatedSession(headers);
  const fairteilerId = session.session.activeOrganizationId;
  if (!fairteilerId) {
    throw new AuthError('No active organization');
  }
  const fairteilerCompanies = await loadFairteilerCompanies(fairteilerId);
  if (!fairteilerCompanies) {
    throw new NotFoundError('companiesByFairteiler');
  }

  return fairteilerCompanies
    .filter((mapping) => mapping.company?.status === 'active')
    .map((mapping) => mapping.company as GenericItem);
}

/**
 * Orchestrates loading and transforming all data required for the fairteiler dashboard.
 */
export async function getFairteilerDashboardData() {
  const session = await loadAuthenticatedSession(await headers());
  const fairteilerId = session.session.activeOrganizationId;
  if (!fairteilerId) {
    throw new AuthError('No active organization selected.');
  }

  const [
    keyFigures,
    categoryDistribution,
    originDistribution,
    leaderboard,
    recentContributions,
    calendarData,
  ] = await Promise.all([
    loadKeyFigures(fairteilerId),
    loadCategoryDistribution(fairteilerId),
    loadOriginDistribution(fairteilerId),
    loadLeaderboard(fairteilerId),
    loadRecentContributions(fairteilerId),
    loadCalendarData(fairteilerId),
  ]);

  const formattedKeyFigures = [
    {
      value: parseFloat(keyFigures?.[0].totalQuantity ?? '0'),
      description: 'gerettet',
      color: 'primary',
      unit: 'kg',
    },
    {
      value: keyFigures?.[0].totalContributions ?? 0,
      description: 'Abgaben',
      color: 'default',
    },
  ];

  const formattedCategoryDistribution = {
    name: 'Kategorien',
    data: categoryDistribution?.map((item, index) => ({
      position: index + 1,
      value: parseFloat(item.totalQuantity?.toString() ?? '0'),
      description: item.name ?? 'Unkategorisiert',
    })),
  };

  const formattedOriginDistribution = {
    name: 'Herkunft',
    data: originDistribution?.map((item, index) => ({
      position: index + 1,
      value: parseFloat(item.totalQuantity?.toString() ?? '0'),
      description: item.name ?? 'Unbekannt',
    })),
  };

  const formattedLeaderboardEntries =
    leaderboard?.map((e) => {
      const isAnonymous = e.userIsAnonymous ?? false;

      return {
        id: e.userId,
        name: isAnonymous ? ANONYMOUS_USER_NAME : (e.userName ?? 'N/A'),
        email: isAnonymous ? null : e.email,
        image: isAnonymous ? null : (e.userImage ?? null),
        totalQuantity: parseFloat(e.totalQuantity?.toString() ?? '0'),
      };
    }) ?? [];

  const formattedCalendarData = calendarData?.map((d) => ({
    value: d.date,
    quantity: parseFloat(d.quantity?.toString() ?? '0'),
  }));

  return {
    keyFigures: formattedKeyFigures,
    categoryDistribution: formattedCategoryDistribution,
    originDistribution: formattedOriginDistribution,
    leaderboardEntries: formattedLeaderboardEntries,
    recentContributions: recentContributions,
    calendarData: formattedCalendarData,
  };
}
