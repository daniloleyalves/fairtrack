/// <reference types="cypress" />

describe('Contribution History E2E', () => {
  beforeEach(() => {
    cy.cleanDatabase();
    cy.seedBasicTestData();
  });

  const openRowActionsMenu = () => {
    cy.get('table tbody tr').first().find('td').last().find('button').click();
  };

  it('should display contributions in the history table', () => {
    cy.setupUserWithFairteiler({ role: 'owner', withTestData: true }).then(
      ({ user, fairteiler }) => {
        cy.createTestContribution({
          fairteilerId: fairteiler.id,
          userId: user.id,
          title: 'Bananen',
          quantity: 5,
        });

        cy.navigateToHistory();

        cy.contains('Lebensmittelabgaben-Verlauf').should('be.visible');
        cy.contains('Bananen').should('be.visible');
        cy.contains('Supermarkt').should('be.visible');
      },
    );
  });

  it('should show an empty version history before any edit', () => {
    cy.setupUserWithFairteiler({ role: 'owner', withTestData: true }).then(
      ({ user, fairteiler }) => {
        cy.createTestContribution({
          fairteilerId: fairteiler.id,
          userId: user.id,
          title: 'Bananen',
          quantity: 5,
        });

        cy.navigateToHistory();
        cy.contains('Bananen').should('be.visible');

        openRowActionsMenu();
        cy.get('[role="menuitem"]').contains('Versionsverlauf').click();

        cy.contains('Es wurden keine Änderungen vorgenommen').should(
          'be.visible',
        );
      },
    );
  });

  it('should edit a contribution quantity and record a version history entry', () => {
    cy.setupUserWithFairteiler({ role: 'owner', withTestData: true }).then(
      ({ user, fairteiler }) => {
        cy.createTestContribution({
          fairteilerId: fairteiler.id,
          userId: user.id,
          title: 'Bananen',
          quantity: 5,
        });

        cy.navigateToHistory();
        cy.contains('Bananen').should('be.visible');

        // Edit the quantity via the row actions menu
        openRowActionsMenu();
        cy.get('[role="menuitem"]').contains('Bearbeiten').click();

        cy.contains('Neue Menge (Kilogramm)').should('be.visible');
        cy.get('[role="dialog"] input[name="quantity"]').clear().type('7');
        cy.contains('button', 'Änderungen speichern').click();

        cy.contains('Beitrag erfolgreich bearbeitet.').should('be.visible');
        cy.get('[role="dialog"]').should('not.exist');

        // The table reflects the new quantity
        cy.get('table tbody tr').first().should('contain', '7');

        // The change is versioned
        openRowActionsMenu();
        cy.get('[role="menuitem"]').contains('Versionsverlauf').click();
        cy.contains('von 5 auf 7 geändert').should('be.visible');
      },
    );
  });
});
