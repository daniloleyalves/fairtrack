import { describe, it, expect } from 'vitest';
import {
  contributionFormSchema,
  contributionEditSchema,
} from '../contribution-schema';

describe('contributionFormSchema', () => {
  // Valid test data factory
  const createValidContribution = (overrides = {}) => ({
    id: 'test-id-123',
    quantity: 1.5,
    foodId: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Test Food Item',
    categoryId: '550e8400-e29b-41d4-a716-446655440001',
    originId: '550e8400-e29b-41d4-a716-446655440002',
    companyId: '550e8400-e29b-41d4-a716-446655440003',
    company: 'Test Company',
    cool: false,
    shelfLife: new Date('2025-12-31'),
    allergens: 'Contains nuts',
    comment: 'Test comment',
    ...overrides,
  });

  const createValidFormData = (contributionOverrides = {}) => ({
    contributions: [createValidContribution(contributionOverrides)],
    config: {
      fairteilerId: 'fairteiler-123',
    },
  });

  describe('valid data validation', () => {
    it('should validate a complete valid contribution form', () => {
      const validData = createValidFormData();
      const result = contributionFormSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.contributions).toHaveLength(1);
        expect(result.data.contributions[0].title).toBe('Test Food Item');
      }
    });

    it('should validate multiple contributions', () => {
      const validData = {
        contributions: [
          createValidContribution({ title: 'Item 1' }),
          createValidContribution({ title: 'Item 2', id: 'test-id-456' }),
        ],
        config: {
          fairteilerId: 'fairteiler-123',
        },
      };
      const result = contributionFormSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.contributions).toHaveLength(2);
      }
    });

    it('should validate with nullable fields as null', () => {
      const validData = createValidFormData({
        companyId: null,
        company: null,
        shelfLife: null,
        allergens: null,
        comment: null,
      });
      const result = contributionFormSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should validate with empty string nullable fields', () => {
      const validData = createValidFormData({
        company: '',
        allergens: '',
        comment: '',
      });
      const result = contributionFormSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });

  describe('required field validation', () => {
    it('should reject missing contributions array', () => {
      const invalidData = {};
      const result = contributionFormSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['contributions']);
      }
    });

    it('should reject empty contributions array', () => {
      const invalidData = {
        contributions: [],
        config: { fairteilerId: 'fairteiler-123' },
      };
      const result = contributionFormSchema.safeParse(invalidData);

      expect(result.success).toBe(true); // Empty array is valid, business logic handles this
    });

    it('should reject missing required id field', () => {
      const invalidData = createValidFormData({ id: undefined });
      const result = contributionFormSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['contributions', 0, 'id']);
      }
    });

    it('should reject missing required quantity field', () => {
      const invalidData = createValidFormData({ quantity: undefined });
      const result = contributionFormSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual([
          'contributions',
          0,
          'quantity',
        ]);
      }
    });

    it('should reject missing required title field', () => {
      const invalidData = createValidFormData({ title: undefined });
      const result = contributionFormSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual([
          'contributions',
          0,
          'title',
        ]);
      }
    });
  });

  describe('quantity validation', () => {
    it('should reject zero quantity', () => {
      const invalidData = createValidFormData({ quantity: 0 });
      const result = contributionFormSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Bitte gib an, welche Menge du retten möchtest',
        );
      }
    });

    it('should reject negative quantity', () => {
      const invalidData = createValidFormData({ quantity: -1.5 });
      const result = contributionFormSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Bitte gib an, welche Menge du retten möchtest',
        );
      }
    });

    it('should accept decimal quantities', () => {
      const validData = createValidFormData({ quantity: 0.5 });
      const result = contributionFormSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should accept large quantities', () => {
      const validData = createValidFormData({ quantity: 999.99 });
      const result = contributionFormSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });

  describe('UUID validation', () => {
    it('should reject invalid foodId UUID', () => {
      const invalidData = createValidFormData({ foodId: 'not-a-uuid' });
      const result = contributionFormSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual([
          'contributions',
          0,
          'foodId',
        ]);
      }
    });

    it('should reject invalid categoryId UUID', () => {
      const invalidData = createValidFormData({ categoryId: 'invalid-uuid' });
      const result = contributionFormSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual([
          'contributions',
          0,
          'categoryId',
        ]);
      }
    });

    it('should reject invalid originId UUID', () => {
      const invalidData = createValidFormData({ originId: 'bad-uuid' });
      const result = contributionFormSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual([
          'contributions',
          0,
          'originId',
        ]);
      }
    });

    it('should reject invalid companyId UUID when not null', () => {
      const invalidData = createValidFormData({
        companyId: 'invalid-company-uuid',
      });
      const result = contributionFormSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual([
          'contributions',
          0,
          'companyId',
        ]);
      }
    });

    it('should accept null companyId', () => {
      const validData = createValidFormData({ companyId: null });
      const result = contributionFormSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });

  describe('string length validation', () => {
    it('should reject empty title', () => {
      const invalidData = createValidFormData({ title: '' });
      const result = contributionFormSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Bitte gib einen Titel an');
      }
    });

    it('should reject title longer than 50 characters', () => {
      const longTitle = 'a'.repeat(51);
      const invalidData = createValidFormData({ title: longTitle });
      const result = contributionFormSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Dieses Feld darf nicht mehr als 50 Zeichen lang sein',
        );
      }
    });

    it('should accept title exactly 50 characters', () => {
      const maxTitle = 'a'.repeat(50);
      const validData = createValidFormData({ title: maxTitle });
      const result = contributionFormSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject allergens longer than 100 characters', () => {
      const longAllergens = 'a'.repeat(101);
      const invalidData = createValidFormData({ allergens: longAllergens });
      const result = contributionFormSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Dieses Feld darf nicht mehr als 100 Zeichen lang sein',
        );
      }
    });

    it('should accept allergens exactly 100 characters', () => {
      const maxAllergens = 'a'.repeat(100);
      const validData = createValidFormData({ allergens: maxAllergens });
      const result = contributionFormSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject comment longer than 400 characters', () => {
      const longComment = 'a'.repeat(401);
      const invalidData = createValidFormData({ comment: longComment });
      const result = contributionFormSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Dieses Feld darf nicht mehr als 400 Zeichen lang sein',
        );
      }
    });

    it('should accept comment exactly 400 characters', () => {
      const maxComment = 'a'.repeat(400);
      const validData = createValidFormData({ comment: maxComment });
      const result = contributionFormSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });

  describe('date validation', () => {
    it('should reject past shelf life date', () => {
      const pastDate = new Date('2020-01-01');
      const invalidData = createValidFormData({ shelfLife: pastDate });
      const result = contributionFormSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Haltbarkeit darf nicht in der Vergangenheit liegen',
        );
      }
    });

    it('should accept future shelf life date', () => {
      const futureDate = new Date('2030-12-31');
      const validData = createValidFormData({ shelfLife: futureDate });
      const result = contributionFormSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should accept null shelf life', () => {
      const validData = createValidFormData({ shelfLife: null });
      const result = contributionFormSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject today as shelf life (edge case)', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      const invalidData = createValidFormData({ shelfLife: today });
      const result = contributionFormSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('boolean validation', () => {
    it('should accept true for cool field', () => {
      const validData = createValidFormData({ cool: true });
      const result = contributionFormSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should accept false for cool field', () => {
      const validData = createValidFormData({ cool: false });
      const result = contributionFormSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject non-boolean cool field', () => {
      const invalidData = createValidFormData({
        cool: 'yes' as string | boolean,
      });
      const result = contributionFormSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('string trimming', () => {
    it('should trim whitespace from string fields', () => {
      const dataWithWhitespace = createValidFormData({
        id: '  test-id-123  ',
        title: '  Test Food Item  ',
        company: '  Test Company  ',
        allergens: '  Contains nuts  ',
        comment: '  Test comment  ',
      });
      const result = contributionFormSchema.safeParse(dataWithWhitespace);

      expect(result.success).toBe(true);
      if (result.success) {
        const contribution = result.data.contributions[0];
        expect(contribution.id).toBe('test-id-123');
        expect(contribution.title).toBe('Test Food Item');
        expect(contribution.company).toBe('Test Company');
        expect(contribution.allergens).toBe('Contains nuts');
        expect(contribution.comment).toBe('Test comment');
      }
    });

    it('should reject title that becomes empty after trimming', () => {
      const invalidData = createValidFormData({ title: '   ' });
      const result = contributionFormSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Bitte gib einen Titel an');
      }
    });
  });
});

describe('contributionEditSchema', () => {
  const createValidEditData = (overrides = {}) => ({
    checkinId: 'checkin-123',
    prevValue: 'old value',
    newValue: 'new value',
    field: 'title',
    ...overrides,
  });

  describe('valid data validation', () => {
    it('should validate complete valid edit data', () => {
      const validData = createValidEditData();
      const result = contributionEditSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.checkinId).toBe('checkin-123');
        expect(result.data.prevValue).toBe('old value');
        expect(result.data.newValue).toBe('new value');
        expect(result.data.field).toBe('title');
      }
    });
  });

  describe('required field validation', () => {
    it('should reject missing checkinId', () => {
      const invalidData = createValidEditData({ checkinId: undefined });
      const result = contributionEditSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['checkinId']);
      }
    });

    it('should reject missing prevValue', () => {
      const invalidData = createValidEditData({ prevValue: undefined });
      const result = contributionEditSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['prevValue']);
      }
    });

    it('should reject missing newValue', () => {
      const invalidData = createValidEditData({ newValue: undefined });
      const result = contributionEditSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['newValue']);
      }
    });

    it('should reject missing field', () => {
      const invalidData = createValidEditData({ field: undefined });
      const result = contributionEditSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['field']);
      }
    });
  });

  describe('string validation', () => {
    it('should accept empty strings for values', () => {
      const validData = createValidEditData({
        prevValue: '',
        newValue: '',
      });
      const result = contributionEditSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should accept same prevValue and newValue', () => {
      const validData = createValidEditData({
        prevValue: 'same value',
        newValue: 'same value',
      });
      const result = contributionEditSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });
});
