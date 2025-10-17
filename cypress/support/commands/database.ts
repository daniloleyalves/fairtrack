/// <reference types="cypress" />

import type {
  TestUser,
  TestFairteiler,
  DatabaseUser,
  DatabaseFairteiler,
  DatabasePreference,
} from '../types';

// ============================================================================
// DATABASE COMMAND TYPES
// ============================================================================

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Create a test user in the database
       */
      createTestUser(userData?: TestUser): Chainable<DatabaseUser>;

      /**
       * Remove a test user in the database
       */
      removeTestUser(userEmail?: string): Chainable<void>;

      /**
       * Create a test fairteiler in the database
       */
      createTestFairteiler(
        fairteilerData?: TestFairteiler,
        withTestData?: boolean,
      ): Chainable<DatabaseFairteiler>;

      /**
       * Remove a test fairteiler in the database
       */
      removeTestFairteiler(fairteilerSlug?: string): Chainable<void>;

      /**
       * Clean the test database
       */
      cleanDatabase(): Chainable<null>;

      /**
       * Seed basic test data (categories, origins, companies)
       */
      seedBasicTestData(): Chainable<{
        categories: DatabasePreference[];
        origins: DatabasePreference[];
        companies: DatabasePreference[];
      }>;

      /**
       * Get user by email from database
       */
      getUserByEmail(email: string): Chainable<DatabaseUser | null>;
    }
  }
}

// ============================================================================
// DATABASE COMMAND IMPLEMENTATIONS
// ============================================================================

// Custom command to create test user
Cypress.Commands.add('createTestUser', (userData) => {
  return cy
    .task('createTestUser', userData)
    .then((user) => user as DatabaseUser) as Cypress.Chainable<DatabaseUser>;
});

// Custom command to create test user
Cypress.Commands.add('removeTestUser', (userEmail) => {
  return cy
    .task('removeTestUserByEmail', userEmail)
    .then((user) => user) as Cypress.Chainable<void>;
});

// Custom command to create test fairteiler
Cypress.Commands.add('createTestFairteiler', (fairteilerData, withTestData) => {
  return cy
    .task('createTestFairteiler', { fairteilerData, withTestData })
    .then(
      (fairteiler) => fairteiler as DatabaseFairteiler,
    ) as Cypress.Chainable<DatabaseFairteiler>;
});

// Custom command to remove test fairteiler
Cypress.Commands.add('removeTestFairteiler', (fairteilerSlug) => {
  return cy
    .task('removeTestFairteilerByFairteilerSlug', fairteilerSlug)
    .then((fairteiler) => fairteiler) as Cypress.Chainable<void>;
});

// Custom command to clean database
Cypress.Commands.add('cleanDatabase', () => {
  return cy.task('cleanDatabase');
});

// Custom command to seed basic test data
Cypress.Commands.add('seedBasicTestData', () => {
  return cy.task('seedBasicTestData');
});

// Custom command to get user by email
Cypress.Commands.add('getUserByEmail', (email: string) => {
  return cy
    .task('getUserByEmail', email)
    .then(
      (user) => user as DatabaseUser | null,
    ) as Cypress.Chainable<DatabaseUser | null>;
});

export {};
