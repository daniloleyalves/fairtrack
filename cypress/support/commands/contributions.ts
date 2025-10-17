/// <reference types="cypress" />

import type { ContributionItem } from '../../../src/features/contribution/models/contribution';

// ============================================================================
// CONTRIBUTION COMMAND TYPES
// ============================================================================

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Navigate to the contribution page and wait for it to load
       */
      visitContributionPage(): Chainable<void>;

      /**
       * Switch between fastmode and wizard mode
       */
      switchContributionMode(mode: 'fast' | 'wizard'): Chainable<void>;

      /**
       * Fill a contribution row in fastmode
       */
      fillContributionRow(
        index: number,
        data: Partial<ContributionItem>,
      ): Chainable<void>;

      /**
       * Add a new contribution row in fastmode
       */
      addContributionRow(): Chainable<void>;

      /**
       * Remove a contribution row
       */
      removeContributionRow(index: number): Chainable<void>;

      /**
       * Open the contribution wizard
       */
      openContributionWizard(): Chainable<void>;

      /**
       * Complete wizard step by step
       */
      completeWizardFlow(data: {
        originName: string;
        companyName: string;
        customCompany?: string;
        contributions: Array<{
          categoryId: string;
          quantity: number;
          shelfLife?: Date | null;
        }>;
      }): Chainable<void>;

      /**
       * Select option in wizard
       */
      selectWizardOption(optionName: string): Chainable<void>;

      /**
       * Select origin in wizard
       */
      selectWizardOrigin(originName: string): Chainable<void>;

      /**
       * Select company in wizard
       */
      selectWizardCompany(companyName: string): Chainable<void>;

      /**
       * Select category in wizard and fill details
       */
      selectWizardCategory(
        categoryId: string,
        quantity: number,
        shelfLife?: Date | null,
      ): Chainable<void>;

      /**
       * Save wizard contributions
       */
      saveWizardContributions(): Chainable<void>;

      /**
       * Verify contribution appears in table
       */
      verifyContributionInTable(
        contribution: Partial<ContributionItem>,
        index?: number,
      ): Chainable<void>;

      /**
       * Submit the contribution form
       */
      submitContributions(): Chainable<void>;

      /**
       * Fill optional fields for a contribution
       */
      fillOptionalFields(
        index: number,
        data: {
          title?: string;
          allergens?: string;
          comment?: string;
          cool?: boolean;
        },
      ): Chainable<void>;

      /**
       * Verify form validation errors
       */
      verifyValidationError(message: string): Chainable<void>;
    }
  }
}

// ============================================================================
// CONTRIBUTION COMMAND IMPLEMENTATIONS
// ============================================================================

// Navigate to contribution page
Cypress.Commands.add('visitContributionPage', () => {
  cy.url({ timeout: 15000 }).should('include', '/hub/fairteiler/dashboard');

  cy.visit('/hub/fairteiler/contribution');
  // Look for contribution section or navigate to it
  cy.contains('Retteformular').should('be.visible');
});

// Switch between fastmode and wizard mode
Cypress.Commands.add('switchContributionMode', (mode: 'fast' | 'wizard') => {
  const shouldBeFastMode = mode === 'fast';

  // Get the switch element and its current data-state
  cy.get('button[id="tableView-mode"]')
    .as('contributionModeSwitch')
    .then(($switch) => {
      const isCurrentlyFastMode = $switch.attr('data-state') === 'checked';

      // Click only if the current state doesn't match the desired state
      if (isCurrentlyFastMode !== shouldBeFastMode) {
        cy.get('@contributionModeSwitch').click();
        // OR: cy.get('label[for="tableView-mode"]').click(); // If a label controls it
      }
    });

  // Verify the mode switched using the data-state attribute
  cy.get('@contributionModeSwitch').should(
    'have.attr',
    'data-state',
    shouldBeFastMode ? 'checked' : 'unchecked',
  );
});

// Add new contribution row
Cypress.Commands.add('addContributionRow', () => {
  cy.get('button:has(svg.lucide-plus)').should('be.visible').click();

  // Wait for the new row to appear
  cy.get('table tbody tr').should('have.length.at.least', 1);
});

// Fill contribution row in fastmode
Cypress.Commands.add(
  'fillContributionRow',
  (index: number, data: Partial<ContributionItem>) => {
    // Fill category
    if (data.categoryId) {
      cy.get(`[data-cy="category-select-${index}"]`).click();
      cy.get('div[role="option"]').first().click();
      cy.get('body').click();
    }

    // Fill origin
    if (data.originId) {
      cy.get(`[data-cy="origin-select-${index}"]`).click();
      cy.get('div[role="option"]').first().click();
      cy.get('body').click();
    }

    // // Fill company
    if (data.companyId) {
      cy.get(`[data-cy="company-select-${index}"]`).click();
      cy.get('div[role="option"]').first().click();
      cy.get('body').click();
    }

    // Fill quantity
    if (data.quantity !== undefined) {
      cy.get(`[data-cy="quantity-incrementer-${index}"]`).type(
        data.quantity.toString(),
      );
      cy.get('body').click();
    }
  },
);

// Remove contribution row
Cypress.Commands.add('removeContributionRow', (index: number) => {
  const rowSelector = `table tbody tr:nth-child(${index + 1})`;

  // Click the actions menu
  cy.get(`${rowSelector} td:last-child`)
    .find('button[aria-label*="Aktionsmenü"], button')
    .first()
    .click();

  // Click remove option
  cy.get('[role="menuitem"]').contains('Entfernen').click();
});

// Open contribution wizard
Cypress.Commands.add('openContributionWizard', () => {
  // Make sure we're in wizard mode first
  cy.switchContributionMode('wizard');

  // Click the plus button to open wizard
  cy.get('button:has(svg.lucide-plus)').should('be.visible').click();

  // Verify wizard modal opened
  cy.get('[role="dialog"]').should('be.visible');
  cy.contains('Herkunft').should('be.visible');
});

// Select option in wizard
Cypress.Commands.add('selectWizardOption', (optionName: string) => {
  // Find and click the option
  cy.get('label').contains(optionName).click();
  cy.wait(300);
});

// Alias for selectWizardOption for origin selection
Cypress.Commands.add('selectWizardOrigin', (originName: string) => {
  cy.selectWizardOption(originName);
});

// Alias for selectWizardOption for company selection
Cypress.Commands.add('selectWizardCompany', (companyName: string) => {
  cy.selectWizardOption(companyName);
});

// Select category and fill details in wizard
Cypress.Commands.add(
  'selectWizardCategory',
  (categoryId: string, quantity: number, shelfLife?: Date | null) => {
    // Load fixture and find the category name
    cy.fixture('contributions').then((contributions) => {
      const categories = contributions.testCategories;
      const category = categories.find(
        (c: { id: string; name: string }) => c.id === categoryId,
      );

      if (!category) {
        throw new Error(`Category with id "${categoryId}" not found`);
      }

      const categoryName = category.name;

      // Click on the category
      cy.get('label').contains(categoryName).click();

      // Fill quantity in the details modal
      cy.get('input[name="quantity"]').clear().type(quantity.toString());

      // Fill shelf life if provided
      if (shelfLife !== undefined) {
        const days = shelfLife
          ? Math.ceil(
              (new Date(shelfLife).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24),
            )
          : 0;

        cy.get('input[name="shelfLife"]').clear().type(days.toString());
      }

      // Save the contribution details
      cy.get('button').contains('Okay').click();
    });
  },
);

// Save wizard contributions
Cypress.Commands.add('saveWizardContributions', () => {
  cy.get('button').contains('Weiter').click();

  cy.get('button').contains('Speichern').click();

  // Wait for modal to close
  cy.get('[role="dialog"]').should('not.exist');
});

// Complete entire wizard flow
Cypress.Commands.add('completeWizardFlow', (data) => {
  cy.openContributionWizard();

  // Step 1: Select origin
  cy.selectWizardOption(data.originName);

  // Step 2: Select company
  cy.selectWizardOption(data.companyName);

  // Step 3: Select categories and fill details
  data.contributions.forEach((contrib) => {
    cy.selectWizardCategory(
      contrib.categoryId,
      contrib.quantity,
      contrib.shelfLife,
    );
    cy.wait(100);
  });

  // Step 4: Save
  cy.saveWizardContributions();
});

// Verify contribution in table (TODO, check for proper fields)
Cypress.Commands.add(
  'verifyContributionInTable',
  (contribution: Partial<ContributionItem>, index = 0) => {
    const rowSelector = `table tbody tr:nth-child(${index + 1})`;

    if (contribution.quantity !== undefined) {
      cy.get(rowSelector).should('be.visible');
    }
  },
);

// Submit contributions
Cypress.Commands.add('submitContributions', () => {
  cy.get('button[type="submit"]').contains('Absenden').click();

  // Wait for submission to complete
  cy.get('button[type="submit"]').should('not.be.disabled');
});

// Fill optional fields
Cypress.Commands.add(
  'fillOptionalFields',
  (
    index: number,
    data: {
      title?: string;
      allergens?: string;
      comment?: string;
      cool?: boolean;
    },
  ) => {
    const rowSelector = `table tbody tr:nth-child(${index + 1})`;

    // Open actions menu
    cy.get(`${rowSelector} td:last-child`).find('button').first().click();

    // Click optional fields
    cy.get('[role="menuitem"]').contains('Optionale Infos').click();

    // Fill fields in modal

    if (data.title) {
      cy.get('input[name*="title"], textarea[name*="title"]')
        .clear()
        .type(data.title);
    }

    if (data.allergens) {
      cy.get('input[name*="allergens"], textarea[name*="allergens"]')
        .clear()
        .type(data.allergens);
    }

    if (data.comment) {
      cy.get('input[name*="comment"], textarea[name*="comment"]')
        .clear()
        .type(data.comment);
    }

    if (data.cool !== undefined) {
      const coolSwitch = cy.get('input[name*="cool"]');
      if (data.cool) {
        coolSwitch.check();
      } else {
        coolSwitch.uncheck();
      }
    }
  },
);

// Verify validation error
Cypress.Commands.add('verifyValidationError', (cySelector: string) => {
  cy.get(`[data-cy="${cySelector}"]`).should(
    'have.attr',
    'aria-invalid',
    'true',
  );
});

export {};
