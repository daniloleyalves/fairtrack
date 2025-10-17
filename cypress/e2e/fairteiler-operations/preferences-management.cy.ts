/// <reference types="cypress" />

describe('Preferences Management E2E', () => {
  beforeEach(() => {
    cy.cleanDatabase();
    cy.seedBasicTestData();
  });
  it('should successfully navigate to preferences page and display all sections', () => {
    // Setup user with fairteiler as owner
    cy.setupUserWithFairteiler({ role: 'owner' }).then(() => {
      // Navigate to preferences page
      cy.navigateToPreferences();

      // Verify page elements
      cy.contains('Präferenzen').should('be.visible');

      // Verify all three preference sections are visible
      cy.contains('Herkünfte').should('be.visible');
      cy.contains('Kategorien').should('be.visible');
      cy.contains('Betriebe').should('be.visible');

      // Verify the grid layout is working
      cy.get('div').should('have.class', 'grid');
    });
  });

  it('should successfully add and remove origin preferences', () => {
    // Setup user with fairteiler as owner
    cy.setupUserWithFairteiler({ role: 'owner' }).then(() => {
      // Navigate to preferences page
      cy.navigateToPreferences();

      // Wait for content to load
      cy.contains('Herkünfte').should('be.visible');

      // Find and add an origin from available options
      cy.get('[aria-label="Add Supermarkt"]').click();
      // Remove the added origin
      cy.get('[aria-label="Remove Supermarkt"]').click();

      // Confirm removal
      cy.contains('Herkunft entfernen').should('be.visible');
      cy.get('button').contains('Entfernen').click();
    });
  });

  it('should successfully add and remove category preferences', () => {
    // Setup user with fairteiler as owner
    cy.setupUserWithFairteiler({ role: 'owner' }).then(() => {
      // Navigate to preferences page
      cy.navigateToPreferences();

      // Wait for content to load
      cy.contains('Kategorien').should('be.visible');

      //  Find and add an category from available options
      cy.get('[aria-label="Add Backwaren"]').click();
      // Remove the added category
      cy.get('[aria-label="Remove Backwaren"]').click();

      // Confirm removal
      cy.contains('Kategorie entfernen').should('be.visible');
      cy.get('button').contains('Entfernen').click();
    });
  });

  it('should successfully add and remove company preferences', () => {
    // Setup user with fairteiler as owner
    cy.setupUserWithFairteiler({ role: 'owner' }).then(() => {
      // Navigate to preferences page
      cy.navigateToPreferences();

      // Wait for content to load
      cy.contains('Betriebe').should('be.visible');

      //  Find and add an company from available options
      cy.get('[aria-label="Add Edeka"]').click();
      // Remove the added company
      cy.get('[aria-label="Remove Edeka"]').click();

      // Confirm removal
      cy.contains('Betrieb entfernen').should('be.visible');
      cy.get('button').contains('Entfernen').click();
    });
  });

  it('should successfully suggest new origin', () => {
    // Setup user with fairteiler as owner
    cy.setupUserWithFairteiler({ role: 'owner' }).then(() => {
      // Navigate to preferences page
      cy.navigateToPreferences();

      // Wait for content to load
      cy.contains('Herkünfte').should('be.visible');

      cy.get('[aria-label="Suggest new origin"]').should('be.disabled');

      // Find the suggest new origin section
      cy.contains('Herkunft vorschlagen')
        .parent()
        .parent()
        .within(() => {
          // Look for input field to suggest new origin
          cy.get('input').type('Test Origin Suggestion');

          // Submit suggestion
          cy.get('[aria-label="Suggest new origin"]').click();
        });

      cy.contains('Test Origin Suggestion').should('be.visible');
    });
  });

  it('should successfully suggest new category', () => {
    // Setup user with fairteiler as owner
    cy.setupUserWithFairteiler({ role: 'owner' }).then(() => {
      // Navigate to preferences page
      cy.navigateToPreferences();

      // Wait for content to load
      cy.contains('Kategorien').should('be.visible');

      cy.get('[aria-label="Suggest new category"]').should('be.disabled');

      // Find the suggest new category section
      cy.contains('Kategorie vorschlagen')
        .parent()
        .parent()
        .within(() => {
          // Look for input field to suggest new category
          cy.get('input').type('Test Category Suggestion');

          // Submit suggestion
          cy.get('[aria-label="Suggest new category"]').click();
        });

      cy.contains('Test Category Suggestion').should('be.visible');
    });
  });

  it('should successfully suggest new company', () => {
    // Setup user with fairteiler as owner
    cy.setupUserWithFairteiler({ role: 'owner' }).then(() => {
      // Navigate to preferences page
      cy.navigateToPreferences();

      // Wait for content to load
      cy.contains('Betriebe').should('be.visible');

      cy.get('[aria-label="Suggest new company"]').should('be.disabled');

      // Find the suggest new company section
      cy.contains('Betrieb vorschlagen')
        .parent()
        .parent()
        .within(() => {
          // Look for input field to suggest new company
          cy.get('input').type('Test Company Suggestion');

          // Submit suggestion
          cy.get('[aria-label="Suggest new company"]').click();
        });

      cy.contains('Test Company Suggestion').should('be.visible');
    });
  });

  it('should prevent non-owners from managing preferences', () => {
    // Setup user with fairteiler as member (not owner)
    cy.setupUserWithFairteiler({ role: 'employee' }).then(() => {
      // Navigate to preferences page
      cy.navigateToPreferences();

      // Wait for content to load
      cy.contains('Herkünfte').should('be.visible');

      // Intercept to spy on the actual API call
      cy.intercept('POST', '**/hub/fairteiler/preferences**').as('addCompany');

      // Attempt to add a company from available options
      cy.get('[aria-label="Add Supermarkt"]').click();

      // Verify that the request failed
      cy.wait('@addCompany').then((interception) => {
        expect(interception.response).to.exist;
        expect(interception.response!.statusCode).to.be.equal(500);
      });
    });
  });
});
