/// <reference types="cypress" />

import type { UsersFixture } from '../../support/types';

describe('Member Invitation E2E', () => {
  beforeEach(() => {
    cy.cleanDatabase();
  });
  it('should successfully invite a new member as owner', () => {
    cy.fixture('users').then((users: UsersFixture) => {
      const { existingUser } = users;

      // Setup user with fairteiler as owner
      cy.setupUserWithFairteiler({ role: 'owner' }).then(({ user }) => {
        // Navigate to members page
        cy.navigateToMembers();

        // Verify page elements
        cy.contains('Mitglieder').should('be.visible');
        cy.contains(user.email).should('be.visible');

        cy.get('button').contains('Mitglied einladen').should('be.visible');

        // Open invite modal
        cy.get('button').contains('Mitglied einladen').click();

        // Verify modal opened
        cy.contains('Mitglied einladen').should('be.visible');
        cy.get('input[name="email"]').should('be.visible');

        // Fill invitation form
        cy.get('input[name="email"]').type(existingUser.email);
        cy.get('button[value="owner"]').click();

        // Submit invitation
        cy.get('button[type="submit"]').contains('Einladung senden').click();

        // Should show loading state
        cy.get('button[type="submit"]')
          .find('svg')
          .should('have.class', 'animate-spin');

        // Verify success message
        cy.contains(
          `Einladung erfolgreich an ${existingUser.email} gesendet!`,
        ).should('be.visible', { timeout: 10000 });

        // Verify modal closed
        cy.get('input[name="email"]').should('not.exist');
      });
    });
  });

  it('should handle form validation errors', () => {
    // Setup user with fairteiler as owner
    cy.setupUserWithFairteiler({ role: 'owner' }).then(() => {
      // Navigate to members page
      cy.navigateToMembers();

      // Open invite modal
      cy.get('button').contains('Mitglied einladen').click();
      cy.get('button[type="submit"]').should('be.disabled');

      // Try with invalid email
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('button[type="submit"]').contains('Einladung senden').click();

      // Should show email validation error
      cy.contains('Ungültige E-Mail-Adresse').should('be.visible');
    });
  });

  it('should prevent non-owners from inviting members', () => {
    cy.fixture('users').then((users: UsersFixture) => {
      const { validUser } = users;

      // Setup user with fairteiler as member (not owner)
      cy.setupUserWithFairteiler({ role: 'member' }).then(() => {
        // Navigate to members page
        cy.navigateToMembers();

        // Open invite modal
        cy.get('button').contains('Mitglied einladen').click();

        // Fill invitation form
        cy.get('input[name="email"]').type(validUser.email);
        cy.get('button[value="owner"]').click();
        cy.get('button[type="submit"]').contains('Einladung senden').click();

        // check for access denied message
        cy.contains(
          'You are not allowed to invite users to this organization',
        ).should('be.visible');
      });
    });
  });

  // it('should handle server errors gracefully', () => {
  //   cy.fixture('users').then((users: UsersFixture) => {
  //     const { validUser, existingUser } = users;

  //     cy.createTestUser({
  //       email: validUser.email,
  //       firstName: validUser.firstName,
  //       lastName: validUser.lastName || 'User',
  //       password: validUser.password,
  //     }).then((user) => {
  //       if (user) {
  //         cy.createTestFairteiler({
  //           name: 'Test Fairteiler',
  //           slug: 'test-fairteiler',
  //         }).then((fairteiler) => {
  //           if (isDatabaseFairteiler(fairteiler)) {
  //             cy.task('addUserToFairteiler', {
  //               userId: user.id,
  //               fairteilerId: fairteiler.id,
  //               role: 'owner',
  //             });

  //             cy.visit('/sign-in');
  //             cy.fillLoginForm({
  //               email: validUser.email,
  //               password: validUser.password,
  //             });

  //             // Navigate to members page
  //             cy.url({ timeout: 15000 }).should(
  //               'include',
  //               '/hub/fairteiler/dashboard',
  //             );
  //             cy.visit('/hub/fairteiler/members');

  //             // Intercept the invitation request to return error
  //             cy.intercept('POST', '**/members', {
  //               statusCode: 500,
  //               body: { error: 'Server error' },
  //             });

  //             // Open modal and fill form
  //             cy.get('button').contains('Mitglied einladen').click();
  //             cy.get('input[name="email"]').type(existingUser.email);
  //             cy.get('button[type="submit"]')
  //               .contains('Einladung senden')
  //               .click();

  //             // Should show error message
  //             cy.contains('Fehler beim Senden der Einladung').should(
  //               'be.visible',
  //             );
  //           }
  //         });
  //       }
  //     });
  //   });
  // });
});
