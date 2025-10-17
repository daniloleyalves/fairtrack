import { describe, it, expect, vi, beforeEach } from 'vitest';
import { headers } from 'next/headers';
import {
  suggestNewOriginAction,
  addFairteilerOriginAction,
  removeFairteilerOriginAction,
  suggestNewCategoryAction,
  addFairteilerCategoryAction,
  removeFairteilerCategoryAction,
  suggestNewCompanyAction,
  addFairteilerCompanyAction,
  removeFairteilerCompanyAction,
  submitContributionAction,
  editContributionAction,
  exportContributionsAction,
} from '../actions';
import * as dal from '../dal';
import { NotFoundError, ValidationError } from '../error-handling';
import { AuthError } from '../api-helpers';
import type { GenericItem } from '../db/db-types';
import {
  mockCategories,
  mockCompanies,
  mockFairteiler,
  mockOrigins,
  mockSession,
} from '@/__tests__/mocks/server-only';
import { checkPermissionOnServer } from '@/lib/auth/auth';
import { loadAuthenticatedSession } from '../dal';

// Mockk all auth functions
vi.mock('@lib/auth/auth', () => ({
  checkPermissionOnServer: vi.fn(),
}));

// Mock all DAL functions
vi.mock('../dal', () => ({
  addOrigin: vi.fn(),
  addFairteilerOrigin: vi.fn(),
  removeFairteilerOrigin: vi.fn(),
  addCategory: vi.fn(),
  addFairteilerCategory: vi.fn(),
  removeFairteilerCategory: vi.fn(),
  addCompany: vi.fn(),
  addFairteilerCompany: vi.fn(),
  removeFairteilerCompany: vi.fn(),
  checkinContribution: vi.fn(),
  addVersionHistoryRecord: vi.fn(),
  loadAuthenticatedSession: vi.fn(),
  loadContributions: vi.fn(),
  checkInvitationAndUser: vi.fn(),
}));

// Mock Next.js headers
vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

describe('Server Actions', () => {
  const mockHeaders = new Headers();
  const mockGenericItem: GenericItem = {
    id: 'test-id',
    name: 'Test Item',
    status: 'active',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(headers).mockResolvedValue(mockHeaders);
    vi.mocked(checkPermissionOnServer).mockResolvedValue({
      success: true,
      error: null,
    });
    vi.mocked(loadAuthenticatedSession).mockResolvedValue(mockSession);
  });

  describe('Origin Management Actions', () => {
    describe('suggestNewOriginAction', () => {
      it('should successfully suggest a new origin', async () => {
        vi.mocked(dal.addOrigin).mockResolvedValue(mockOrigins);

        const result = await suggestNewOriginAction(mockGenericItem);

        expect(dal.addOrigin).toHaveBeenCalledWith(mockGenericItem);
        expect(result).toEqual({
          success: true,
          message: 'Herkunft erfolgreich vorgeschlagen.',
          data: mockGenericItem,
        });
      });

      it('should return error when origin creation fails', async () => {
        (
          vi.mocked(dal.addOrigin) as ReturnType<typeof vi.fn>
        ).mockResolvedValue(null);

        await expect(suggestNewOriginAction(mockGenericItem)).rejects.toThrow();
      });

      it('should return validation error for invalid input', async () => {
        // Use unknown to bypass TypeScript validation for testing
        const invalidInput = {
          id: '',
          name: '',
          status: 'invalid',
        } as unknown as GenericItem;

        const result = await suggestNewOriginAction(invalidInput);

        expect(result).toEqual({
          success: false,
          error: 'Ungültige Eingabe. Bitte überprüfen Sie Ihre Angaben.',
          issues: expect.any(Array),
        });
      });
    });

    describe('addFairteilerOriginAction', () => {
      it('should successfully add origin to fairteiler', async () => {
        const mockFairteilerOriginResult = [
          {
            id: 'fairteiler-origin-1',
            createdAt: new Date(),
            fairteilerId: 'fairteiler-1',
            originId: 'test-id',
          },
        ];
        vi.mocked(dal.addFairteilerOrigin).mockResolvedValue(
          mockFairteilerOriginResult,
        );

        const result = await addFairteilerOriginAction(mockGenericItem);

        expect(dal.addFairteilerOrigin).toHaveBeenCalledWith(
          mockFairteiler.id,
          mockGenericItem,
        );
        expect(result).toEqual(mockGenericItem);
      });

      it('should throw Error when addition fails', async () => {
        (
          vi.mocked(dal.addFairteilerOrigin) as ReturnType<typeof vi.fn>
        ).mockResolvedValue(null);

        await expect(
          addFairteilerOriginAction(mockGenericItem),
        ).rejects.toThrow();
      });

      it('should handle and re-throw DAL errors', async () => {
        const dalError = new Error('Database error');
        vi.mocked(dal.addFairteilerOrigin).mockRejectedValue(dalError);

        await expect(
          addFairteilerOriginAction(mockGenericItem),
        ).rejects.toThrow(dalError);
      });
    });

    describe('removeFairteilerOriginAction', () => {
      it('should successfully remove origin from fairteiler', async () => {
        vi.mocked(dal.removeFairteilerOrigin).mockResolvedValue([
          {
            id: 'mock-id',
            createdAt: new Date(),
            fairteilerId: 'fairteiler-1',
            originId: 'origin-1',
          },
        ]);

        const result = await removeFairteilerOriginAction(mockGenericItem);

        expect(dal.removeFairteilerOrigin).toHaveBeenCalledWith(
          mockFairteiler.id,
          mockGenericItem,
        );
        expect(result).toEqual(mockGenericItem);
      });

      it('should throw NotFoundError when removal fails', async () => {
        (
          vi.mocked(dal.removeFairteilerOrigin) as ReturnType<typeof vi.fn>
        ).mockResolvedValue(null);

        await expect(
          removeFairteilerOriginAction(mockGenericItem),
        ).rejects.toThrow(NotFoundError);
      });
    });
  });

  describe('Category Management Actions', () => {
    describe('suggestNewCategoryAction', () => {
      it('should successfully suggest a new category', async () => {
        vi.mocked(dal.addCategory).mockResolvedValue(mockCategories);

        const result = await suggestNewCategoryAction(mockGenericItem);

        expect(dal.addCategory).toHaveBeenCalledWith(mockGenericItem);
        expect(result.success).toEqual(true);
      });

      it('should throw Error when category creation fails', async () => {
        (
          vi.mocked(dal.addCategory) as ReturnType<typeof vi.fn>
        ).mockResolvedValue(null);

        await expect(
          suggestNewCategoryAction(mockGenericItem),
        ).rejects.toThrow();
      });
    });

    describe('addFairteilerCategoryAction', () => {
      it('should successfully add category to fairteiler', async () => {
        vi.mocked(dal.addFairteilerCategory).mockResolvedValue([
          {
            id: 'mock-id',
            createdAt: new Date(),
            fairteilerId: 'fairteiler-1',
            categoryId: 'category-1',
          },
        ]);

        const result = await addFairteilerCategoryAction(mockGenericItem);

        expect(dal.addFairteilerCategory).toHaveBeenCalledWith(
          mockFairteiler.id,
          mockGenericItem,
        );
        expect(result).toEqual(mockGenericItem);
      });

      it('should throw Error when addition fails', async () => {
        (
          vi.mocked(dal.addFairteilerCategory) as ReturnType<typeof vi.fn>
        ).mockResolvedValue(null);

        await expect(
          addFairteilerCategoryAction(mockGenericItem),
        ).rejects.toThrow();
      });
    });

    describe('removeFairteilerCategoryAction', () => {
      it('should successfully remove category from fairteiler', async () => {
        vi.mocked(dal.removeFairteilerCategory).mockResolvedValue([
          {
            id: 'mock-id',
            createdAt: new Date(),
            fairteilerId: 'fairteiler-1',
            categoryId: 'category-1',
          },
        ]);

        const result = await removeFairteilerCategoryAction(mockGenericItem);

        expect(dal.removeFairteilerCategory).toHaveBeenCalledWith(
          mockFairteiler.id,
          mockGenericItem,
        );
        expect(result).toEqual(mockGenericItem);
      });

      it('should throw NotFoundError when removal fails', async () => {
        (
          vi.mocked(dal.removeFairteilerCategory) as ReturnType<typeof vi.fn>
        ).mockResolvedValue(null);

        await expect(
          removeFairteilerCategoryAction(mockGenericItem),
        ).rejects.toThrow(NotFoundError);
      });
    });
  });

  describe('Company Management Actions', () => {
    describe('suggestNewCompanyAction', () => {
      it('should successfully suggest a new company', async () => {
        vi.mocked(dal.addCompany).mockResolvedValue(mockCompanies);

        const result = await suggestNewCompanyAction(mockGenericItem);

        expect(dal.addCompany).toHaveBeenCalledWith(
          mockFairteiler.id,
          mockGenericItem,
        );
        expect(result.success).toEqual(true);
      });

      it('should throw Error when company creation fails', async () => {
        vi.mocked(dal.addCompany).mockResolvedValue(null);

        const result = await suggestNewCompanyAction(mockGenericItem);

        expect(result).toEqual({
          success: false,
          error: 'Failed to create new company',
        });
      });
    });

    describe('addFairteilerCompanyAction', () => {
      it('should successfully add company to fairteiler', async () => {
        vi.mocked(dal.addFairteilerCompany).mockResolvedValue([
          {
            id: 'mock-id',
            createdAt: new Date(),
            fairteilerId: 'fairteiler-1',
            companyId: 'company-1',
          },
        ]);

        const result = await addFairteilerCompanyAction(mockGenericItem);

        expect(dal.addFairteilerCompany).toHaveBeenCalledWith(
          mockFairteiler.id,
          mockGenericItem,
        );
        expect(result).toEqual(mockGenericItem);
      });

      it('should throw Error when addition fails', async () => {
        (
          vi.mocked(dal.addFairteilerCompany) as ReturnType<typeof vi.fn>
        ).mockResolvedValue(null);

        await expect(
          addFairteilerCompanyAction(mockGenericItem),
        ).rejects.toThrow();
      });
    });

    describe('removeFairteilerCompanyAction', () => {
      it('should successfully remove company from fairteiler', async () => {
        vi.mocked(dal.removeFairteilerCompany).mockResolvedValue([
          {
            id: 'mock-id',
            createdAt: new Date(),
            fairteilerId: 'fairteiler-1',
            companyId: 'company-1',
          },
        ]);

        const result = await removeFairteilerCompanyAction(mockGenericItem);

        expect(dal.removeFairteilerCompany).toHaveBeenCalledWith(
          mockFairteiler.id,
          mockGenericItem,
        );
        expect(result).toEqual(mockGenericItem);
      });

      it('should throw NotFoundError when removal fails', async () => {
        (
          vi.mocked(dal.removeFairteilerCompany) as ReturnType<typeof vi.fn>
        ).mockResolvedValue(null);

        await expect(
          removeFairteilerCompanyAction(mockGenericItem),
        ).rejects.toThrow(NotFoundError);
      });
    });
  });

  describe('Contribution Actions', () => {
    describe('submitContributionAction', () => {
      const mockContributionData = {
        contributions: [
          {
            id: 'contrib-1',
            foodId: '550e8400-e29b-41d4-a716-446655440000',
            quantity: 5,
            title: 'Test Food',
            originId: '550e8400-e29b-41d4-a716-446655440001',
            categoryId: '550e8400-e29b-41d4-a716-446655440002',
            companyId: '550e8400-e29b-41d4-a716-446655440003',
            company: 'Test Company',
            cool: false,
            shelfLife: new Date('2025-12-31'),
            allergens: null,
            comment: 'Test notes',
          },
        ],
        config: {
          fairteilerId: 'fairteiler-123',
        },
      };

      it('should successfully submit contribution', async () => {
        vi.mocked(dal.checkinContribution).mockResolvedValue([
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Test Food',
            categoryId: '550e8400-e29b-41d4-a716-446655440002',
            originId: '550e8400-e29b-41d4-a716-446655440001',
            companyId: '550e8400-e29b-41d4-a716-446655440003',
            company: 'Test Company',
            cool: false,
            allergens: null,
            comment: 'Test notes',
            createdAt: new Date(),
          },
        ]);

        const result = await submitContributionAction(mockContributionData);

        expect(dal.checkinContribution).toHaveBeenCalledWith(
          mockFairteiler.id,
          'user-123',
          mockContributionData.contributions,
        );
        expect(result).toEqual({
          success: true,
          message: 'Lebensmittel erfolgreich beigetragen!',
          data: { redirectTo: '/hub/user/contribution/success' },
        });
      });

      it('should return error when DAL fails during submission', async () => {
        const dalError = new Error('Checkin failed');
        vi.mocked(dal.checkinContribution).mockRejectedValue(dalError);

        const result = await submitContributionAction(mockContributionData);

        expect(result).toEqual({
          success: false,
          error: 'Checkin failed',
        });
      });
    });

    describe('editContributionAction', () => {
      const mockEditData = {
        checkinId: 'contrib-1',
        prevValue: '5',
        newValue: '10',
        field: 'quantity',
      };

      it('should successfully edit contribution', async () => {
        (
          vi.mocked(dal.addVersionHistoryRecord) as ReturnType<typeof vi.fn>
        ).mockResolvedValue(undefined);

        const result = await editContributionAction(mockEditData);

        expect(dal.addVersionHistoryRecord).toHaveBeenCalledWith(
          mockFairteiler.id,
          'user-123',
          mockEditData,
        );
        expect(result).toEqual({
          success: true,
          message: 'Beitrag erfolgreich bearbeitet.',
          data: mockEditData,
        });
      });

      it('should return error when DAL fails during edit', async () => {
        const dalError = new Error('Version history failed');
        vi.mocked(dal.addVersionHistoryRecord).mockRejectedValue(dalError);

        const result = await editContributionAction(mockEditData);

        expect(result).toEqual({
          success: false,
          error: 'Version history failed',
        });
      });
    });
  });

  describe('Error Handling Across All Actions', () => {
    describe('Database Connection Failures', () => {
      it('should handle database errors in origin actions', async () => {
        const dbError = new Error('Database connection lost');
        vi.mocked(dal.addOrigin).mockRejectedValue(dbError);

        const result = await suggestNewOriginAction(mockGenericItem);

        expect(result).toEqual({
          success: false,
          error: 'Database connection lost',
        });
      });

      it('should handle database errors in category actions', async () => {
        const dbError = new Error('Database timeout');
        vi.mocked(dal.addCategory).mockRejectedValue(dbError);

        const result = await suggestNewCategoryAction(mockGenericItem);

        expect(result).toEqual({
          success: false,
          error: 'Database timeout',
        });
      });

      it('should handle database errors in company actions', async () => {
        const dbError = new Error('Connection pool exhausted');
        vi.mocked(dal.addCompany).mockRejectedValue(dbError);

        const result = await suggestNewCompanyAction(mockGenericItem);

        expect(result).toEqual({
          success: false,
          error: 'Connection pool exhausted',
        });
      });
    });

    describe('Authentication Errors', () => {
      it('should handle authentication errors in export action', async () => {
        const authError = new AuthError('Session expired');
        vi.mocked(dal.loadAuthenticatedSession).mockRejectedValue(authError);

        const result = await exportContributionsAction({
          scope: 'fairteiler',
        });

        expect(result).toEqual({
          success: false,
          error: 'Session expired',
        });
      });
    });

    describe('Concurrent Operation Handling', () => {
      it('should handle concurrent modification in contribution edit', async () => {
        const concurrencyError = new Error(
          'Record was modified by another user',
        );
        vi.mocked(dal.addVersionHistoryRecord).mockRejectedValue(
          concurrencyError,
        );

        const result = await editContributionAction({
          checkinId: 'contrib-1',
          prevValue: '5',
          newValue: '10',
          field: 'quantity',
        });

        expect(result).toEqual({
          success: false,
          error: 'Record was modified by another user',
        });
      });
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    describe('Contribution Actions Edge Cases', () => {
      it('should handle empty contributions array', async () => {
        await expect(
          submitContributionAction({
            contributions: [],
            config: {
              fairteilerId: 'fairteiler-123',
            },
          }),
        ).rejects.toThrow(new ValidationError('Keine Einträge gefunden.'));
      });

      it('should handle large contributions array', async () => {
        const largeContributionsArray = Array.from({ length: 100 }, (_, i) => ({
          id: `contrib-${i}`,
          foodId: '550e8400-e29b-41d4-a716-446655440000',
          quantity: i + 1,
          title: `Test Food ${i}`,
          originId: '550e8400-e29b-41d4-a716-446655440001',
          categoryId: '550e8400-e29b-41d4-a716-446655440002',
          companyId: '550e8400-e29b-41d4-a716-446655440003',
          company: `Test Company ${i}`,
          cool: i % 2 === 0,
          shelfLife: new Date('2025-12-31'),
          allergens: null,
          comment: `Test notes ${i}`,
        }));

        const mockReturnArray = largeContributionsArray.map((contrib) => ({
          id: contrib.foodId,
          title: contrib.title,
          categoryId: contrib.categoryId,
          originId: contrib.originId,
          companyId: contrib.companyId,
          company: contrib.company,
          cool: contrib.cool,
          allergens: contrib.allergens,
          comment: contrib.comment,
          createdAt: new Date(),
        }));

        vi.mocked(dal.checkinContribution).mockResolvedValue(mockReturnArray);

        const result = await submitContributionAction({
          contributions: largeContributionsArray,
          config: {
            fairteilerId: 'fairteiler-123',
          },
        });

        expect(dal.checkinContribution).toHaveBeenCalledWith(
          mockFairteiler.id,
          'user-123',
          largeContributionsArray,
        );
        expect(result).toEqual({
          success: true,
          message: 'Lebensmittel erfolgreich beigetragen!',
          data: { redirectTo: '/hub/user/contribution/success' },
        });
      });

      it('should handle contribution with future shelf life', async () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 2);

        const contributionData = {
          contributions: [
            {
              id: 'contrib-future',
              foodId: '550e8400-e29b-41d4-a716-446655440000',
              quantity: 1,
              title: 'Long-lasting Food',
              originId: '550e8400-e29b-41d4-a716-446655440001',
              categoryId: '550e8400-e29b-41d4-a716-446655440002',
              companyId: '550e8400-e29b-41d4-a716-446655440003',
              company: 'Test Company',
              cool: true,
              shelfLife: futureDate,
              allergens: null,
              comment: 'Very long shelf life',
            },
          ],
          config: {
            fairteilerId: 'fairteiler-123',
          },
        };

        vi.mocked(dal.checkinContribution).mockResolvedValue([
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Long-lasting Food',
            categoryId: '550e8400-e29b-41d4-a716-446655440002',
            originId: '550e8400-e29b-41d4-a716-446655440001',
            companyId: '550e8400-e29b-41d4-a716-446655440003',
            company: 'Test Company',
            cool: true,
            allergens: null,
            comment: 'Very long shelf life',
            createdAt: new Date(),
          },
        ]);

        const result = await submitContributionAction(contributionData);

        expect(result).toEqual({
          success: true,
          message: 'Lebensmittel erfolgreich beigetragen!',
          data: { redirectTo: '/hub/user/contribution/success' },
        });
      });
    });

    describe('Export Actions Edge Cases', () => {
      it('should handle export with very large date range', async () => {
        const mockContributions = [
          {
            checkinId: 'contrib-1',
            contributionDate: new Date(),
            quantity: 5,
            shelfLife: new Date('2024-12-31'),
            categoryName: 'Test Category',
            categoryImage: null,
            originName: 'Test Origin',
            companyName: 'Test Company',
            foodTitle: 'Test Food',
            foodCompany: null,
            foodCool: false,
            foodAllergens: null,
            foodComment: null,
            contributorId: 'user-1',
            contributorName: 'Test User',
            contributorImage: null,
            contributorEmail: 'test@example.com',
            contributorIsAnonymous: false,
            fairteilerId: 'fairteiler-1',
            fairteilerName: 'Test Fairteiler',
          },
        ];

        vi.mocked(dal.loadAuthenticatedSession).mockResolvedValue(mockSession);
        vi.mocked(dal.loadContributions).mockResolvedValue({
          data: mockContributions,
          total: 1,
        });

        const exportData = {
          scope: 'fairteiler' as const,
          dateRange: {
            from: new Date('1900-01-01'),
            to: new Date('2100-12-31'),
          },
        };

        const result = await exportContributionsAction(exportData);

        expect(result).toEqual({
          success: true,
          message: 'Fairteiler-Daten erfolgreich exportiert.',
          data: mockContributions,
        });
      });

      it('should handle export timeout gracefully', async () => {
        const timeoutError = new Error('Query timeout');
        vi.mocked(dal.loadAuthenticatedSession).mockResolvedValue(mockSession);
        vi.mocked(dal.loadContributions).mockRejectedValue(timeoutError);

        const result = await exportContributionsAction({
          scope: 'fairteiler',
        });

        expect(result).toEqual({
          success: false,
          error: 'Query timeout',
        });
      });
    });
  });

  describe('Integration Scenarios', () => {
    describe('Multi-step Operations', () => {
      it('should handle sequential origin operations', async () => {
        // First suggest a new origin
        vi.mocked(dal.addOrigin).mockResolvedValue([
          {
            id: 'new-origin',
            name: 'New Origin',
            createdAt: new Date(),
            image: null,
            description: null,
            status: 'active',
          },
        ]);

        const suggestResult = await suggestNewOriginAction({
          id: 'new-origin',
          name: 'New Origin',
          status: 'active',
        });

        expect(suggestResult.success).toBe(true);

        // Then add it to fairteiler
        vi.mocked(dal.addFairteilerOrigin).mockResolvedValue([
          {
            id: 'fairteiler-origin-1',
            createdAt: new Date(),
            fairteilerId: 'fairteiler-1',
            originId: 'new-origin',
          },
        ]);

        const addResult = await addFairteilerOriginAction({
          id: 'new-origin',
          name: 'New Origin',
          status: 'active',
        });

        expect(addResult).toEqual({
          id: 'new-origin',
          name: 'New Origin',
          status: 'active',
        });

        // Finally remove it
        vi.mocked(dal.removeFairteilerOrigin).mockResolvedValue([
          {
            id: 'fairteiler-origin-1',
            createdAt: new Date(),
            fairteilerId: 'fairteiler-1',
            originId: 'new-origin',
          },
        ]);

        const removeResult = await removeFairteilerOriginAction({
          id: 'new-origin',
          name: 'New Origin',
          status: 'active',
        });

        expect(removeResult).toEqual({
          id: 'new-origin',
          name: 'New Origin',
          status: 'active',
        });
      });
    });

    describe('Cross-functional Operations', () => {
      it('should handle contribution submission followed by edit', async () => {
        // Submit contribution
        vi.mocked(dal.checkinContribution).mockResolvedValue([
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Test Food',
            categoryId: '550e8400-e29b-41d4-a716-446655440002',
            originId: '550e8400-e29b-41d4-a716-446655440001',
            companyId: '550e8400-e29b-41d4-a716-446655440003',
            company: 'Test Company',
            cool: false,
            allergens: null,
            comment: 'Test notes',
            createdAt: new Date(),
          },
        ]);

        const submitResult = await submitContributionAction({
          contributions: [
            {
              id: 'contrib-1',
              foodId: '550e8400-e29b-41d4-a716-446655440000',
              quantity: 5,
              title: 'Test Food',
              originId: '550e8400-e29b-41d4-a716-446655440001',
              categoryId: '550e8400-e29b-41d4-a716-446655440002',
              companyId: '550e8400-e29b-41d4-a716-446655440003',
              company: 'Test Company',
              cool: false,
              shelfLife: new Date('2025-12-31'),
              allergens: null,
              comment: 'Test notes',
            },
          ],
          config: {
            fairteilerId: 'fairteiler-123',
          },
        });

        expect(submitResult.success).toBe(true);

        // Edit the contribution
        vi.mocked(dal.addVersionHistoryRecord).mockResolvedValue(undefined);

        const editResult = await editContributionAction({
          checkinId: 'contrib-1',
          prevValue: '5',
          newValue: '10',
          field: 'quantity',
        });

        expect(editResult.success).toBe(true);
        if (editResult.success) {
          expect(editResult.data).toEqual({
            checkinId: 'contrib-1',
            prevValue: '5',
            newValue: '10',
            field: 'quantity',
          });
        }
      });
    });
  });
});
