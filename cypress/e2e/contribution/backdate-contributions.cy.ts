/// <reference types="cypress" />

type BackdatedCheckin = { createdAt: string };

const pad = (value: number) => String(value).padStart(2, '0');

describe('Backdated Contribution E2E', () => {
  beforeEach(() => {
    cy.cleanDatabase();
    cy.seedBasicTestData();
  });

  it('records a contribution on an earlier day and shows it on the success page and in the history', () => {
    cy.setupUserWithFairteiler({ role: 'owner', withTestData: true }).then(
      ({ fairteiler }) => {
        cy.visitContributionPage();
        cy.switchContributionMode('fast');

        cy.window().then((win) => {
          const today = new win.Date();
          const target = new win.Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - 3,
          );
          const isoDay = `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}`;
          const displayDay = `${pad(target.getDate())}.${pad(target.getMonth() + 1)}.${target.getFullYear()}`;

          cy.get('button:has(svg.lucide-calendar-days)')
            .should('contain', 'Heute')
            .click();
          cy.contains('Abgabedatum').should('be.visible');
          if (target.getMonth() !== today.getMonth()) {
            cy.get('.rdp-button_previous').click();
          }
          cy.get(`button[data-day="${target.toLocaleDateString()}"]`).click();
          cy.get('button:has(svg.lucide-calendar-days)').should(
            'contain',
            displayDay,
          );

          cy.fixture('contributions').then((contributions) => {
            cy.addContributionRow();
            cy.fillContributionRow(0, contributions.fastModeContributions[0]);
            cy.submitContributions();
          });

          cy.url({ timeout: 15000 }).should(
            'include',
            '/hub/fairteiler/contribution/success',
          );
          cy.contains('Super!').should('be.visible');
          cy.contains('Achtung!').should('not.exist');

          cy.task('getCheckinsByFairteiler', fairteiler.id).then((checkins) => {
            expect(checkins as BackdatedCheckin[]).to.have.length(1);
            expect(
              new Date(
                (checkins as BackdatedCheckin[])[0].createdAt,
              ).toISOString(),
            ).to.equal(`${isoDay}T12:00:00.000Z`);
          });

          cy.visit('/hub/fairteiler/history');
          cy.contains('Lebensmittelabgaben-Verlauf').should('be.visible');
          cy.get('table tbody tr')
            .should('have.length', 1)
            .first()
            .should('contain', displayDay);
        });
      },
    );
  });

  it('keeps today as the contribution date when no day is picked', () => {
    cy.setupUserWithFairteiler({ role: 'owner', withTestData: true }).then(
      ({ fairteiler }) => {
        cy.visitContributionPage();
        cy.switchContributionMode('fast');

        cy.fixture('contributions').then((contributions) => {
          cy.addContributionRow();
          cy.fillContributionRow(0, contributions.fastModeContributions[0]);
          cy.submitContributions();
        });

        cy.url({ timeout: 15000 }).should('include', '/success');

        cy.task('getCheckinsByFairteiler', fairteiler.id).then((checkins) => {
          expect(checkins as BackdatedCheckin[]).to.have.length(1);
          const createdAt = new Date(
            (checkins as BackdatedCheckin[])[0].createdAt,
          );
          expect(Date.now() - createdAt.getTime()).to.be.lessThan(
            5 * 60 * 1000,
          );
        });
      },
    );
  });
});
