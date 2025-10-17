/// <reference types="cypress" />

import type { UsersFixture } from '../../support/types';

describe('Password Reset E2E', () => {
  beforeEach(() => {
    cy.cleanDatabase();
  });
  it('should complete send reset instructions workflow', () => {
    cy.fixture('users').then((users: UsersFixture) => {
      const { validUser } = users;

      // Create test user
      cy.createTestUser({
        email: validUser.email,
        firstName: validUser.firstName || 'Test',
        lastName: validUser.lastName || 'User',
        password: validUser.password,
        isFirstLogin: false,
        isAnonymous: false,
      });

      // 1. Visit reset password page
      cy.visit('/reset-password');

      // 2. Verify page elements
      cy.contains('Passwort zurücksetzen').should('be.visible');
      cy.contains('Gebe deine E-Mail-Adresse an').should('be.visible');

      // 3. Fill email form
      cy.get('input[name="email"]').type(validUser.email);

      // 4. Submit form
      cy.get('button[type="submit"]')
        .should('contain', 'Passwort aktualisieren')
        .click();

      // 5. Should show success message
      cy.contains('Anweisungen gesendet').should('be.visible');
      cy.contains('Wenn deine E-Mail-Adresse gültig ist').should('be.visible');

      // 6. Should show back to login button
      cy.get('a[href="/sign-in"]').should('contain', 'Zurück zur Anmeldung');
    });
  });

  it('should handle non-existent email gracefully', () => {
    cy.visit('/reset-password');

    // Fill with non-existent email
    cy.get('input[name="email"]').type('nonexistent@example.com');
    cy.get('button[type="submit"]').click();

    // Should still show success message (security best practice)
    cy.contains('Anweisungen gesendet').should('be.visible');
  });

  it('should validate email format', () => {
    cy.visit('/reset-password');

    // Try invalid email format
    cy.get('input[name="email"]').type('invalid-email');
    cy.get('button[type="submit"]').click();

    // Should show validation error
    cy.get('input[name="email"]').focus().blur();
    cy.contains('Ungültige E-Mail-Adresse.').should('be.visible');
  });

  it('should handle empty email field', () => {
    cy.visit('/reset-password');

    // Submit button should be disabled when email is empty
    cy.get('button[type="submit"]').should('be.disabled');

    // Type and clear email
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('button[type="submit"]').should('not.be.disabled');

    cy.get('input[name="email"]').clear();
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should complete password reset with valid token', () => {
    cy.fixture('users').then((users: UsersFixture) => {
      const { validUser } = users;

      // Create test user and extract id
      cy.createTestUser({
        email: validUser.email,
        firstName: validUser.firstName || 'Test',
        lastName: validUser.lastName || 'User',
        password: validUser.password,
        isFirstLogin: false,
        isAnonymous: false,
      }).then((createdUser) => {
        // Create reset token for that user
        const resetToken = `reset-token-${Date.now()}`;
        cy.task('createResetToken', {
          userId: createdUser.id,
          token: resetToken,
        });

        // Visit reset password page with token
        cy.visit(`/reset-password?token=${resetToken}`);

        // Should show password reset form
        cy.contains('Passwort zurücksetzen').should('be.visible');
        cy.contains('Wähle ein neues Passwort').should('be.visible');

        // Fill new password
        const newPassword = 'NewSecurePass123!';
        cy.get('input[name="password"]').type(newPassword);
        cy.get('input[name="passwordConfirm"]').type(newPassword);

        // Submit form
        cy.get('button[type="submit"]').click();

        // Should show loading spinner
        cy.get('button[type="submit"]')
          .find('svg')
          .should('have.class', 'animate-spin');

        // Should redirect to login page with success message
        cy.url({ timeout: 10000 }).should('include', '/sign-in');

        // Should be able to login with new password
        cy.fillTwoStepLoginForm({
          email: validUser.email,
          password: newPassword,
        });

        cy.url({ timeout: 15000 }).should('include', '/hub/user/dashboard');
      });
    });
  });

  it('should handle invalid reset token', () => {
    cy.visit('/reset-password?token=invalid-token');

    // Should show invalid token message
    cy.contains('Ungültiger Token').should('be.visible');
    cy.contains('Bitte fordere einen neuen Link an.').should('be.visible');

    // Should show reset password button
    cy.get('a[href="/reset-password"]').should(
      'contain',
      'Neuen Link anfordern',
    );
  });

  it('should handle expired reset token', () => {
    cy.fixture('users').then((users: UsersFixture) => {
      const { validUser } = users;

      // Create test user
      cy.createTestUser({
        email: validUser.email,
        firstName: validUser.firstName || 'Test',
        lastName: validUser.lastName || 'User',
        password: validUser.password,
        isFirstLogin: false,
        isAnonymous: false,
      });

      // Create expired reset token
      const expiredToken = `expired-token-${Date.now()}`;
      cy.task('createExpiredResetToken', {
        email: validUser.email,
        token: expiredToken,
      });

      cy.visit(`/reset-password?token=${expiredToken}`);

      // Should show invalid token message
      cy.contains('Ungültiger Token').should('be.visible');
    });
  });

  it('should handle server error during reset request', () => {
    cy.visit('/reset-password');

    // Intercept the reset request to return error
    cy.intercept('POST', '**/forget-password', {
      statusCode: 500,
      body: { error: 'Server error' },
    });

    cy.get('input[name="email"]').type('test@example.com');
    cy.get('button[type="submit"]').click();

    // Should show error message
    cy.contains('Ein unerwarteter Fehler ist aufgetreten').should('be.visible');
  });
});
