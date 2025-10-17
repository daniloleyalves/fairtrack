/// <reference types="cypress" />

import { isDatabaseFairteiler, UsersFixture } from '../../support/types';

describe('User Login E2E', () => {
  beforeEach(() => {
    cy.cleanDatabase();
  });
  it('should complete successful login workflow', () => {
    cy.fixture('users').then((users: UsersFixture) => {
      const { validUser } = users;

      // Create test user in database
      cy.createTestUser({
        email: validUser.email,
        firstName: validUser.firstName,
        lastName: validUser.lastName || 'User',
        password: validUser.password,
        isFirstLogin: false,
        isAnonymous: false,
      });

      // 1. Visit login page
      cy.visit('/sign-in');

      // 2. Verify page elements
      cy.contains('ANMELDEN').should('be.visible');
      cy.contains('Geben Sie unten Ihre E-Mail-Adresse ein').should(
        'be.visible',
      );

      // 3. Fill login form
      cy.fillTwoStepLoginForm({
        email: validUser.email,
        password: validUser.password,
      });

      // Should show loading spinner during final submission
      cy.get('button[type="submit"]')
        .contains('Anmelden')
        .find('svg')
        .should('have.class', 'animate-spin');

      // 4. Should redirect to dashboard
      cy.url({ timeout: 15000 }).should('include', '/hub/user/dashboard');

      // 5. Verify user was created
      cy.getUserByEmail(validUser.email).then((user) => {
        expect(user).to.exist;
        if (user) {
          expect(user.firstName).to.equal(validUser.firstName || 'Test');
          expect(user.lastName).to.equal(validUser.lastName || 'User');
          expect(user.email).to.equal(validUser.email);
          expect(user.emailVerified).to.be.false;
        }
      });
    });
  });

  it('should handle invalid credentials', () => {
    cy.visit('/sign-in');

    // Try to login with non-existent user
    cy.get('input[name="email"]').type('nonexistent@example.com');
    cy.get('button[type="submit"]').contains('Weiter').click();

    // Should show error message
    cy.contains('Kein Konto mit dieser E-Mail-Adresse gefunden.').should(
      'be.visible',
    );

    // Should remain on login page
    cy.url().should('include', '/sign-in');
  });

  it('should handle wrong password for existing user', () => {
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

      cy.visit('/sign-in');

      // Try to login with wrong password
      cy.fillTwoStepLoginForm({
        email: validUser.email,
        password: 'wrongpassword',
      });

      // Should show error message
      cy.contains('Ungültige E-Mail-Adresse oder Passwort.').should(
        'be.visible',
      );

      // Should remain on login page
      cy.url().should('include', '/sign-in');
    });
  });

  it('should handle form validation', () => {
    cy.fixture('users').then((users: UsersFixture) => {
      const { validUser } = users;
      // Create test user in database
      cy.createTestUser({
        email: validUser.email,
        firstName: validUser.firstName,
        lastName: validUser.lastName || 'User',
        password: validUser.password,
        isFirstLogin: false,
        isAnonymous: false,
      });

      cy.visit('/sign-in');

      // Submit button should be disabled when form is empty
      cy.get('button[type="submit"]').contains('Weiter').should('be.disabled');

      // Fill email field
      cy.get('input[name="email"]').type(validUser.email);
      cy.get('button[type="submit"]')
        .contains('Weiter')
        .should('not.be.disabled');

      // Click to proceed to password step
      cy.get('button[type="submit"]').contains('Weiter').click();

      // Password field should appear and submit should be disabled until password is entered
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]')
        .contains('Anmelden')
        .should('be.disabled');

      // Fill password field
      cy.get('input[name="password"]').type('somepassword');
      cy.get('button[type="submit"]')
        .contains('Anmelden')
        .should('not.be.disabled');
    });
  });

  it('should redirect to callback URL after login', () => {
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

      // Visit login page with callback URL
      cy.visit('/sign-in?callbackUrl=/some-protected-page');

      cy.fillTwoStepLoginForm({
        email: validUser.email,
        password: validUser.password,
      });

      // Should redirect to callback URL
      cy.url({ timeout: 15000 }).should('include', '/some-protected-page');
    });
  });

  it('should handle login with invitation', () => {
    cy.fixture('users').then((users: UsersFixture) => {
      const { validUser, existingUser } = users;

      // Create test fairteiler and user
      cy.createTestFairteiler({
        name: 'Test Fairteiler',
        slug: `test-fairteiler-${Date.now()}`,
      }).then((fairteiler) => {
        if (isDatabaseFairteiler(fairteiler)) {
          cy.createTestUser({
            email: existingUser.email,
            firstName: 'Existing',
            lastName: 'User',
            password: existingUser.password,
            isFirstLogin: false,
            isAnonymous: false,
          }).then((existingUser) => {
            cy.task('addUserToFairteiler', {
              userId: existingUser.id,
              fairteilerId: fairteiler.id,
              role: 'owner',
            });
            if (existingUser) {
              cy.createTestUser({
                email: validUser.email,
                firstName: 'User',
                lastName: 'ToBeInvited',
                password: validUser.password,
                isFirstLogin: false,
                isAnonymous: false,
              }).then((userToBeInvited) => {
                if (userToBeInvited) {
                  const invitationId = `invitation-${Date.now()}`;

                  // Create invitation
                  cy.task('createTestInvitation', {
                    id: invitationId,
                    email: userToBeInvited.email,
                    organizationId: fairteiler.id,
                    role: 'member',
                    inviterId: existingUser.id,
                  });

                  // Visit login page with invitation
                  cy.visit(`/sign-in?invitationId=${invitationId}`);

                  // Email should be pre-filled
                  cy.get('input[name="email"]').should(
                    'have.value',
                    userToBeInvited.email,
                  );

                  // Should show invitation message
                  cy.contains(
                    `Sie wurden zu ${fairteiler.name} eingeladen`,
                  ).should('be.visible');

                  cy.get('button[type="submit"]')
                    .contains('Weiter')
                    .should('not.be.disabled');
                  cy.get('button[type="submit"]').contains('Weiter').click();

                  // Wait for password field to appear
                  cy.get('input[name="password"]').should('be.visible');

                  // Complete login using validUser's password
                  cy.get('input[name="password"]').type(validUser.password);
                  cy.get('button[type="submit"]').contains('Anmelden').click();

                  // Should redirect to dashboard
                  cy.url({ timeout: 15000 }).should(
                    'include',
                    '/hub/user/dashboard',
                  );

                  // Verify user is now member of fairteiler
                  // cy.task('getMemberByUserId', userToBeInvited.id).then(
                  //   (member) => {
                  //     expect(member).to.exist;
                  //     if (member && isDatabaseMember(member)) {
                  //       expect(member.organizationId).to.equal(fairteiler.id);
                  //       expect(member.role).to.equal('member');
                  //     }
                  //   },
                  // );
                }
              });
            }
          });
        }
      });
    });
  });

  it('should allow going back to email step', () => {
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

      cy.visit('/sign-in');

      // Enter email and proceed
      cy.get('input[name="email"]').type(validUser.email);
      cy.get('button[type="submit"]').contains('Weiter').click();

      // Should be on password step
      cy.get('input[name="password"]').should('be.visible');
      cy.get('input[name="email"]').should('be.disabled');

      // Click "Ändern" to go back
      cy.get('button').contains('Ändern').click();

      // Should be back to email step
      cy.get('input[name="email"]').should('not.be.disabled');
      cy.get('input[name="password"]').should('not.exist');
      cy.get('button[type="submit"]').contains('Weiter').should('be.visible');
    });
  });

  it('should show link to registration page', () => {
    cy.visit('/sign-in');

    // Should show registration link
    cy.contains('Zum ersten Mal hier?').should('be.visible');
    cy.get('a[href="/sign-up"]').should('be.visible');

    // Click registration link
    cy.get('a[href="/sign-up"]').click();
    cy.url().should('include', '/sign-up');
  });

  it('should show link to password reset', () => {
    cy.visit('/sign-in');

    // Should show password reset link
    cy.get('a[href="/reset-password"]').should(
      'contain',
      'Passwort zurücksetzen',
    );

    // Click password reset link
    cy.get('a[href="/reset-password"]').click();
    cy.url().should('include', '/reset-password');
  });

  it('should handle disabled/banned user', () => {
    cy.fixture('users').then((users: UsersFixture) => {
      const { validUser } = users;

      // Create banned user
      cy.createTestUser({
        email: validUser.email,
        firstName: validUser.firstName || 'Test',
        lastName: validUser.lastName || 'User',
        password: validUser.password,
        isFirstLogin: false,
        isAnonymous: false,
      }).then((user) => {
        if (user) {
          // Ban the user
          cy.task('banUser', user.id);

          cy.visit('/sign-in');

          cy.fillTwoStepLoginForm({
            email: validUser.email,
            password: validUser.password,
          });

          // Should show banned user message
          cy.contains('Dieser Nutzer wurde deaktiviert').should('be.visible');
          cy.url().should('include', '/sign-in');
        }
      });
    });
  });
});
