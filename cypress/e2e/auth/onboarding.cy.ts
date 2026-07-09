/// <reference types="cypress" />

// The onboarding gate moved from the hub layouts into src/proxy.ts. These
// tests lock in that behavior: first-login users are redirected to onboarding
// from any hub route, already-onboarded users are not, and completing the
// wizard lands the user on the dashboard without looping back (the session
// cookie is refreshed by completeOnboardingAction so `isFirstLogin` is fresh).

describe('Onboarding gate E2E', () => {
  const password = 'SecurePass123';

  beforeEach(() => {
    cy.cleanDatabase();
    cy.task('seedExperienceLevels');
  });

  it('redirects a first-login user from a hub route to onboarding', () => {
    const email = `onboarding-first-${Date.now()}@example.com`;
    cy.createTestUser({
      email,
      firstName: 'First',
      lastName: 'Login',
      password,
      isFirstLogin: true,
      isAnonymous: false,
    });

    cy.visit('/sign-in');
    cy.fillTwoStepLoginForm({ email, password });

    // Login targets the dashboard; the middleware gate diverts first-login
    // users to onboarding.
    cy.url({ timeout: 15000 }).should('include', '/hub/onboarding');
  });

  it('does not gate an already-onboarded user', () => {
    const email = `onboarding-done-${Date.now()}@example.com`;
    cy.createTestUser({
      email,
      firstName: 'Done',
      lastName: 'User',
      password,
      isFirstLogin: false,
      isAnonymous: false,
    });

    cy.visit('/sign-in');
    cy.fillTwoStepLoginForm({ email, password });

    // An onboarded user is not diverted — login lands on the dashboard.
    cy.url({ timeout: 15000 }).should('include', '/hub/user/dashboard');
    cy.url().should('not.include', '/hub/onboarding');
  });

  it('completes onboarding and lands on the dashboard without looping back', () => {
    const email = `onboarding-complete-${Date.now()}@example.com`;
    cy.createTestUser({
      email,
      firstName: 'Complete',
      lastName: 'Flow',
      password,
      isFirstLogin: true,
      isAnonymous: false,
    });

    cy.visit('/sign-in');
    cy.fillTwoStepLoginForm({ email, password });

    // Gated straight into the wizard.
    cy.url({ timeout: 15000 }).should('include', '/hub/onboarding');

    // Step 1: Welcome
    cy.contains('button', 'Weiter').click();
    // Step 2: How-to
    cy.contains('button', 'Weiter').click();
    // Step 3: Foodsharing experience — a selection is required to advance.
    cy.contains('Neuling').click();
    cy.contains('button', 'Weiter').should('not.be.disabled').click();
    // Step 4: Gamification (pre-enabled)
    cy.contains('button', 'Weiter').click();
    // Step 5: Complete
    cy.contains("Los Geht's!").click();

    // Lands on the dashboard and stays there — no redirect loop back to
    // onboarding, which proves the cookie was refreshed to isFirstLogin=false.
    cy.url({ timeout: 15000 }).should('include', '/hub/user/dashboard');
    cy.url().should('not.include', '/hub/onboarding');

    // Re-navigating hits the middleware again with the refreshed cookie.
    cy.visit('/hub/user/dashboard');
    cy.url({ timeout: 15000 }).should('include', '/hub/user/dashboard');
    cy.url().should('not.include', '/hub/onboarding');
  });
});
