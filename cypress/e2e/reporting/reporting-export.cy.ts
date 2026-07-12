/// <reference types="cypress" />

describe('Reporting & Export E2E', () => {
  beforeEach(() => {
    cy.cleanDatabase();
    cy.seedBasicTestData();
  });

  describe('Fairteiler Reporting', () => {
    it('should display the statistics dashboard with an export button', () => {
      cy.setupUserWithFairteiler({ role: 'owner', withTestData: true }).then(
        ({ user, fairteiler }) => {
          cy.createTestContribution({
            fairteilerId: fairteiler.id,
            userId: user.id,
            title: 'Bananen',
            quantity: 5,
          });

          cy.navigateToReporting();

          cy.contains('Statistiken').should('be.visible');
          cy.contains('Filter:').should('be.visible');
          cy.contains('button', 'Excel Export').should('be.visible');
        },
      );
    });

    it('should surface the server error message in a toast when there is nothing to export', () => {
      cy.setupUserWithFairteiler({ role: 'owner', withTestData: true }).then(
        () => {
          cy.navigateToReporting();

          cy.contains('button', 'Excel Export').should('be.visible').click();

          // Server rejects the empty export; the action's error message must
          // reach the toast instead of a generic fallback.
          cy.contains('No contributions found for export').should('be.visible');
        },
      );
    });

    it('should export contributions and confirm with a success toast', () => {
      cy.setupUserWithFairteiler({ role: 'owner', withTestData: true }).then(
        ({ user, fairteiler }) => {
          cy.createTestContribution({
            fairteilerId: fairteiler.id,
            userId: user.id,
            title: 'Bananen',
            quantity: 5,
          });

          cy.navigateToReporting();

          cy.contains('button', 'Excel Export').should('be.visible').click();

          cy.contains(
            'Fairteiler Excel-Export erfolgreich heruntergeladen!',
          ).should('be.visible');
        },
      );
    });
  });

  describe('Platform Reporting', () => {
    it('should hide the platform export button from non-admins', () => {
      cy.setupUserWithFairteiler({ role: 'owner', withTestData: true }).then(
        ({ user, fairteiler }) => {
          cy.createTestContribution({
            fairteilerId: fairteiler.id,
            userId: user.id,
          });

          cy.navigateToPlatformReporting();

          cy.contains('Platform-Statistiken').should('be.visible');
          // Wait for the dashboard (not the skeleton) before asserting absence
          cy.contains('Filter:').should('be.visible');
          cy.contains('button', 'Plattform Excel Export').should('not.exist');
        },
      );
    });

    it('should show the platform export button to platform admins and export successfully', () => {
      cy.setupUserWithFairteiler({
        userData: { role: 'admin' },
        role: 'owner',
        withTestData: true,
      }).then(({ user, fairteiler }) => {
        cy.createTestContribution({
          fairteilerId: fairteiler.id,
          userId: user.id,
          title: 'Bananen',
          quantity: 5,
        });

        cy.navigateToPlatformReporting();

        cy.contains('button', 'Plattform Excel Export')
          .should('be.visible')
          .click();

        cy.contains(
          'Plattform Excel-Export erfolgreich heruntergeladen!',
        ).should('be.visible');
      });
    });
  });
});
