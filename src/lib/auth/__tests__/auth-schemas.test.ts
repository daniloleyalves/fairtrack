import { describe, it, expect } from 'vitest';
import {
  signInSchema,
  signUpSchema,
  sendInstructionsSchema,
  resetPasswordSchema,
} from '../schemas';

describe('signInSchema', () => {
  const createValidSignInData = (overrides = {}) => ({
    email: 'test@example.com',
    password: 'password123',
    ...overrides,
  });

  describe('valid data validation', () => {
    it('should validate complete valid sign-in data', () => {
      const validData = createValidSignInData();
      const result = signInSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
        expect(result.data.password).toBe('password123');
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
        const validData = createValidSignInData({ email });
        const result = signInSchema.safeParse(validData);

        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        '',
        'user name@example.com',
      ];

      invalidEmails.forEach((email) => {
        const invalidData = createValidSignInData({ email });
        const result = signInSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            'Ungültige E-Mail-Adresse.',
          );
        }
      });
    });
  });

  describe('password validation', () => {
    it('should accept password with exactly 6 characters', () => {
      const validData = createValidSignInData({ password: '123456' });
      const result = signInSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should accept long passwords', () => {
      const longPassword = 'a'.repeat(100);
      const validData = createValidSignInData({ password: longPassword });
      const result = signInSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject passwords shorter than 6 characters', () => {
      const shortPasswords = ['', '1', '12', '123', '1234', '12345'];

      shortPasswords.forEach((password) => {
        const invalidData = createValidSignInData({ password });
        const result = signInSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            'Passwort muss mindestens 6 Zeichen lang sein.',
          );
        }
      });
    });
  });

  describe('required field validation', () => {
    it('should reject missing email', () => {
      const invalidData = createValidSignInData({ email: undefined });
      const result = signInSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const invalidData = createValidSignInData({ password: undefined });
      const result = signInSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });
});

describe('signUpSchema', () => {
  const createValidSignUpData = (overrides = {}) => ({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'Password123',
    passwordConfirm: 'Password123',
    tos: true,
    ...overrides,
  });

  describe('valid data validation', () => {
    it('should validate complete valid sign-up data', () => {
      const validData = createValidSignUpData();
      const result = signUpSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.firstName).toBe('John');
        expect(result.data.lastName).toBe('Doe');
        expect(result.data.email).toBe('john.doe@example.com');
        expect(result.data.password).toBe('Password123');
        expect(result.data.passwordConfirm).toBe('Password123');
        expect(result.data.tos).toBe(true);
      }
    });
  });

  describe('name validation', () => {
    it('should accept names with exactly 2 characters', () => {
      const validData = createValidSignUpData({
        firstName: 'Jo',
        lastName: 'Do',
      });
      const result = signUpSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should accept long names', () => {
      const longName = 'a'.repeat(50);
      const validData = createValidSignUpData({
        firstName: longName,
        lastName: longName,
      });
      const result = signUpSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject first names shorter than 2 characters', () => {
      const shortNames = ['', 'J'];

      shortNames.forEach((firstName) => {
        const invalidData = createValidSignUpData({ firstName });
        const result = signUpSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            'Bitte gib mindestens 2 Zeichen ein.',
          );
        }
      });
    });

    it('should reject last names shorter than 2 characters', () => {
      const shortNames = ['', 'D'];

      shortNames.forEach((lastName) => {
        const invalidData = createValidSignUpData({ lastName });
        const result = signUpSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            'Bitte gib mindestens 2 Zeichen ein.',
          );
        }
      });
    });

    it('should trim whitespace from names', () => {
      const validData = createValidSignUpData({
        firstName: '  John  ',
        lastName: '  Doe  ',
      });
      const result = signUpSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.firstName).toBe('John');
        expect(result.data.lastName).toBe('Doe');
      }
    });

    it('should accept names with special characters', () => {
      const specialNames = [
        'Jean-Pierre',
        "O'Connor",
        'José',
        'Müller',
        'van der Berg',
      ];

      specialNames.forEach((name) => {
        const validData = createValidSignUpData({
          firstName: name,
          lastName: name,
        });
        const result = signUpSchema.safeParse(validData);

        expect(result.success).toBe(true);
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
      ];

      validEmails.forEach((email) => {
        const validData = createValidSignUpData({ email });
        const result = signUpSchema.safeParse(validData);

        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        '',
        'user name@example.com',
      ];

      invalidEmails.forEach((email) => {
        const invalidData = createValidSignUpData({ email });
        const result = signUpSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            'Ungültige E-Mail-Adresse.',
          );
        }
      });
    });
  });

  describe('password validation', () => {
    it('should accept password with exactly 8 characters, uppercase and digit', () => {
      const validData = createValidSignUpData({
        password: 'Password1',
        passwordConfirm: 'Password1',
      });
      const result = signUpSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject passwords shorter than 8 characters', () => {
      const shortPasswords = [
        '',
        '1',
        '12',
        '123',
        '1234',
        '12345',
        '123456',
        '1234567',
      ];

      shortPasswords.forEach((password) => {
        const invalidData = createValidSignUpData({
          password,
          passwordConfirm: password,
        });
        const result = signUpSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            'Passwort muss mindestens 8 Zeichen lang sein.',
          );
        }
      });
    });

    it('should reject passwords without uppercase letters', () => {
      const invalidPasswords = ['password123', 'mypassword1', 'test12345'];

      invalidPasswords.forEach((password) => {
        const invalidData = createValidSignUpData({
          password,
          passwordConfirm: password,
        });
        const result = signUpSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          const uppercaseError = result.error.issues.find(
            (issue) =>
              issue.message ===
              'Das Passwort muss mindestens einen Großbuchstaben enthalten.',
          );
          expect(uppercaseError).toBeDefined();
        }
      });
    });

    it('should reject passwords without digits', () => {
      const invalidPasswords = ['Password', 'MyPassword', 'TestPassword'];

      invalidPasswords.forEach((password) => {
        const invalidData = createValidSignUpData({
          password,
          passwordConfirm: password,
        });
        const result = signUpSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          const digitError = result.error.issues.find(
            (issue) =>
              issue.message ===
              'Das Passwort muss mindestens eine Ziffer enthalten.',
          );
          expect(digitError).toBeDefined();
        }
      });
    });

    it('should accept passwords with special characters', () => {
      const validPasswords = ['Password123!', 'MyP@ssw0rd', 'Test#123$'];

      validPasswords.forEach((password) => {
        const validData = createValidSignUpData({
          password,
          passwordConfirm: password,
        });
        const result = signUpSchema.safeParse(validData);

        expect(result.success).toBe(true);
      });
    });

    it('should trim whitespace from passwords', () => {
      const validData = createValidSignUpData({
        password: '  Password123  ',
        passwordConfirm: '  Password123  ',
      });
      const result = signUpSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.password).toBe('Password123');
        expect(result.data.passwordConfirm).toBe('Password123');
      }
    });
  });

  describe('password confirmation validation', () => {
    it('should reject when passwords do not match', () => {
      const invalidData = createValidSignUpData({
        password: 'Password123',
        passwordConfirm: 'DifferentPassword123',
      });
      const result = signUpSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmError = result.error.issues.find(
          (issue) => issue.message === 'Passwörter stimmen nicht überein.',
        );
        expect(confirmError).toBeDefined();
        expect(confirmError?.path).toEqual(['passwordConfirm']);
      }
    });

    it('should reject empty password confirmation', () => {
      const invalidData = createValidSignUpData({ passwordConfirm: '' });
      const result = signUpSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Passwort bestätigen wird benötigt.',
        );
      }
    });
  });

  describe('terms of service validation', () => {
    it('should reject when TOS is false', () => {
      const invalidData = createValidSignUpData({ tos: false });
      const result = signUpSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Bitte aktzeptiere die Nutzungsbedingungen.',
        );
      }
    });

    it('should reject when TOS is missing', () => {
      const invalidData = createValidSignUpData({ tos: undefined });
      const result = signUpSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Bitte aktzeptiere die Nutzungsbedingungen.',
        );
      }
    });
  });

  describe('required field validation', () => {
    it('should reject missing firstName', () => {
      const invalidData = createValidSignUpData({ firstName: undefined });
      const result = signUpSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject missing lastName', () => {
      const invalidData = createValidSignUpData({ lastName: undefined });
      const result = signUpSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject missing email', () => {
      const invalidData = createValidSignUpData({ email: undefined });
      const result = signUpSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const invalidData = createValidSignUpData({ password: undefined });
      const result = signUpSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Passwort wird benötigt.');
      }
    });
  });
});

describe('sendInstructionsSchema', () => {
  const createValidSendInstructionsData = (overrides = {}) => ({
    email: 'test@example.com',
    ...overrides,
  });

  describe('valid data validation', () => {
    it('should validate complete valid send instructions data', () => {
      const validData = createValidSendInstructionsData();
      const result = sendInstructionsSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
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
        const validData = createValidSendInstructionsData({ email });
        const result = sendInstructionsSchema.safeParse(validData);

        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        '',
        'user name@example.com',
      ];

      invalidEmails.forEach((email) => {
        const invalidData = createValidSendInstructionsData({ email });
        const result = sendInstructionsSchema.safeParse(invalidData);

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
      const invalidData = createValidSendInstructionsData({ email: undefined });
      const result = sendInstructionsSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });
});

describe('resetPasswordSchema', () => {
  const createValidResetPasswordData = (overrides = {}) => ({
    password: 'NewPassword123',
    passwordConfirm: 'NewPassword123',
    ...overrides,
  });

  describe('valid data validation', () => {
    it('should validate complete valid reset password data', () => {
      const validData = createValidResetPasswordData();
      const result = resetPasswordSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.password).toBe('NewPassword123');
        expect(result.data.passwordConfirm).toBe('NewPassword123');
      }
    });
  });

  describe('password validation', () => {
    it('should accept password with exactly 8 characters, uppercase and digit', () => {
      const validData = createValidResetPasswordData({
        password: 'Password1',
        passwordConfirm: 'Password1',
      });
      const result = resetPasswordSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject passwords shorter than 8 characters', () => {
      const shortPasswords = [
        '',
        '1',
        '12',
        '123',
        '1234',
        '12345',
        '123456',
        '1234567',
      ];

      shortPasswords.forEach((password) => {
        const invalidData = createValidResetPasswordData({
          password,
          passwordConfirm: password,
        });
        const result = resetPasswordSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            'Passwort muss mindestens 8 Zeichen lang sein.',
          );
        }
      });
    });

    it('should reject passwords without uppercase letters', () => {
      const invalidPasswords = ['password123', 'mypassword1', 'test12345'];

      invalidPasswords.forEach((password) => {
        const invalidData = createValidResetPasswordData({
          password,
          passwordConfirm: password,
        });
        const result = resetPasswordSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          const uppercaseError = result.error.issues.find(
            (issue) =>
              issue.message ===
              'Das Passwort muss mindestens einen Großbuchstaben enthalten.',
          );
          expect(uppercaseError).toBeDefined();
        }
      });
    });

    it('should reject passwords without digits', () => {
      const invalidPasswords = ['Password', 'MyPassword', 'TestPassword'];

      invalidPasswords.forEach((password) => {
        const invalidData = createValidResetPasswordData({
          password,
          passwordConfirm: password,
        });
        const result = resetPasswordSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          const digitError = result.error.issues.find(
            (issue) =>
              issue.message ===
              'Das Passwort muss mindestens eine Ziffer enthalten.',
          );
          expect(digitError).toBeDefined();
        }
      });
    });

    it('should trim whitespace from passwords', () => {
      const validData = createValidResetPasswordData({
        password: '  NewPassword123  ',
        passwordConfirm: '  NewPassword123  ',
      });
      const result = resetPasswordSchema.safeParse(validData);

      // Debug the actual error if validation fails
      if (!result.success) {
        console.log('Validation errors:', result.error.issues);
      }

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.password).toBe('NewPassword123');
        expect(result.data.passwordConfirm).toBe('NewPassword123');
      }
    });
  });

  describe('password confirmation validation', () => {
    it('should reject when passwords do not match', () => {
      const invalidData = createValidResetPasswordData({
        password: 'NewPassword123',
        passwordConfirm: 'DifferentPassword123',
      });
      const result = resetPasswordSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmError = result.error.issues.find(
          (issue) => issue.message === 'Passwörter stimmen nicht überein.',
        );
        expect(confirmError).toBeDefined();
        expect(confirmError?.path).toEqual(['passwordConfirm']);
      }
    });
  });

  describe('required field validation', () => {
    it('should reject missing password', () => {
      const invalidData = createValidResetPasswordData({ password: undefined });
      const result = resetPasswordSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Passwort wird benötigt.');
      }
    });

    it('should reject missing passwordConfirm', () => {
      const invalidData = createValidResetPasswordData({
        passwordConfirm: undefined,
      });
      const result = resetPasswordSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Passwörter stimmen nicht überein.',
        );
      }
    });
  });
});
