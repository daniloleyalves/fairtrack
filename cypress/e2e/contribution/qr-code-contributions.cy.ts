/// <reference types="cypress" />

type Checkin = { userId: string };

const SCAN_COOKIE = 'fairtrack_qr_scan';

function expectPathAfterSubmit(path: string) {
  cy.get('body', { timeout: 15000 }).should(($body) => {
    const current = $body[0].ownerDocument.location.pathname;
    if (!current.includes(path)) {
      const toasts = $body.find('[data-sonner-toast]').text();
      const invalid = $body
        .find('[aria-invalid="true"]')
        .map((_, el) => el.getAttribute('data-cy') ?? el.getAttribute('name'))
        .get()
        .join(', ');
      throw new Error(
        `Expected ${path} after submitting, still on ${current}. Toasts: "${toasts}". Invalid fields: "${invalid}".`,
      );
    }
  });
}

describe('QR Code Contribution Flow E2E', () => {
  beforeEach(() => {
    cy.cleanDatabase();
    cy.seedBasicTestData();
  });

  function fillAndSubmitOneContribution(expectedPath: string) {
    cy.contains('Retteformular').should('be.visible');
    // Fast mode comes from the test user's preferences once they load.
    cy.get('button[id="tableView-mode"]').should(
      'have.attr',
      'data-state',
      'checked',
    );
    cy.fixture('contributions').then((contributions) => {
      cy.addContributionRow();
      cy.get('[data-cy^="quantity-incrementer-"]').its('length').as('rowCount');
      cy.get<number>('@rowCount').then((rowCount) => {
        for (let index = 0; index < rowCount; index++) {
          cy.fillContributionRow(
            index,
            contributions.fastModeContributions[0],
            { blur: true },
          );
        }
      });
      cy.get('button[type="submit"]').contains('Absenden').click();
    });
    expectPathAfterSubmit(expectedPath);
  }

  it('lets a visitor contribute through the guest access view after scanning', () => {
    const slug = `qr-fairteiler-${Date.now()}`;

    cy.createTestFairteiler({ name: 'QR Fairteiler', slug }, true).then(
      (fairteiler) => {
        cy.createTestUser({
          email: `guest-1@${slug}.local`,
          firstName: 'Gast',
          lastName: 'Zugang',
          password: 'SecurePass123',
          isFirstLogin: false,
          isAnonymous: false,
        }).then((guest) => {
          cy.task('addUserToFairteiler', {
            userId: guest.id,
            fairteilerId: fairteiler.id,
            role: 'guest',
          });
          cy.task('createTestQrCode', {
            fairteilerId: fairteiler.id,
            guestAccessViewId: guest.id,
          }).then((qrCode) => {
            const { token } = qrCode as { token: string };

            cy.clearCookies();
            cy.visit(`/q/${token}`);
            cy.getCookie(SCAN_COOKIE).should('exist');

            cy.url().should('match', /\/scan$/);
            cy.contains('QR Fairteiler').should('be.visible');
            cy.contains('Mit meinem Konto beitragen').should('be.visible');
            cy.contains('a', 'Als Gast fortfahren').click();

            cy.url().should('include', '/scan/gast');
            cy.getCookie(SCAN_COOKIE).should('exist');
            fillAndSubmitOneContribution('/scan/danke');
            cy.contains('Super!').should('be.visible');

            cy.task('getCheckinsByFairteiler', fairteiler.id).then(
              (checkins) => {
                cy.get<number>('@rowCount').then((rowCount) => {
                  expect(checkins as Checkin[]).to.have.length(rowCount);
                });
                (checkins as Checkin[]).forEach((checkin) =>
                  expect(checkin.userId).to.equal(guest.id),
                );
              },
            );
          });
        });
      },
    );
  });

  it('lets a foodsaver sign in after scanning and records the contribution as scanned', () => {
    const slug = `qr-fairteiler-${Date.now()}`;

    cy.createTestFairteiler({ name: 'QR Fairteiler', slug }, true).then(
      (fairteiler) => {
        cy.fixture('users').then(({ existingUser }) => {
          cy.createTestUser({ ...existingUser, isFirstLogin: false }).then(
            (foodsaver) => {
              cy.task('createTestUserPreferences', foodsaver.id);
              cy.task('createTestQrCode', {
                fairteilerId: fairteiler.id,
              }).then((qrCode) => {
                const { token } = qrCode as { token: string };

                cy.clearCookies();
                cy.visit(`/q/${token}`);
                cy.getCookie(SCAN_COOKIE).should('exist');

                cy.contains('Als Gast fortfahren').should('not.exist');
                cy.get('a[href^="/sign-in?callbackUrl"]').click();
                cy.fillTwoStepLoginForm({
                  email: existingUser.email,
                  password: existingUser.password,
                });

                cy.url({ timeout: 15000 }).should(
                  'include',
                  `/hub/user/contribution?fairteilerSlug=${slug}`,
                );
                cy.getCookie(SCAN_COOKIE).should('exist');
                cy.contains('QR-Code gescannt').should('be.visible');
                fillAndSubmitOneContribution('/hub/user/contribution/success');

                cy.task('getCheckinsByFairteiler', fairteiler.id).then(
                  (checkins) => {
                    cy.get<number>('@rowCount').then((rowCount) => {
                      expect(checkins as Checkin[]).to.have.length(rowCount);
                    });
                    (checkins as Checkin[]).forEach((checkin) =>
                      expect(checkin.userId).to.equal(foodsaver.id),
                    );
                  },
                );
              });
            },
          );
        });
      },
    );
  });

  it('shows an error for an unknown code', () => {
    cy.clearCookies();
    cy.visit('/q/does-not-exist');

    cy.url().should('include', '/scan?fehler=ungueltig');
    cy.contains('QR-Code nicht gültig').should('be.visible');
  });
});
