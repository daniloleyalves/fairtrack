/// <reference types="cypress" />

describe('Wizard Mode Contribution Flow E2E', () => {
  beforeEach(() => {
    cy.cleanDatabase();
    cy.seedBasicTestData();
  });
  it('should complete full wizard contribution flow with multiple categories', () => {
    cy.setupUserWithFairteiler({ role: 'owner', withTestData: true }).then(
      () => {
        cy.visitContributionPage();
        cy.switchContributionMode('wizard');

        cy.fixture('contributions').then((contributions) => {
          const testContribs = contributions.validContributions;
          // Complete wizard flow
          cy.completeWizardFlow({
            originName: 'Supermarkt',
            companyName: 'Edeka',
            contributions: testContribs.slice(0, 2),
          });

          // Verify contributions appear in table
          cy.get('table tbody tr').should('have.length.at.least', 2);
          cy.verifyContributionInTable(testContribs[0], 0);
          cy.verifyContributionInTable(testContribs[1], 1);
        });
      },
    );
  });

  it('should validate wizard mode step requirements', () => {
    // Setup user with fairteiler as owner (with test data)
    cy.setupUserWithFairteiler({ role: 'owner', withTestData: true }).then(
      () => {
        cy.visitContributionPage();
        cy.openContributionWizard();

        // Try to proceed without selecting origin
        cy.get('button').contains('Weiter').should('not.be.visible'); // Should auto-advance

        // Select origin
        cy.selectWizardOption('Supermarkt');

        // Should advance to company step
        cy.contains('Betrieb').should('be.visible');

        // Try to proceed without selecting company
        cy.get('button').contains('Weiter').should('not.be.visible'); // Should auto-advance

        cy.selectWizardOption('Edeka');

        // Should advance to categories
        cy.contains('Kategorien').should('be.visible');

        // Try to proceed without selecting category
        cy.get('button').contains('Weiter').should('not.be.visible');
      },
    );
  });

  it('should validate contribution details modal in wizard', () => {
    // Setup user with fairteiler as owner (with test data)
    cy.setupUserWithFairteiler({ role: 'owner', withTestData: true }).then(
      () => {
        cy.visitContributionPage();
        cy.openContributionWizard();

        // Navigate to category step
        cy.selectWizardOption('Supermarkt');
        cy.selectWizardOption('Edeka');

        // Click on category to open details modal
        cy.fixture('contributions').then((contributions) => {
          const category = contributions.testCategories[0];
          cy.selectWizardOption(category.name);

          // Modal should be open
          cy.get('[role="dialog"]').should('be.visible');
          cy.contains('Wie viel hast du gerettet?').should('be.visible');

          // Try to save with zero quantity
          cy.get('input[name="quantity"]').clear().type('0');
          cy.get('button').contains('Okay').should('be.disabled');

          // Enter valid quantity
          cy.get('input[name="quantity"]').clear().type('2');
          cy.get('button').contains('Okay').should('not.be.disabled');

          // Test with valid shelf life
          cy.get('input[name="shelfLife"]').clear().type('7');
          cy.get('button').contains('Okay').click();

          cy.contains('20 kg').should('be.visible');
        });
      },
    );
  });

  it('should handle removing contributions in wizard', () => {
    // Setup user with fairteiler as owner (with test data)
    cy.setupUserWithFairteiler({ role: 'owner', withTestData: true }).then(
      () => {
        cy.visitContributionPage();
        cy.openContributionWizard();

        // Navigate to category step
        cy.selectWizardOption('Supermarkt');
        cy.selectWizardOption('Edeka');

        cy.fixture('contributions').then((contributions) => {
          const category = contributions.testCategories[0];

          // Add contribution
          cy.contains(category.name).click();
          cy.get('input[name="quantity"]').clear().type('3');
          cy.get('button').contains('Okay').click();

          // Verify contribution was added
          cy.contains('30 kg').should('be.visible');

          // Click on category again to edit/remove
          cy.contains(category.name).click();

          // Should show remove button since contribution exists
          cy.get('button').contains('Entfernen').should('be.visible');

          // Remove contribution
          cy.get('button').contains('Entfernen').click();

          // Should return to category view without contribution
          cy.contains('30 kg').should('not.exist');
        });
      },
    );
  });
});
