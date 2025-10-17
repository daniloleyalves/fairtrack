import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { headers } from 'next/headers';
import {
  getSession,
  getFairteilers,
  getActiveFairteiler,
  getActiveMembership,
  getOrigins,
  getOriginsByFairteiler,
  getCategories,
  getCategoriesByFairteiler,
  getCompanies,
  getCompaniesByFairteiler,
  getRecentCheckinsWithinLastMinute,
  getFairteilerDashboardData,
  getContributions,
  getVersionHistoryByCheckinId,
} from '../dto';
import * as dal from '../dal';
import {
  mockCategories,
  mockCheckins,
  mockCompanies,
  mockContributions,
  mockContributionVersionHistory,
  mockFairteiler,
  mockMembership,
  mockOrigins,
  mockSession,
} from '@/__tests__/mocks/server-only';
import { NotFoundError } from '../error-handling';

// Mock all DAL functions
vi.mock('../dal', () => ({
  loadAuthenticatedSession: vi.fn(),
  loadSession: vi.fn(),
  loadActiveMembership: vi.fn(),
  loadFairteiler: vi.fn(),
  loadFairteilers: vi.fn(),
  loadActiveOrganization: vi.fn(),
  loadOrigins: vi.fn(),
  loadFairteilerOrigins: vi.fn(),
  loadCategories: vi.fn(),
  loadFairteilerCategories: vi.fn(),
  loadCompanies: vi.fn(),
  loadFairteilerCompanies: vi.fn(),
  loadContributions: vi.fn(),
  loadContributionVersionHistory: vi.fn(),
  loadCheckinsWithinTimeframe: vi.fn(),
  loadKeyFigures: vi.fn(),
  loadCategoryDistribution: vi.fn(),
  loadOriginDistribution: vi.fn(),
  loadLeaderboard: vi.fn(),
  loadRecentContributions: vi.fn(),
  loadCalendarData: vi.fn(),
}));

// Mock Next.js headers
vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

describe('DTO Layer', () => {
  const mockHeaders = new Headers();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(headers).mockResolvedValue(mockHeaders);
  });

  describe('Authentication & Session Management', () => {
    describe('getSession', () => {
      it('should return transformed session data when DAL returns valid data', async () => {
        vi.mocked(dal.loadSession).mockResolvedValue(mockSession);

        const result = await getSession(mockHeaders);

        expect(dal.loadSession).toHaveBeenCalledWith(mockHeaders, undefined);
        expect(result).toEqual({
          session: {
            activeOrganizationId: mockSession.session.activeOrganizationId,
            userId: mockSession.session.userId,
          },
          user: {
            id: mockSession.user.id,
            name: mockSession.user.name,
            firstName: mockSession.user.firstName,
            lastName: mockSession.user.lastName,
            email: mockSession.user.email,
            avatar: mockSession.user.image,
            isFirstLogin: mockSession.user.isFirstLogin,
            isAnonymous: mockSession.user.isAnonymous,
          },
        });
      });

      it('should handle missing user image gracefully', async () => {
        const sessionWithoutImage = {
          ...mockSession,
          user: { ...mockSession.user, image: null },
        };
        vi.mocked(dal.loadSession).mockResolvedValue(sessionWithoutImage);

        const result = await getSession(mockHeaders);

        expect(result?.user.avatar).toBeNull();
      });
    });

    describe('getActiveMembership', () => {
      it('should return transformed membership data when DAL returns valid data', async () => {
        vi.mocked(dal.loadActiveMembership).mockResolvedValue(mockMembership);

        const result = await getActiveMembership(mockHeaders);

        expect(dal.loadActiveMembership).toHaveBeenCalledWith(mockHeaders);
        expect(result).toEqual({
          user: {
            id: 'user-123',
            name: 'Test User',
            email: 'test@example.com',
            avatar: 'https://example.com/avatar.jpg',
          },
          fairteilerId: 'fairteiler-123',
          role: 'owner',
        });
      });

      it('should fail when DAL returns null', async () => {
        vi.mocked(dal.loadActiveMembership).mockResolvedValue(null);

        await expect(getActiveMembership(mockHeaders)).rejects.toThrow(
          new NotFoundError('membership'),
        );
      });
    });
  });

  describe('Organization Management', () => {
    describe('getFairteilers', () => {
      it('should return transformed fairteiler data when DAL returns valid data', async () => {
        vi.mocked(dal.loadFairteilers).mockResolvedValue([mockFairteiler]);

        const result = await getFairteilers();

        expect(dal.loadFairteilers).toHaveBeenCalled();
        expect(result).toEqual([
          {
            id: mockFairteiler.id,
            name: mockFairteiler.name,
            thumbnail: mockFairteiler.thumbnail,
            address: mockFairteiler.address,
            website: mockFairteiler.website,
            geoLink: mockFairteiler.geoLink,
            geoLat: mockFairteiler.geoLat,
            geoLng: mockFairteiler.geoLng,
            disabled: mockFairteiler.disabled,
            tags: mockFairteiler.tags,
            slug: mockFairteiler.slug,
          },
        ]);
      });
    });

    describe('getActiveFairteiler', () => {
      it('should return transformed fairteiler with members when DAL returns valid data', async () => {
        vi.mocked(dal.loadActiveOrganization).mockResolvedValue(mockFairteiler);

        const result = await getActiveFairteiler(mockHeaders);

        expect(dal.loadActiveOrganization).toHaveBeenCalledWith(mockHeaders);
        expect(result).toEqual({
          id: mockFairteiler.id,
          name: mockFairteiler.name,
          thumbnail: mockFairteiler.thumbnail,
          address: mockFairteiler.address,
          website: mockFairteiler.website,
          geoLink: mockFairteiler.geoLink,
          geoLat: mockFairteiler.geoLat,
          geoLng: mockFairteiler.geoLng,
          disabled: mockFairteiler.disabled,
          tags: mockFairteiler.tags,
          slug: mockFairteiler.slug,
          members: mockFairteiler.members.map((member) => ({
            id: member.id,
            user: {
              id: member.user.id,
              name: member.user.name,
              firstName: member.user.firstName,
              lastName: member.user.lastName,
              email: member.user.email,
              avatar: member.user.image,
              isFirstLogin: false,
              isAnonymous: false,
            },
            role: member.role,
            fairteilerId: member.organizationId,
          })),
        });
      });

      it('should fail when DAL returns null', async () => {
        vi.mocked(dal.loadActiveOrganization).mockResolvedValue(null);

        await expect(getActiveFairteiler(mockHeaders)).rejects.toThrow(
          new NotFoundError('active fairteiler'),
        );
      });
    });
  });

  describe('Selection Data Management', () => {
    describe('Origins', () => {
      describe('getOrigins', () => {
        it('should return transformed origin data when DAL returns valid data', async () => {
          vi.mocked(dal.loadOrigins).mockResolvedValue(mockOrigins);

          const result = await getOrigins();

          expect(dal.loadOrigins).toHaveBeenCalled();
          expect(result).toEqual(
            mockOrigins.map((category) => ({
              id: category.id,
              name: category.name,
              status: category.status,
            })),
          );
        });
      });

      describe('getOriginsByFairteiler', () => {
        it('should return filtered active origins when DAL returns valid data', async () => {
          vi.mocked(dal.loadAuthenticatedSession).mockResolvedValue(
            mockSession,
          );
          const mockFairteilerOrigins = [
            {
              id: 'fairteiler-origin-123',
              origin: mockOrigins[0],
              fairteilerId: mockFairteiler.id,
              originId: 'origin-123',
              createdAt: new Date(),
            },
            {
              id: 'fairteiler-origin-456',
              origin: mockOrigins[1],
              fairteilerId: mockFairteiler.id,
              originId: 'origin-123',
              createdAt: new Date(),
            },
          ];
          vi.mocked(dal.loadFairteilerOrigins).mockResolvedValue(
            mockFairteilerOrigins,
          );

          const result = await getOriginsByFairteiler(mockHeaders);

          expect(dal.loadFairteilerOrigins).toHaveBeenCalledWith(
            mockFairteiler.id,
          );
          expect(result).toEqual([mockOrigins[0]]);
        });
      });
    });

    describe('Categories', () => {
      describe('getCategories', () => {
        it('should return transformed category data when DAL returns valid data', async () => {
          vi.mocked(dal.loadCategories).mockResolvedValue(mockCategories);

          const result = await getCategories();

          expect(dal.loadCategories).toHaveBeenCalled();
          expect(result).toEqual(
            mockCategories.map((category) => ({
              id: category.id,
              name: category.name,
              status: category.status,
            })),
          );
        });
      });

      describe('getCategoriesByFairteiler', () => {
        it('should return filtered active categories when DAL returns valid data', async () => {
          vi.mocked(dal.loadAuthenticatedSession).mockResolvedValue(
            mockSession,
          );
          const mockFairteilerCategories = [
            {
              id: 'fairteiler-category-123',
              category: mockCategories[0],
              fairteilerId: mockFairteiler.id,
              categoryId: 'category-123',
              createdAt: new Date(),
            },
            {
              id: 'fairteiler-category-456',
              category: mockCategories[1],
              fairteilerId: mockFairteiler.id,
              categoryId: 'category-123',
              createdAt: new Date(),
            },
          ];
          vi.mocked(dal.loadFairteilerCategories).mockResolvedValue(
            mockFairteilerCategories,
          );

          const result = await getCategoriesByFairteiler(mockHeaders);

          expect(dal.loadFairteilerCategories).toHaveBeenCalledWith(
            mockFairteiler.id,
          );
          expect(result).toEqual([mockCategories[0]]);
        });
      });
    });

    describe('Companies', () => {
      describe('getCompanies', () => {
        it('should return transformed company data when DAL returns valid data', async () => {
          vi.mocked(dal.loadCompanies).mockResolvedValue(mockCompanies);

          const result = await getCompanies();

          expect(dal.loadCompanies).toHaveBeenCalled();
          expect(result).toEqual(
            mockCompanies.map((company) => ({
              id: company.id,
              name: company.name,
              status: company.status,
            })),
          );
        });
      });

      describe('getCompaniesByFairteiler', () => {
        it('should return filtered active companies when DAL returns valid data', async () => {
          vi.mocked(dal.loadAuthenticatedSession).mockResolvedValue(
            mockSession,
          );
          const mockFairteilerCompanies = [
            {
              id: 'fairteiler-company-123',
              company: mockCompanies[0],
              fairteilerId: 'fairteiler-123',
              companyId: 'company-123',
              createdAt: new Date(),
            },
            {
              id: 'fairteiler-company-456',
              company: mockCompanies[1],
              fairteilerId: 'fairteiler-123',
              companyId: 'company-123',
              createdAt: new Date(),
            },
          ];
          vi.mocked(dal.loadFairteilerCompanies).mockResolvedValue(
            mockFairteilerCompanies,
          );

          const result = await getCompaniesByFairteiler(mockHeaders);

          expect(dal.loadFairteilerCompanies).toHaveBeenCalledWith(
            mockFairteiler.id,
          );
          expect(result).toEqual([mockCompanies[0]]);
        });
      });
    });
  });

  describe('Contribution Management', () => {
    describe('getRecentCheckinsWithinLastMinute', () => {
      beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it('should return transformed checkin data within last minute', async () => {
        vi.mocked(dal.loadAuthenticatedSession).mockResolvedValue(mockSession);
        vi.mocked(dal.loadCheckinsWithinTimeframe).mockResolvedValue(
          mockCheckins,
        );

        const result = await getRecentCheckinsWithinLastMinute(mockHeaders);

        expect(dal.loadCheckinsWithinTimeframe).toHaveBeenCalledWith(
          mockSession.user.id,
          {
            from: new Date('2024-01-01T11:59:00Z'),
            to: new Date('2024-01-01T12:00:00Z'),
          },
        );
        expect(result).toEqual([
          {
            id: 'checkin-001',
            title: 'Fresh Apples',
            category: {
              id: 'cat-001',
              name: 'Fruits',
              description: 'Fresh fruits of all kinds',
              image: 'https://example.com/images/fruits.png',
              status: 'active' as 'active' | 'pending' | 'disabled',
              createdAt: new Date('2023-01-01T00:00:00Z'),
            },
            quantity: 2.0,
          },
          {
            id: 'checkin-002',
            title: 'Fresh Bananas',
            category: {
              id: 'cat-001',
              name: 'Fruits',
              description: 'Fresh fruits of all kinds',
              image: 'https://example.com/images/fruits.png',
              status: 'active' as 'active' | 'pending' | 'disabled',
              createdAt: new Date('2023-01-01T00:00:00Z'),
            },
            quantity: 5.0,
          },
        ]);
      });

      it('should return empty array when no checkins found', async () => {
        vi.mocked(dal.loadCheckinsWithinTimeframe).mockResolvedValue([]);

        const result = await getRecentCheckinsWithinLastMinute(mockHeaders);

        expect(result).toEqual([]);
      });
    });

    describe('getContributions', () => {
      it('should return contributions for authenticated user', async () => {
        vi.mocked(dal.loadAuthenticatedSession).mockResolvedValue(mockSession);
        vi.mocked(dal.loadContributions).mockResolvedValue(mockContributions);

        const result = await getContributions(mockHeaders);

        expect(result).toEqual(mockContributions);
      });
    });

    describe('getVersionHistoryByCheckinId', () => {
      it('should return formatted version history when DAL returns valid data', async () => {
        vi.mocked(dal.loadAuthenticatedSession).mockResolvedValue(mockSession);
        vi.mocked(dal.loadContributionVersionHistory).mockResolvedValue(
          mockContributionVersionHistory,
        );

        const result = await getVersionHistoryByCheckinId(
          mockHeaders,
          'checkin-001',
        );

        const expectedResult = mockContributionVersionHistory.map((item) => ({
          id: item.id,
          checkinId: item.checkinId,
          fairteilerId: item.fairteilerId,
          userId: item.userId,
          authorName: item.user.name,
          authorEmail: item.user.email,
          prevValue: item.prevValue,
          newValue: item.newValue,
          field: item.field,
          changeDate: item.createdAt,
        }));

        expect(result).toEqual(expectedResult);
      });
    });
  });

  describe('Dashboard Data Orchestration', () => {
    describe('getFairteilerDashboardData', () => {
      it('should orchestrate all data loading and return formatted dashboard', async () => {
        const mockKeyFigures = [
          {
            totalQuantity: '150.5',
            totalContributions: 25,
            activeContributors: 5,
          },
        ];
        const mockCategoryDistribution = [
          { name: 'Category 1', totalQuantity: '10' },
          { name: 'Category 2', totalQuantity: '20' },
        ];
        const mockOriginDistribution = [
          { name: 'Origin 1', totalQuantity: '15' },
        ];
        const mockLeaderboard = [
          {
            userId: 'user-1',
            email: 'top@example.com',
            userName: 'Top Contributor',
            userImage: 'https://example.com/top.jpg',
            userIsAnonymous: false,
            totalQuantity: '100.5',
          },
        ];
        const mockRecentContributions = [
          {
            id: 'contrib-1',
            date: new Date('2024-01-01'),
            title: 'Test Food',
            quantity: 5,
            category: { name: 'Test Category', image: null },
          },
        ];
        const mockCalendarData = [
          { date: new Date('2024-01-01'), quantity: '10.5' },
        ];

        vi.mocked(dal.loadAuthenticatedSession).mockResolvedValue(mockSession);
        vi.mocked(dal.loadKeyFigures).mockResolvedValue(mockKeyFigures);
        vi.mocked(dal.loadCategoryDistribution).mockResolvedValue(
          mockCategoryDistribution,
        );
        vi.mocked(dal.loadOriginDistribution).mockResolvedValue(
          mockOriginDistribution,
        );
        vi.mocked(dal.loadLeaderboard).mockResolvedValue(mockLeaderboard);
        vi.mocked(dal.loadRecentContributions).mockResolvedValue(
          mockRecentContributions,
        );
        vi.mocked(dal.loadCalendarData).mockResolvedValue(mockCalendarData);

        const result = await getFairteilerDashboardData(mockHeaders);

        expect(dal.loadAuthenticatedSession).toHaveBeenCalledWith(mockHeaders);
        expect(result).toEqual({
          keyFigures: [
            {
              value: 150.5,
              description: 'gerettet',
              color: 'primary',
              unit: 'kg',
            },
            {
              value: 25,
              description: 'Abgaben',
              color: 'default',
            },
          ],
          categoryDistribution: {
            name: 'Kategorien',
            data: [
              { position: 1, value: 10, description: 'Category 1' },
              { position: 2, value: 20, description: 'Category 2' },
            ],
          },
          originDistribution: {
            name: 'Herkunft',
            data: [{ position: 1, value: 15, description: 'Origin 1' }],
          },
          leaderboardEntries: [
            {
              id: 'user-1',
              name: 'Top Contributor',
              email: 'top@example.com',
              image: 'https://example.com/top.jpg',
              totalQuantity: 100.5,
            },
          ],
          recentContributions: mockRecentContributions,
          calendarData: [{ value: new Date('2024-01-01'), quantity: 10.5 }],
        });
      });

      it('should handle empty data gracefully', async () => {
        vi.mocked(dal.loadAuthenticatedSession).mockResolvedValue(mockSession);
        vi.mocked(dal.loadKeyFigures).mockResolvedValue([
          { totalQuantity: null, totalContributions: 0, activeContributors: 0 },
        ]);
        vi.mocked(dal.loadCategoryDistribution).mockResolvedValue([]);
        vi.mocked(dal.loadOriginDistribution).mockResolvedValue([]);
        vi.mocked(dal.loadLeaderboard).mockResolvedValue([]);
        vi.mocked(dal.loadRecentContributions).mockResolvedValue([]);
        vi.mocked(dal.loadCalendarData).mockResolvedValue([]);

        const result = await getFairteilerDashboardData(mockHeaders);

        expect(result.keyFigures).toEqual([
          {
            value: 0,
            description: 'gerettet',
            color: 'primary',
            unit: 'kg',
          },
          {
            value: 0,
            description: 'Abgaben',
            color: 'default',
          },
        ]);
        expect(result.categoryDistribution.data).toEqual([]);
        expect(result.originDistribution.data).toEqual([]);
        expect(result.leaderboardEntries).toEqual([]);
        expect(result.recentContributions).toEqual([]);
        expect(result.calendarData).toEqual([]);
      });

      it('should handle null values in data', async () => {
        const mockCategoryDistribution = [
          { name: null, totalQuantity: null },
          { name: 'Valid Category', totalQuantity: '15.5' },
        ];
        const mockLeaderboard = [
          {
            userId: 'user-1',
            email: 'test@example.com',
            userName: null,
            userImage: null,
            userIsAnonymous: false,
            totalQuantity: null,
          },
        ];
        const mockCalendarData = [
          { date: new Date('2024-01-01'), quantity: null },
          { date: new Date('2024-01-02'), quantity: '15.5' },
        ];

        vi.mocked(dal.loadAuthenticatedSession).mockResolvedValue(mockSession);
        vi.mocked(dal.loadKeyFigures).mockResolvedValue([
          { totalQuantity: null, totalContributions: 0, activeContributors: 0 },
        ]);
        vi.mocked(dal.loadCategoryDistribution).mockResolvedValue(
          mockCategoryDistribution,
        );
        vi.mocked(dal.loadOriginDistribution).mockResolvedValue([]);
        vi.mocked(dal.loadLeaderboard).mockResolvedValue(mockLeaderboard);
        vi.mocked(dal.loadRecentContributions).mockResolvedValue([]);
        vi.mocked(dal.loadCalendarData).mockResolvedValue(mockCalendarData);

        const result = await getFairteilerDashboardData(mockHeaders);

        expect(result.categoryDistribution.data).toEqual([
          { position: 1, value: 0, description: 'Unkategorisiert' },
          { position: 2, value: 15.5, description: 'Valid Category' },
        ]);
        expect(result.leaderboardEntries).toEqual([
          {
            id: 'user-1',
            name: 'N/A',
            email: 'test@example.com',
            image: null,
            totalQuantity: 0,
          },
        ]);
        expect(result.calendarData).toEqual([
          { value: new Date('2024-01-01'), quantity: 0 },
          { value: new Date('2024-01-02'), quantity: 15.5 },
        ]);
      });
    });
  });

  describe('Error Handling & Edge Cases', () => {
    describe('Database Connection Failures', () => {
      it('should propagate DAL errors in getSession', async () => {
        const dbError = new Error('Database connection lost');
        vi.mocked(dal.loadSession).mockRejectedValue(dbError);

        await expect(getSession(mockHeaders)).rejects.toThrow(
          'Database connection lost',
        );
      });

      it('should propagate DAL errors in getFairteilerDashboardData', async () => {
        const dbError = new Error('Database timeout');
        vi.mocked(dal.loadAuthenticatedSession).mockResolvedValue(mockSession);
        vi.mocked(dal.loadKeyFigures).mockRejectedValue(dbError);

        await expect(getFairteilerDashboardData(mockHeaders)).rejects.toThrow(
          'Database timeout',
        );
      });
    });

    describe('Authentication Errors', () => {
      it('should handle authentication errors in getContributions', async () => {
        const authError = new Error('Session expired');
        vi.mocked(dal.loadAuthenticatedSession).mockRejectedValue(authError);

        await expect(getContributions(mockHeaders)).rejects.toThrow(
          'Session expired',
        );
      });

      it('should handle authentication errors in getFairteilerDashboardData', async () => {
        const authError = new Error('Unauthorized');
        vi.mocked(dal.loadAuthenticatedSession).mockRejectedValue(authError);

        await expect(getFairteilerDashboardData(mockHeaders)).rejects.toThrow(
          'Unauthorized',
        );
      });
    });

    describe('Type Safety', () => {
      it('should handle string numbers in key figures', async () => {
        const mockKeyFigures = [
          {
            totalQuantity: 'invalid-number',
            totalContributions: -1,
            activeContributors: 0,
          },
        ];
        vi.mocked(dal.loadAuthenticatedSession).mockResolvedValue(mockSession);
        vi.mocked(dal.loadKeyFigures).mockResolvedValue(mockKeyFigures);
        vi.mocked(dal.loadCategoryDistribution).mockResolvedValue([]);
        vi.mocked(dal.loadOriginDistribution).mockResolvedValue([]);
        vi.mocked(dal.loadLeaderboard).mockResolvedValue([]);
        vi.mocked(dal.loadRecentContributions).mockResolvedValue([]);
        vi.mocked(dal.loadCalendarData).mockResolvedValue([]);

        const result = await getFairteilerDashboardData(mockHeaders);

        expect(result.keyFigures[0].value).toBeNaN();
        expect(result.keyFigures[1].value).toBe(-1);
      });
    });
  });
});
