/// <reference types="cypress" />

type Checkin = { userId: string; verifiedVia: string | null };

describe('QR Code Contribution Flow E2E', () => {
  beforeEach(() => {
    cy.cleanDatabase();
    cy.seedBasicTestData();
  });

  function fillAndSubmitOneContribution() {
    cy.contains('Retteformular').should('be.visible');
    cy.switchContributionMode('fast');
    cy.fixture('contributions').then((contributions) => {
      cy.addContributionRow();
      cy.fillContributionRow(0, contributions.fastModeContributions[0]);
      cy.submitContributions();
    });
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

            cy.url().should('match', /\/scan$/);
            cy.contains('QR Fairteiler').should('be.visible');
            cy.contains('Mit meinem Konto beitragen').should('be.visible');
            cy.contains('a', 'Als Gast fortfahren').click();

            cy.url().should('include', '/scan/gast');
            fillAndSubmitOneContribution();

            cy.url({ timeout: 15000 }).should('include', '/scan/danke');
            cy.contains('Danke fürs Retten!').should('be.visible');

            cy.task('getCheckinsByFairteiler', fairteiler.id).then(
              (checkins) => {
                expect(checkins as Checkin[]).to.have.length(1);
                expect((checkins as Checkin[])[0].userId).to.equal(guest.id);
                expect((checkins as Checkin[])[0].verifiedVia).to.equal('qr');
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
              cy.task('createTestQrCode', {
                fairteilerId: fairteiler.id,
              }).then((qrCode) => {
                const { token } = qrCode as { token: string };

                cy.clearCookies();
                cy.visit(`/q/${token}`);

                // No guest access view is linked, so only own accounts.
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
                cy.contains('QR-Code gescannt').should('be.visible');
                fillAndSubmitOneContribution();

                cy.url({ timeout: 15000 }).should(
                  'include',
                  '/hub/user/contribution/success',
                );

                cy.task('getCheckinsByFairteiler', fairteiler.id).then(
                  (checkins) => {
                    expect(checkins as Checkin[]).to.have.length(1);
                    expect((checkins as Checkin[])[0].userId).to.equal(
                      foodsaver.id,
                    );
                    expect((checkins as Checkin[])[0].verifiedVia).to.equal(
                      'qr',
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
