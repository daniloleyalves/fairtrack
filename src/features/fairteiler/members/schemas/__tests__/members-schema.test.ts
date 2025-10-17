import { describe, it, expect } from 'vitest';
import { MemberRolesEnum } from '@/lib/auth/auth-permissions';
import {
  changeRoleSchema,
  inviteMemberSchema,
  accessViewSchema,
  removeMemberSchema,
} from '../members-schema';

describe('changeRoleSchema', () => {
  const createValidChangeRoleData = (overrides = {}) => ({
    userId: 'user-123',
    memberId: 'member-456',
    role: MemberRolesEnum.MEMBER,
    ...overrides,
  });

  describe('valid data validation', () => {
    it('should validate complete valid change role data', () => {
      const validData = createValidChangeRoleData();
      const result = changeRoleSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.userId).toBe('user-123');
        expect(result.data.memberId).toBe('member-456');
        expect(result.data.role).toBe(MemberRolesEnum.MEMBER);
      }
    });

    it('should validate all valid member roles', () => {
      const roles = [
        MemberRolesEnum.OWNER,
        MemberRolesEnum.MEMBER,
        MemberRolesEnum.VIEWER,
        MemberRolesEnum.EMPLOYEE,
        MemberRolesEnum.GUEST,
        MemberRolesEnum.DISABLED,
      ];

      roles.forEach((role) => {
        const validData = createValidChangeRoleData({ role });
        const result = changeRoleSchema.safeParse(validData);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.role).toBe(role);
        }
      });
    });
  });

  describe('required field validation', () => {
    it('should reject missing userId', () => {
      const invalidData = createValidChangeRoleData({ userId: undefined });
      const result = changeRoleSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['userId']);
      }
    });

    it('should reject missing memberId', () => {
      const invalidData = createValidChangeRoleData({ memberId: undefined });
      const result = changeRoleSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['memberId']);
      }
    });

    it('should reject missing role', () => {
      const invalidData = createValidChangeRoleData({ role: undefined });
      const result = changeRoleSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['role']);
      }
    });
  });

  describe('role validation', () => {
    it('should reject invalid role string', () => {
      const invalidData = createValidChangeRoleData({
        role: 'invalid-role' as string,
      });
      const result = changeRoleSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject non-string role', () => {
      const invalidData = createValidChangeRoleData({
        role: 123 as number | string,
      });
      const result = changeRoleSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('string validation', () => {
    it('should accept empty strings for IDs', () => {
      const validData = createValidChangeRoleData({
        userId: '',
        memberId: '',
      });
      const result = changeRoleSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });
});

describe('inviteMemberSchema', () => {
  const createValidInviteData = (overrides = {}) => ({
    email: 'test@example.com',
    role: MemberRolesEnum.MEMBER,
    ...overrides,
  });

  describe('valid data validation', () => {
    it('should validate complete valid invite data', () => {
      const validData = createValidInviteData();
      const result = inviteMemberSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
        expect(result.data.role).toBe(MemberRolesEnum.MEMBER);
      }
    });

    it('should validate all valid member roles', () => {
      const roles = [
        MemberRolesEnum.OWNER,
        MemberRolesEnum.MEMBER,
        MemberRolesEnum.VIEWER,
        MemberRolesEnum.EMPLOYEE,
        MemberRolesEnum.GUEST,
        MemberRolesEnum.DISABLED,
      ];

      roles.forEach((role) => {
        const validData = createValidInviteData({ role });
        const result = inviteMemberSchema.safeParse(validData);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.role).toBe(role);
        }
      });
    });
  });

  describe('email validation', () => {
    it('should validate various valid email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'firstname.lastname@company.com',
        'user123@test-domain.com',
      ];

      validEmails.forEach((email) => {
        const validData = createValidInviteData({ email });
        const result = inviteMemberSchema.safeParse(validData);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.email).toBe(email);
        }
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user..name@example.com',
        'user@.com',
        'user@domain.',
        '',
        'user name@example.com',
      ];

      invalidEmails.forEach((email) => {
        const invalidData = createValidInviteData({ email });
        const result = inviteMemberSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            'Ungültige E-Mail-Adresse.',
          );
        }
      });
    });
  });

  describe('required field validation', () => {
    it('should reject missing email', () => {
      const invalidData = createValidInviteData({ email: undefined });
      const result = inviteMemberSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['email']);
      }
    });

    it('should reject missing role', () => {
      const invalidData = createValidInviteData({ role: undefined });
      const result = inviteMemberSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['role']);
      }
    });
  });
});

describe('accessViewSchema', () => {
  const createValidAccessViewData = (overrides = {}) => ({
    name: 'Test Access View',
    role: MemberRolesEnum.EMPLOYEE,
    ...overrides,
  });

  describe('valid data validation', () => {
    it('should validate complete valid access view data', () => {
      const validData = createValidAccessViewData();
      const result = accessViewSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Test Access View');
        expect(result.data.role).toBe(MemberRolesEnum.EMPLOYEE);
      }
    });

    it('should validate both allowed access view roles', () => {
      const allowedRoles = [MemberRolesEnum.EMPLOYEE, MemberRolesEnum.GUEST];

      allowedRoles.forEach((role) => {
        const validData = createValidAccessViewData({ role });
        const result = accessViewSchema.safeParse(validData);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.role).toBe(role);
        }
      });
    });
  });

  describe('name validation', () => {
    it('should accept name with exactly 3 characters', () => {
      const validData = createValidAccessViewData({ name: 'ABC' });
      const result = accessViewSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should accept long names', () => {
      const longName = 'Very Long Access View Name For Testing';
      const validData = createValidAccessViewData({ name: longName });
      const result = accessViewSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe(longName);
      }
    });

    it('should reject names shorter than 3 characters', () => {
      const shortNames = ['', 'A', 'AB'];

      shortNames.forEach((name) => {
        const invalidData = createValidAccessViewData({ name });
        const result = accessViewSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            'Der Name muss mindestens 3 Zeichen lang sein.',
          );
        }
      });
    });

    it('should accept names with special characters', () => {
      const specialNames = [
        'Test-View',
        'Test_View',
        'Test View 123',
        'Café Access',
        'Müller View',
      ];

      specialNames.forEach((name) => {
        const validData = createValidAccessViewData({ name });
        const result = accessViewSchema.safeParse(validData);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.name).toBe(name);
        }
      });
    });
  });

  describe('role validation', () => {
    it('should reject non-access-view roles', () => {
      const disallowedRoles = [
        MemberRolesEnum.OWNER,
        MemberRolesEnum.MEMBER,
        MemberRolesEnum.VIEWER,
        MemberRolesEnum.DISABLED,
      ];

      disallowedRoles.forEach((role) => {
        const invalidData = createValidAccessViewData({ role });
        const result = accessViewSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            'Bitte wähle eine gültige Rolle.',
          );
        }
      });
    });

    it('should reject invalid role strings', () => {
      const invalidData = createValidAccessViewData({
        role: 'invalid-role' as string,
      });
      const result = accessViewSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Bitte wähle eine gültige Rolle.',
        );
      }
    });
  });

  describe('required field validation', () => {
    it('should reject missing name', () => {
      const invalidData = createValidAccessViewData({ name: undefined });
      const result = accessViewSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['name']);
      }
    });

    it('should reject missing role', () => {
      const invalidData = createValidAccessViewData({ role: undefined });
      const result = accessViewSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['role']);
      }
    });
  });
});

describe('removeMemberSchema', () => {
  const createValidRemoveData = (overrides = {}) => ({
    organizationId: 'org-123',
    email: 'member@example.com',
    ...overrides,
  });

  describe('valid data validation', () => {
    it('should validate complete valid remove member data', () => {
      const validData = createValidRemoveData();
      const result = removeMemberSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.organizationId).toBe('org-123');
        expect(result.data.email).toBe('member@example.com');
      }
    });
  });

  describe('email validation', () => {
    it('should validate various valid email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'firstname.lastname@company.com',
      ];

      validEmails.forEach((email) => {
        const validData = createValidRemoveData({ email });
        const result = removeMemberSchema.safeParse(validData);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.email).toBe(email);
        }
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        'user name@example.com',
      ];

      invalidEmails.forEach((email) => {
        const invalidData = createValidRemoveData({ email });
        const result = removeMemberSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            'Ungültige E-Mail-Adresse.',
          );
        }
      });
    });

    it('should reject empty email', () => {
      const invalidData = createValidRemoveData({ email: '' });
      const result = removeMemberSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        // Empty string fails email validation first, then min length
        expect(result.error.issues[0].message).toBe(
          'Ungültige E-Mail-Adresse.',
        );
      }
    });
  });

  describe('organization validation', () => {
    it('should accept various organization ID formats', () => {
      const validOrgIds = [
        'org-123',
        'organization-456',
        'uuid-550e8400-e29b-41d4-a716-446655440000',
        'simple-id',
        '12345',
      ];

      validOrgIds.forEach((organizationId) => {
        const validData = createValidRemoveData({ organizationId });
        const result = removeMemberSchema.safeParse(validData);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.organizationId).toBe(organizationId);
        }
      });
    });

    it('should accept empty organization ID', () => {
      const validData = createValidRemoveData({ organizationId: '' });
      const result = removeMemberSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });

  describe('required field validation', () => {
    it('should reject missing organizationId', () => {
      const invalidData = createValidRemoveData({ organizationId: undefined });
      const result = removeMemberSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['organizationId']);
      }
    });

    it('should reject missing email', () => {
      const invalidData = createValidRemoveData({ email: undefined });
      const result = removeMemberSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['email']);
      }
    });
  });
});
