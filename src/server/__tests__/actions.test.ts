import { describe, it, expect, vi, beforeEach } from 'vitest';
import { headers } from 'next/headers';
import {
  submitContributionAction,
  editContributionAction,
  exportContributionsAction,
} from '../contribution/actions';
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
} from '../fairteiler/actions';
import {
  addFairteilerTutorialStepAction,
  removeFairteilerTutorialAction,
  updateFairteilerTutorialAction,
  updateFairteilerTutorialStepAction,
} from '../tutorial/actions';
import * as dal from '../contribution/dal';
import * as fairteilerDal from '../fairteiler/dal';
import * as tutorialDal from '../tutorial/dal';
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
import { loadAuthenticatedSession } from '../user/dal';

// Mockk all auth functions
vi.mock('@lib/auth/auth', () => ({
  auth: { api: {} },
  checkPermissionOnServer: vi.fn(),
}));

// Mock all DAL functions
vi.mock('../contribution/dal', () => ({
  checkinContribution: vi.fn(),
  addVersionHistoryRecord: vi.fn(),
  loadContributions: vi.fn(),
  checkInvitationAndUser: vi.fn(),
  PUBLIC_TOTAL_QUANTITY_TAG: 'public-total-quantity',
}));

vi.mock('../fairteiler/dal', () => ({
  addOrigin: vi.fn(),
  addFairteilerOrigin: vi.fn(),
  removeFairteilerOrigin: vi.fn(),
  addCategory: vi.fn(),
  addFairteilerCategory: vi.fn(),
  removeFairteilerCategory: vi.fn(),
  addCompany: vi.fn(),
  addFairteilerCompany: vi.fn(),
  removeFairteilerCompany: vi.fn(),
  loadFairteilerMembership: vi.fn(),
}));

vi.mock('../tutorial/dal', () => ({
  addFairteilerTutorial: vi.fn(),
  addFairteilerTutorialStep: vi.fn(),
  removeFairteilerTutorial: vi.fn(),
  removeFairteilerTutorialStep: vi.fn(),
  tutorialBelongsToFairteiler: vi.fn(),
  updateFairteilerTutorial: vi.fn(),
  updateFairteilerTutorialStep: vi.fn(),
}));

vi.mock('../user/dal', () => ({
  loadAuthenticatedSession: vi.fn(),
}));

// Mock Next.js headers
vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

const futureDate = new Date();
futureDate.setFullYear(futureDate.getFullYear() + 1);

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
        vi.mocked(fairteilerDal.addOrigin).mockResolvedValue(mockOrigins);

        const result = await suggestNewOriginAction(mockGenericItem);

        expect(fairteilerDal.addOrigin).toHaveBeenCalledWith(mockGenericItem);
        expect(result?.data).toEqual(mockGenericItem);
      });

      it('should surface error when origin creation fails', async () => {
        (
          vi.mocked(fairteilerDal.addOrigin) as ReturnType<typeof vi.fn>
        ).mockResolvedValue(null);

        const result = await suggestNewOriginAction(mockGenericItem);
        expect(result?.serverError).toBe(
          "Origin with identifier 'after creation' not found",
        );
      });

      it('should surface validation errors on invalid input', async () => {
        const invalidInput = {
          id: '',
          name: '',
          status: 'invalid',
        } as unknown as GenericItem;

        const result = await suggestNewOriginAction(invalidInput);
        expect(result?.validationErrors).toBeDefined();
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
        vi.mocked(fairteilerDal.addFairteilerOrigin).mockResolvedValue(
          mockFairteilerOriginResult,
        );

        const result = await addFairteilerOriginAction(mockGenericItem);

        expect(fairteilerDal.addFairteilerOrigin).toHaveBeenCalledWith(
          mockFairteiler.id,
          mockGenericItem,
        );
        expect(result?.data).toEqual(mockGenericItem);
      });

      it('should surface serverError when addition fails', async () => {
        (
          vi.mocked(fairteilerDal.addFairteilerOrigin) as ReturnType<
            typeof vi.fn
          >
        ).mockResolvedValue(null);

        const result = await addFairteilerOriginAction(mockGenericItem);
        expect(result?.serverError).toBe('Failed to add origin to fairteiler');
      });

      it('should surface DAL errors as serverError', async () => {
        const dalError = new Error('Database error');
        vi.mocked(fairteilerDal.addFairteilerOrigin).mockRejectedValue(
          dalError,
        );

        const result = await addFairteilerOriginAction(mockGenericItem);
        expect(result?.serverError).toBe('Database error');
      });
    });

    describe('removeFairteilerOriginAction', () => {
      it('should successfully remove origin from fairteiler', async () => {
        vi.mocked(fairteilerDal.removeFairteilerOrigin).mockResolvedValue([
          {
            id: 'mock-id',
            createdAt: new Date(),
            fairteilerId: 'fairteiler-1',
            originId: 'origin-1',
          },
        ]);

        const result = await removeFairteilerOriginAction(mockGenericItem);

        expect(fairteilerDal.removeFairteilerOrigin).toHaveBeenCalledWith(
          mockFairteiler.id,
          mockGenericItem,
        );
        expect(result?.data).toEqual(mockGenericItem);
      });

      it('should surface NotFoundError as serverError when removal fails', async () => {
        (
          vi.mocked(fairteilerDal.removeFairteilerOrigin) as ReturnType<
            typeof vi.fn
          >
        ).mockResolvedValue(null);

        const result = await removeFairteilerOriginAction(mockGenericItem);
        expect(result?.serverError).toBe('Origin to remove not found');
      });
    });
  });

  describe('Category Management Actions', () => {
    describe('suggestNewCategoryAction', () => {
      it('should successfully suggest a new category', async () => {
        vi.mocked(fairteilerDal.addCategory).mockResolvedValue(mockCategories);

        const result = await suggestNewCategoryAction(mockGenericItem);

        expect(fairteilerDal.addCategory).toHaveBeenCalledWith(mockGenericItem);
        expect(result?.data).toEqual(mockGenericItem);
      });

      it('should surface serverError when category creation fails', async () => {
        (
          vi.mocked(fairteilerDal.addCategory) as ReturnType<typeof vi.fn>
        ).mockResolvedValue(null);

        const result = await suggestNewCategoryAction(mockGenericItem);
        expect(result?.serverError).toBe(
          "Category with identifier 'after creation' not found",
        );
      });
    });

    describe('addFairteilerCategoryAction', () => {
      it('should successfully add category to fairteiler', async () => {
        vi.mocked(fairteilerDal.addFairteilerCategory).mockResolvedValue([
          {
            id: 'mock-id',
            createdAt: new Date(),
            fairteilerId: 'fairteiler-1',
            categoryId: 'category-1',
          },
        ]);

        const result = await addFairteilerCategoryAction(mockGenericItem);

        expect(fairteilerDal.addFairteilerCategory).toHaveBeenCalledWith(
          mockFairteiler.id,
          mockGenericItem,
        );
        expect(result?.data).toEqual(mockGenericItem);
      });

      it('should surface serverError when addition fails', async () => {
        (
          vi.mocked(fairteilerDal.addFairteilerCategory) as ReturnType<
            typeof vi.fn
          >
        ).mockResolvedValue(null);

        const result = await addFairteilerCategoryAction(mockGenericItem);
        expect(result?.serverError).toBe(
          'Failed to add category to fairteiler',
        );
      });
    });

    describe('removeFairteilerCategoryAction', () => {
      it('should successfully remove category from fairteiler', async () => {
        vi.mocked(fairteilerDal.removeFairteilerCategory).mockResolvedValue([
          {
            id: 'mock-id',
            createdAt: new Date(),
            fairteilerId: 'fairteiler-1',
            categoryId: 'category-1',
          },
        ]);

        const result = await removeFairteilerCategoryAction(mockGenericItem);

        expect(fairteilerDal.removeFairteilerCategory).toHaveBeenCalledWith(
          mockFairteiler.id,
          mockGenericItem,
        );
        expect(result?.data).toEqual(mockGenericItem);
      });

      it('should surface NotFoundError as serverError when removal fails', async () => {
        (
          vi.mocked(fairteilerDal.removeFairteilerCategory) as ReturnType<
            typeof vi.fn
          >
        ).mockResolvedValue(null);

        const result = await removeFairteilerCategoryAction(mockGenericItem);
        expect(result?.serverError).toBe('Category to remove not found');
      });
    });
  });

  describe('Company Management Actions', () => {
    describe('suggestNewCompanyAction', () => {
      it('should successfully suggest a new company', async () => {
        vi.mocked(fairteilerDal.addCompany).mockResolvedValue(mockCompanies);

        const result = await suggestNewCompanyAction(mockGenericItem);

        expect(fairteilerDal.addCompany).toHaveBeenCalledWith(
          mockFairteiler.id,
          mockGenericItem,
        );
        expect(result?.data).toEqual(mockGenericItem);
      });

      it('should surface serverError when company creation fails', async () => {
        vi.mocked(fairteilerDal.addCompany).mockResolvedValue(null);

        const result = await suggestNewCompanyAction(mockGenericItem);
        expect(result?.serverError).toBe('Failed to create new company');
      });
    });

    describe('addFairteilerCompanyAction', () => {
      it('should successfully add company to fairteiler', async () => {
        vi.mocked(fairteilerDal.addFairteilerCompany).mockResolvedValue([
          {
            id: 'mock-id',
            createdAt: new Date(),
            fairteilerId: 'fairteiler-1',
            companyId: 'company-1',
          },
        ]);

        const result = await addFairteilerCompanyAction(mockGenericItem);

        expect(fairteilerDal.addFairteilerCompany).toHaveBeenCalledWith(
          mockFairteiler.id,
          mockGenericItem,
        );
        expect(result?.data).toEqual(mockGenericItem);
      });

      it('should surface serverError when addition fails', async () => {
        (
          vi.mocked(fairteilerDal.addFairteilerCompany) as ReturnType<
            typeof vi.fn
          >
        ).mockResolvedValue(null);

        const result = await addFairteilerCompanyAction(mockGenericItem);
        expect(result?.serverError).toBe('Failed to add company to fairteiler');
      });
    });

    describe('removeFairteilerCompanyAction', () => {
      it('should successfully remove company from fairteiler', async () => {
        vi.mocked(fairteilerDal.removeFairteilerCompany).mockResolvedValue([
          {
            id: 'mock-id',
            createdAt: new Date(),
            fairteilerId: 'fairteiler-1',
            companyId: 'company-1',
          },
        ]);

        const result = await removeFairteilerCompanyAction(mockGenericItem);

        expect(fairteilerDal.removeFairteilerCompany).toHaveBeenCalledWith(
          mockFairteiler.id,
          mockGenericItem,
        );
        expect(result?.data).toEqual(mockGenericItem);
      });

      it('should surface NotFoundError as serverError when removal fails', async () => {
        (
          vi.mocked(fairteilerDal.removeFairteilerCompany) as ReturnType<
            typeof vi.fn
          >
        ).mockResolvedValue(null);

        const result = await removeFairteilerCompanyAction(mockGenericItem);
        expect(result?.serverError).toBe('Company to remove not found');
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
        expect(result?.data).toEqual({
          redirectTo: '/hub/user/contribution/success',
        });
      });

      it('should surface serverError when DAL fails during submission', async () => {
        const dalError = new Error('Checkin failed');
        vi.mocked(dal.checkinContribution).mockRejectedValue(dalError);

        const result = await submitContributionAction(mockContributionData);
        expect(result?.serverError).toBe('Checkin failed');
      });

      const submitAsData = {
        ...mockContributionData,
        config: {
          fairteilerId: 'fairteiler-123',
          submitAsAccessViewId: 'access-view-user-9',
        },
      };

      it('should submit as an access view that belongs to the target fairteiler', async () => {
        vi.stubEnv('NEXT_PUBLIC_ENV_URL', 'http://localhost:3001');
        vi.mocked(fairteilerDal.loadFairteilerMembership).mockResolvedValue({
          id: 'member-9',
          organizationId: 'fairteiler-123',
          userId: 'access-view-user-9',
          role: 'employee',
          createdAt: new Date(),
        });
        vi.mocked(dal.checkinContribution).mockResolvedValue([]);

        const result = await submitContributionAction(submitAsData);

        expect(checkPermissionOnServer).toHaveBeenCalledWith(
          mockHeaders,
          { member: ['create'] },
          'fairteiler-123',
        );
        expect(dal.checkinContribution).toHaveBeenCalledWith(
          'fairteiler-123',
          'access-view-user-9',
          submitAsData.contributions,
        );
        expect(result?.data?.redirectTo).toContain(
          'submitAsUserId=access-view-user-9',
        );

        vi.unstubAllEnvs();
      });

      it('should reject submitting as an access view from another fairteiler', async () => {
        vi.mocked(fairteilerDal.loadFairteilerMembership).mockResolvedValue(
          undefined,
        );

        const result = await submitContributionAction(submitAsData);

        expect(result?.serverError).toBe(
          'Permission denied: Das ausgewählte Zugangsprofil gehört nicht zu diesem Fairteiler.',
        );
        expect(dal.checkinContribution).not.toHaveBeenCalled();
      });

      it('should reject submitting as a disabled access view', async () => {
        vi.mocked(fairteilerDal.loadFairteilerMembership).mockResolvedValue({
          id: 'member-9',
          organizationId: 'fairteiler-123',
          userId: 'access-view-user-9',
          role: 'disabled',
          createdAt: new Date(),
        });

        const result = await submitContributionAction(submitAsData);

        expect(result?.serverError).toBe(
          'Permission denied: Das ausgewählte Zugangsprofil gehört nicht zu diesem Fairteiler.',
        );
        expect(dal.checkinContribution).not.toHaveBeenCalled();
      });

      it('should reject submitAs when the caller lacks member:create on the target fairteiler', async () => {
        vi.mocked(checkPermissionOnServer).mockResolvedValue({
          success: false,
          error: null,
        });

        const result = await submitContributionAction(submitAsData);

        expect(result?.serverError).toBe(
          'Permission denied: Nur Inhaber:innen dürfen Beiträge im Namen von Zugangsprofile einreichen.',
        );
        expect(fairteilerDal.loadFairteilerMembership).not.toHaveBeenCalled();
        expect(dal.checkinContribution).not.toHaveBeenCalled();
      });
    });

    describe('editContributionAction', () => {
      const mockEditData = {
        checkinId: 'contrib-1',
        prevValue: '5',
        newValue: '10',
        field: 'quantity' as const,
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
        expect(result?.data).toEqual(mockEditData);
      });

      it('should surface serverError when DAL fails during edit', async () => {
        const dalError = new Error('Version history failed');
        vi.mocked(dal.addVersionHistoryRecord).mockRejectedValue(dalError);

        const result = await editContributionAction(mockEditData);
        expect(result?.serverError).toBe('Version history failed');
      });
    });
  });

  describe('Tutorial Actions (cross-tenant scoping)', () => {
    it('rejects adding a step to a tutorial from another fairteiler', async () => {
      vi.mocked(tutorialDal.tutorialBelongsToFairteiler).mockResolvedValue(
        false,
      );

      const result = await addFairteilerTutorialStepAction({
        title: 'Step',
        content: 'Content',
        sortIndex: 0,
        media: null,
        tutorialId: 'tutorial-from-other-org',
      });

      expect(result?.serverError).toBe(
        'Permission denied: cannot create tutorial step',
      );
      expect(tutorialDal.addFairteilerTutorialStep).not.toHaveBeenCalled();
    });

    it('rejects updating a step under a tutorial from another fairteiler', async () => {
      vi.mocked(tutorialDal.tutorialBelongsToFairteiler).mockResolvedValue(
        false,
      );

      const result = await updateFairteilerTutorialStepAction({
        id: 'step-1',
        title: 'Step',
        content: 'Content',
        sortIndex: 0,
        media: null,
        tutorialId: 'tutorial-from-other-org',
      });

      expect(result?.serverError).toBe(
        'Permission denied: cannot update tutorial step',
      );
      expect(tutorialDal.updateFairteilerTutorialStep).not.toHaveBeenCalled();
    });

    it('rejects updating a tutorial that does not belong to the active fairteiler', async () => {
      vi.mocked(tutorialDal.updateFairteilerTutorial).mockResolvedValue([]);

      const result = await updateFairteilerTutorialAction({
        id: 'tutorial-from-other-org',
        title: 'Hacked',
        isActive: true,
      });

      expect(tutorialDal.updateFairteilerTutorial).toHaveBeenCalledWith(
        'tutorial-from-other-org',
        'fairteiler-123',
        expect.objectContaining({ fairteilerId: 'fairteiler-123' }),
      );
      expect(result?.serverError).toBe('Failed to update tutorial');
    });

    it('rejects removing a tutorial that does not belong to the active fairteiler', async () => {
      vi.mocked(tutorialDal.removeFairteilerTutorial).mockResolvedValue([]);

      const result = await removeFairteilerTutorialAction({
        id: 'tutorial-from-other-org',
      });

      expect(tutorialDal.removeFairteilerTutorial).toHaveBeenCalledWith(
        'tutorial-from-other-org',
        'fairteiler-123',
      );
      expect(result?.serverError).toBe('Failed to delete tutorial');
    });

    it('removes a tutorial that belongs to the active fairteiler', async () => {
      const removed = [
        {
          id: 'tutorial-1',
          fairteilerId: 'fairteiler-123',
          title: 'Tutorial',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      vi.mocked(tutorialDal.removeFairteilerTutorial).mockResolvedValue(
        removed,
      );

      const result = await removeFairteilerTutorialAction({ id: 'tutorial-1' });

      expect(tutorialDal.removeFairteilerTutorial).toHaveBeenCalledWith(
        'tutorial-1',
        'fairteiler-123',
      );
      expect(result?.data).toEqual(removed);
    });
  });

  describe('Error Handling Across All Actions', () => {
    describe('Database Connection Failures', () => {
      it('should surface database errors in origin actions as serverError', async () => {
        const dbError = new Error('Database connection lost');
        vi.mocked(fairteilerDal.addOrigin).mockRejectedValue(dbError);

        const result = await suggestNewOriginAction(mockGenericItem);
        expect(result?.serverError).toBe('Database connection lost');
      });

      it('should surface database errors in category actions as serverError', async () => {
        const dbError = new Error('Database timeout');
        vi.mocked(fairteilerDal.addCategory).mockRejectedValue(dbError);

        const result = await suggestNewCategoryAction(mockGenericItem);
        expect(result?.serverError).toBe('Database timeout');
      });

      it('should surface database errors in company actions as serverError', async () => {
        const dbError = new Error('Connection pool exhausted');
        vi.mocked(fairteilerDal.addCompany).mockRejectedValue(dbError);

        const result = await suggestNewCompanyAction(mockGenericItem);
        expect(result?.serverError).toBe('Connection pool exhausted');
      });
    });

    describe('Authentication Errors', () => {
      it('should surface auth errors in export action as serverError', async () => {
        const authError = new AuthError('Session expired');
        vi.mocked(loadAuthenticatedSession).mockRejectedValue(authError);

        const result = await exportContributionsAction({ scope: 'fairteiler' });
        expect(result?.serverError).toBe('Session expired');
      });
    });

    describe('Concurrent Operation Handling', () => {
      it('should surface concurrent modification in contribution edit as serverError', async () => {
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
        expect(result?.serverError).toBe('Record was modified by another user');
      });
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    describe('Contribution Actions Edge Cases', () => {
      it('should surface validation error for empty contributions array', async () => {
        const result = await submitContributionAction({
          contributions: [],
          config: {
            fairteilerId: 'fairteiler-123',
          },
        });
        expect(result?.serverError).toBe('Keine Einträge gefunden.');
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
          cool: false,
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
        expect(result?.data).toEqual({
          redirectTo: '/hub/user/contribution/success',
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

        expect(result?.data).toEqual({
          redirectTo: '/hub/user/contribution/success',
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
            shelfLife: null,
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

        vi.mocked(loadAuthenticatedSession).mockResolvedValue(mockSession);
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

        expect(result?.data).toEqual(mockContributions);
      });

      it('should surface export timeout as serverError', async () => {
        const timeoutError = new Error('Query timeout');
        vi.mocked(loadAuthenticatedSession).mockResolvedValue(mockSession);
        vi.mocked(dal.loadContributions).mockRejectedValue(timeoutError);

        const result = await exportContributionsAction({ scope: 'fairteiler' });
        expect(result?.serverError).toBe('Query timeout');
      });
    });
  });

  describe('Integration Scenarios', () => {
    describe('Multi-step Operations', () => {
      it('should handle sequential origin operations', async () => {
        // First suggest a new origin
        vi.mocked(fairteilerDal.addOrigin).mockResolvedValue([
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

        expect(suggestResult?.data).toEqual({
          id: 'new-origin',
          name: 'New Origin',
          status: 'active',
        });

        // Then add it to fairteiler
        vi.mocked(fairteilerDal.addFairteilerOrigin).mockResolvedValue([
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

        expect(addResult?.data).toEqual({
          id: 'new-origin',
          name: 'New Origin',
          status: 'active',
        });

        // Finally remove it
        vi.mocked(fairteilerDal.removeFairteilerOrigin).mockResolvedValue([
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

        expect(removeResult?.data).toEqual({
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
              allergens: null,
              comment: 'Test notes',
            },
          ],
          config: {
            fairteilerId: 'fairteiler-123',
          },
        });

        expect(submitResult?.data).toEqual({
          redirectTo: '/hub/user/contribution/success',
        });

        // Edit the contribution
        vi.mocked(dal.addVersionHistoryRecord).mockResolvedValue(undefined);

        const editResult = await editContributionAction({
          checkinId: 'contrib-1',
          prevValue: '5',
          newValue: '10',
          field: 'quantity',
        });

        expect(editResult?.data).toEqual({
          checkinId: 'contrib-1',
          prevValue: '5',
          newValue: '10',
          field: 'quantity',
        });
      });
    });
  });
});
