/// <reference types="cypress" />

import type {
  TestUser,
  LoginCredentials,
  DatabaseUser,
  DatabaseFairteiler,
} from '../types';

// ============================================================================
// FORM COMMAND TYPES
// ============================================================================

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Fill and submit registration form
       */
      fillRegistrationForm(userData: TestUser): Chainable<void>;

      /**
       * Fill and submit login form (legacy single-step)
       */
      fillLoginForm(credentials: LoginCredentials): Chainable<void>;

      /**
       * Fill and submit two-step login form (new flow)
       */
      fillTwoStepLoginForm(credentials: LoginCredentials): Chainable<void>;

      /**
       * Setup authenticated user with fairteiler
       */
      setupUserWithFairteiler(options?: {
        userData?: Partial<TestUser>;
        fairteilerData?: { name?: string; slug?: string };
        role?: 'owner' | 'member' | 'employee' | 'guest';
        withTestData?: boolean;
      }): Chainable<{ user: DatabaseUser; fairteiler: DatabaseFairteiler }>;

      /**
       * Navigate to specific fairteiler pages
       */
      navigateToMembers(): Chainable<void>;
      navigateToProfile(): Chainable<void>;
      navigateToContributions(): Chainable<void>;
      navigateToPreferences(): Chainable<void>;
    }
  }
}

// ============================================================================
// FORM COMMAND IMPLEMENTATIONS
// ============================================================================

// Custom command to fill registration form
Cypress.Commands.add('fillRegistrationForm', (userData: TestUser) => {
  cy.get('input[name="firstName"]').type(userData.firstName);
  cy.get('input[name="lastName"]').type(userData.lastName);
  cy.get('input[name="email"]').type(userData.email);
  cy.get('input[name="password"]').type(userData.password as string);
  cy.get('input[name="passwordConfirm"]').type(userData.password as string);

  if (userData.acceptTos !== false) {
    cy.get('button[role="checkbox"]').click();
  }
});

// Custom command to fill login form (legacy single-step)
Cypress.Commands.add('fillLoginForm', (credentials) => {
  cy.get('input[name="email"]').type(credentials.email);
  cy.get('input[name="password"]').type(credentials.password);
  cy.get('button[type="submit"]').click();
});

// Custom command to fill two-step login form (new flow)
Cypress.Commands.add('fillTwoStepLoginForm', (credentials) => {
  // Step 1: Enter email and click "Weiter"
  cy.get('input[name="email"]').type(credentials.email);
  cy.get('button[type="submit"]').contains('Weiter').click();

  // Wait for password field to appear
  cy.get('input[name="password"]').should('be.visible');

  // Step 2: Enter password and click "Anmelden"
  cy.get('input[name="password"]').type(credentials.password);
  cy.get('button[type="submit"]').contains('Anmelden').click();
});

// ============================================================================
// CONSOLIDATED AUTHENTICATION COMMANDS
// ============================================================================

// Setup authenticated user with fairteiler
Cypress.Commands.add('setupUserWithFairteiler', (options = {}) => {
  const {
    userData = {},
    fairteilerData = {},
    role = 'owner',
    withTestData = false,
  } = options;

  return cy.fixture('users').then((users) => {
    const { validUser } = users;
    const userToCreate = {
      email: userData.email || validUser.email,
      firstName: userData.firstName || validUser.firstName,
      lastName: userData.lastName || validUser.lastName || 'User',
      password: userData.password || validUser.password,
      isFirstLogin: false,
      isAnonymous: false,
      ...userData,
    };

    const timestamp = Date.now();
    const fairteilerToCreate = {
      name: fairteilerData.name || 'Test Fairteiler',
      slug: fairteilerData.slug || `test-fairteiler-${timestamp}`,
      ...fairteilerData,
    };

    return cy.createTestUser(userToCreate).then((user) => {
      console.log('created', user);
      if (user) {
        return cy
          .createTestFairteiler(fairteilerToCreate, withTestData)
          .then((fairteiler) => {
            if (fairteiler) {
              cy.task('addUserToFairteiler', {
                userId: user.id,
                fairteilerId: fairteiler.id,
                role,
              });

              cy.visit('/sign-in');
              cy.fillTwoStepLoginForm({
                email: userToCreate.email,
                password: userToCreate.password,
              });

              return cy.wrap({ user, fairteiler });
            }
            throw new Error('Failed to create fairteiler');
          });
      }
      throw new Error('Failed to create user');
    });
  });
});

// ============================================================================
// NAVIGATION COMMANDS
// ============================================================================

// Navigate to members page
Cypress.Commands.add('navigateToMembers', () => {
  cy.url({ timeout: 15000 }).should('include', '/hub/fairteiler/dashboard');
  cy.visit('/hub/fairteiler/members');
  cy.contains('Mitglieder').should('be.visible');
});

// Navigate to profile page
Cypress.Commands.add('navigateToProfile', () => {
  cy.url({ timeout: 15000 }).should('include', '/hub/fairteiler/dashboard');
  cy.visit('/hub/fairteiler/profile');
  cy.contains('Fairteilerprofil').should('be.visible');
});

// Navigate to contributions page
Cypress.Commands.add('navigateToContributions', () => {
  cy.url({ timeout: 15000 }).should('include', '/hub/fairteiler/dashboard');
  cy.visit('/hub/fairteiler/contribution');
  cy.contains('Retteformular').should('be.visible');
});

// Navigate to preferences page
Cypress.Commands.add('navigateToPreferences', () => {
  cy.url({ timeout: 15000 }).should('include', '/hub/fairteiler/dashboard');
  cy.visit('/hub/fairteiler/preferences');
  cy.contains('Präferenzen').should('be.visible');
});

export {};
