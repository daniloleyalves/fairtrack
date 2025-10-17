/// <reference types="cypress" />

import type { UsersFixture } from '../../support/types';

describe('Access View Management E2E', () => {
  beforeEach(() => {
    cy.cleanDatabase();
  });
  it('should successfully create employee access view as owner', () => {
    // Setup user with fairteiler as owner
    cy.setupUserWithFairteiler({ role: 'owner' }).then(() => {
      // Navigate to members page
      cy.navigateToMembers();

      // Verify page elements
      cy.contains('Mitglieder').should('be.visible');
      cy.contains('Zugangsprofile').should('be.visible');
      cy.get('button').contains('Zugangsprofil anlegen').should('be.visible');

      // Open access view modal
      cy.get('button').contains('Zugangsprofil anlegen').click();

      // Verify modal opened
      cy.contains('Zugangsprofil anlegen').should('be.visible');
      cy.get('input[name="name"]').should('be.visible');
      cy.get('button[value="employee"]').should('be.visible');

      // Fill access view form
      cy.get('input[name="name"]').type('Test Employee');
      cy.get('button[value="employee"]').click();

      // Submit form
      cy.get('button[type="submit"]').contains('Zugangsprofil anlegen').click();

      // Should show loading state
      cy.get('button[type="submit"]')
        .find('svg')
        .should('have.class', 'animate-spin');

      // Verify success message
      cy.contains('Neues Zugangsprofil').should('be.visible', {
        timeout: 10000,
      });

      // Verify modal closed
      cy.get('input[name="name"]').should('not.exist');

      // Verify access view appears in table
      cy.contains('Test Employee').should('be.visible');
      cy.contains('employee').should('be.visible');

      // Should show auto-generated credentials
      cy.contains('E-Mail:').should('be.visible');
      cy.contains('Passwort:').should('be.visible');
    });
  });

  it('should successfully create guest access view', () => {
    // Setup user with fairteiler as owner
    cy.setupUserWithFairteiler({ role: 'owner' }).then(() => {
      // Navigate to members page
      cy.navigateToMembers();

      // Create guest access view
      cy.get('button').contains('Zugangsprofil anlegen').click();
      cy.get('input[name="name"]').type('Test Guest');
      cy.get('button[value="guest"]').click();
      cy.get('button[type="submit"]').contains('Zugangsprofil anlegen').click();

      cy.contains('Neues Zugangsprofil').should('be.visible', {
        timeout: 10000,
      });

      // Verify guest appears in table
      cy.contains('Test Guest').should('be.visible');
      cy.contains('guest').should('be.visible');
    });
  });

  it('should handle form validation errors', () => {
    // Setup user with fairteiler as owner
    cy.setupUserWithFairteiler({ role: 'owner' }).then(() => {
      // Navigate to members page
      cy.navigateToMembers();

      // Open modal
      cy.get('button').contains('Zugangsprofil anlegen').click();

      cy.get('button[type="submit"]').should('be.disabled');

      // Try with too short name
      cy.get('input[name="name"]').type('A');
      cy.get('button[type="submit"]').contains('Zugangsprofil anlegen').click();

      // Should show minimum length error
      cy.contains('Der Name muss mindestens 3 Zeichen lang sein').should(
        'be.visible',
      );
    });
  });

  it('should disable access views', () => {
    // Setup user with fairteiler as owner
    cy.setupUserWithFairteiler({ role: 'owner' }).then(() => {
      // Navigate to members page
      cy.navigateToMembers();

      // First create an access view
      cy.get('button').contains('Zugangsprofil anlegen').click();
      cy.get('input[name="name"]').type('Test Employee');
      cy.get('button[value="employee"]').click();
      cy.get('button[type="submit"]').contains('Zugangsprofil anlegen').click();

      cy.contains('Neues Zugangsprofil').should('be.visible', {
        timeout: 10000,
      });

      // close access view credentials modal
      cy.get('button').contains('Fertig').click();

      // Find the access view row and disable it
      cy.get('button:has(svg.lucide-ban)').click();

      // Confirm disable action
      cy.contains('Bist du dir absolut sicher?').should('be.visible');
      cy.get('button').contains('Deaktivieren').click();

      // Verify success message
      cy.contains('Zugang erfolgreich deaktiviert.').should('be.visible', {
        timeout: 10000,
      });

      // Verify access view is marked as disabled
      cy.contains('Test Employee').parent().should('contain', 'Deaktiviert');
    });
  });

  it('should prevent non-owners from managing access views', () => {
    // Setup user with fairteiler as member (not owner)
    cy.setupUserWithFairteiler({ role: 'member' }).then(() => {
      // Navigate to members page
      cy.navigateToMembers();

      // Open modal
      cy.get('button').contains('Zugangsprofil anlegen').click();

      cy.get('button[type="submit"]').should('be.disabled');

      // Intercept to spy on the actual API call
      cy.intercept('POST', '**/hub/fairteiler/members**').as('addAccessView');

      // Try with too short name
      cy.get('input[name="name"]').type('does-not-matter');
      cy.get('button[type="submit"]').contains('Zugangsprofil anlegen').click();

      // Verify that the request failed
      cy.wait('@addAccessView').then((interception) => {
        expect(interception.response).to.exist;
        expect(interception.response!.statusCode).to.be.equal(500);
      });
    });
  });

  // it('should handle server errors gracefully', () => {
  //   cy.fixture('users').then((users: UsersFixture) => {
  //     const { validUser } = users;

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

  //             cy.visit('/hub/fairteiler/members');

  //             // Intercept the request to return error
  //             cy.intercept('POST', '**/api/auth/**', {
  //               statusCode: 500,
  //               body: { error: 'Server error' },
  //             });

  //             // Open modal and fill form
  //             cy.get('button').contains('Zugangsprofil anlegen').click();
  //             cy.get('input[name="name"]').type('Test Employee');
  //             cy.get('select[name="role"]').select('employee');
  //             cy.get('button[type="submit"]')
  //               .contains('Zugangsprofil anlegen')
  //               .click();

  //             // Should show error message
  //             cy.contains(
  //               'Fehler beim Zugangsprofil anlegen des Zugangsprofils',
  //             ).should('be.visible');
  //           }
  //         });
  //       }
  //     });
  //   });
  // });

  it('should display existing access views', () => {
    cy.fixture('users').then((users: UsersFixture) => {
      const { validUser, existingUser } = users;

      // Setup employee user with fairteiler
      cy.setupUserWithFairteiler({ role: 'employee' }).then(
        ({ user, fairteiler }) => {
          // Create and add guest user
          cy.createTestUser({
            email: existingUser.email,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName || 'User',
            password: existingUser.password,
            isFirstLogin: false,
            isAnonymous: false,
          }).then((guestUser) => {
            if (guestUser) {
              cy.task('addUserToFairteiler', {
                userId: guestUser.id,
                fairteilerId: fairteiler.id,
                role: 'guest',
              });

              // Navigate to members page
              cy.navigateToMembers();

              // Verify page elements
              cy.contains('Mitglieder').should('be.visible');
              // Should show both users
              cy.contains(validUser.email).should('be.visible');
              cy.contains(existingUser.email).should('be.visible');

              // Should show their roles
              cy.contains('Mitarbeiter:in').should('be.visible');
              cy.contains('Gast').should('be.visible');
            }
          });
        },
      );
    });
  });
});
