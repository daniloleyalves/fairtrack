/// <reference types="cypress" />

describe('Fastmode Contribution Flow E2E', () => {
  beforeEach(() => {
    cy.cleanDatabase();
    cy.seedBasicTestData();
  });
  it('should complete full fastmode contribution flow with multiple items', () => {
    cy.setupUserWithFairteiler({ role: 'owner', withTestData: true }).then(
      () => {
        cy.visitContributionPage();

        // Switch to fastmode
        cy.switchContributionMode('fast');

        cy.fixture('contributions').then((contributions) => {
          const testContribs = contributions.fastModeContributions;

          // Add first contribution
          cy.addContributionRow();
          cy.fillContributionRow(0, testContribs[0]);

          // Add second contribution
          cy.addContributionRow();
          cy.fillContributionRow(1, testContribs[1]);

          // Verify both contributions appear in table
          cy.verifyContributionInTable(testContribs[0], 0);
          cy.verifyContributionInTable(testContribs[1], 1);

          // Submit contributions
          cy.submitContributions();

          // Should show loading spinner
          cy.get('button[type="submit"]')
            .find('svg')
            .should('have.class', 'animate-spin');

          // Verify success (should redirect or show success message)
          cy.url({ timeout: 10000 }).should('include', '/success');
        });
      },
    );
  });

  it('should handle adding and removing multiple rows in fastmode', () => {
    cy.setupUserWithFairteiler({ role: 'owner' }).then(() => {
      cy.visitContributionPage();
      cy.switchContributionMode('fast');

      // Add multiple rows
      cy.addContributionRow();
      cy.addContributionRow();
      cy.addContributionRow();

      // Should have 3 rows
      cy.get('table tbody tr').should('have.length', 4); // +1 for add button row

      // Remove middle row
      cy.removeContributionRow(1);

      // Should have 2 rows now
      cy.get('table tbody tr').should('have.length', 3); // +1 for add button row

      // Remove all remaining rows
      cy.removeContributionRow(0);
      cy.removeContributionRow(0);

      // Should show empty state
      cy.contains('Bitte trage jedes Lebensmittel einzeln ein').should(
        'be.visible',
      );
    });
  });

  it('should validate required fields in fastmode', () => {
    // Setup user with fairteiler as owner
    cy.setupUserWithFairteiler({ role: 'owner' }).then(() => {
      cy.visitContributionPage();
      cy.switchContributionMode('fast');

      // Test empty form submission
      cy.get('button[type="submit"]').should('be.disabled');

      // Add empty row
      cy.addContributionRow();

      // Try to submit
      cy.get('button[type="submit"]').click();

      // Should show validation errors
      cy.verifyValidationError('category-select-0');
      cy.verifyValidationError('origin-select-0');
      cy.verifyValidationError('quantity-incrementer-0');
    });
  });

  it('should validate quantity field constraints', () => {
    // Setup user with fairteiler as owner
    cy.setupUserWithFairteiler({ role: 'owner' }).then(() => {
      cy.visitContributionPage();
      cy.switchContributionMode('fast');
      cy.addContributionRow();

      const quantityInput =
        'table tbody tr:first-child td:nth-child(4) input[type="number"]';

      // Test zero quantity
      cy.get(quantityInput).clear();
      cy.get(quantityInput).blur();
      cy.verifyValidationError('quantity-incrementer-0');

      // Test valid decimal quantity
      cy.get(quantityInput).clear().type('2.5');
      cy.get(quantityInput).should('have.value', '2.50');
    });
  });

  it('should validate shelf life constraints', () => {
    // Setup user with fairteiler as owner
    cy.setupUserWithFairteiler({ role: 'owner' }).then(() => {
      cy.visitContributionPage();
      cy.switchContributionMode('fast');
      cy.addContributionRow();

      const shelfLifeInput =
        'table tbody tr:first-child td:nth-child(5) input[type="number"]';

      // Test zero (unlimited shelf life)
      cy.get(shelfLifeInput).clear().type('0');

      cy.get('body').click();

      cy.get(shelfLifeInput)
        .parent()
        .find('svg')
        .should('have.class', 'lucide-infinity');

      // Test future date
      cy.get(shelfLifeInput).clear().type('7');
      cy.get(shelfLifeInput).should('have.value', '70');

      // Test very large number
      cy.get(shelfLifeInput).clear().type('365');
      cy.get(shelfLifeInput).should('have.value', '3650');
    });
  });

  it('should validate text field length constraints', () => {
    // Setup user with fairteiler as owner (with test data)
    cy.setupUserWithFairteiler({ role: 'owner', withTestData: true }).then(
      () => {
        cy.visitContributionPage();
        cy.switchContributionMode('fast');
        cy.addContributionRow();

        cy.fixture('contributions').then((contributions) => {
          const testContrib = contributions.validContributions[0];

          // Fill basic required fields first
          cy.fillContributionRow(0, testContrib);

          // Open optional fields modal
          cy.fillOptionalFields(0, {
            title: 'A'.repeat(51), // Max 50 characters
            allergens: 'A'.repeat(101), // Max 100 characters
            comment: 'A '.repeat(201), // Max 400 characters
          });

          // Should show validation errors for optional fields
          cy.contains('Dieses Feld darf nicht mehr als 50 Zeichen lang sein');
          cy.contains('Dieses Feld darf nicht mehr als 100 Zeichen lang sein');
          cy.contains('Dieses Feld darf nicht mehr als 400 Zeichen lang sein');

          cy.get('body').type('{esc}');

          // Test valid lengths
          cy.fillOptionalFields(0, {
            title: 'A'.repeat(50),
            allergens: 'A'.repeat(100),
            comment: 'A '.repeat(200),
          });

          // Should not show validation errors
          cy.get('body').should(
            'not.contain',
            'Dieses Feld darf nicht mehr als',
          );
        });
      },
    );
  });

  it('should validate form submission with mixed valid and invalid data', () => {
    // Setup user with fairteiler as owner (with test data)
    cy.setupUserWithFairteiler({ role: 'owner', withTestData: true }).then(
      () => {
        cy.visitContributionPage();
        cy.switchContributionMode('fast');

        cy.fixture('contributions').then((contributions) => {
          // Add valid contribution
          cy.addContributionRow();
          cy.fillContributionRow(0, contributions.validContributions[0]);

          // Add invalid contribution
          cy.addContributionRow();
          cy.fillContributionRow(1, {
            categoryId: '', // Invalid
            originId: '', // Invalid
          });

          // Try to submit
          cy.get('button[type="submit"]').click();

          // Should show validation errors for invalid row
          cy.verifyValidationError('category-select-1');
          cy.verifyValidationError('origin-select-1');
          cy.verifyValidationError('quantity-incrementer-1');

          // Fix the invalid row
          cy.fillContributionRow(1, contributions.validContributions[1]);

          // Should now be able to submit
          cy.get('button[type="submit"]').should('not.be.disabled');
          cy.submitContributions();

          // Should redirect or show success
          cy.url({ timeout: 10000 }).should('include', '/success');
        });
      },
    );
  });

  it('should persist data when switching between modes', () => {
    // Setup user with fairteiler as owner (with test data)
    cy.setupUserWithFairteiler({ role: 'owner', withTestData: true }).then(
      () => {
        cy.visitContributionPage();
        cy.switchContributionMode('fast');

        cy.fixture('contributions').then((contributions) => {
          const testContrib = contributions.fastModeContributions[0];

          // Add and fill contribution in fastmode
          cy.addContributionRow();
          cy.fillContributionRow(0, testContrib);

          // Switch to wizard mode
          cy.switchContributionMode('wizard');

          // Data should still be there
          cy.verifyContributionInTable(testContrib, 0);

          // Switch back to fastmode
          cy.switchContributionMode('fast');

          // Data should still be there
          cy.verifyContributionInTable(testContrib, 0);
        });
      },
    );
  });
});
