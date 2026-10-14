/// <reference types="cypress" />

type LocatedCheckin = { userId: string };

const FAIRTEILER_LOCATION = { latitude: 52.52, longitude: 13.405 };

function stubLocation(
  win: Cypress.AUTWindow,
  coords: { latitude: number; longitude: number },
) {
  const position = {
    coords: { ...coords, accuracy: 5 },
    timestamp: Date.now(),
  } as GeolocationPosition;
  cy.stub(win.navigator.geolocation, 'watchPosition').callsFake(
    (success: PositionCallback) => {
      success(position);
      return 1;
    },
  );
  cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake(
    (success: PositionCallback) => success(position),
  );
  cy.stub(win.navigator.geolocation, 'clearWatch');
}

function expectSuccessPage(path = '/hub/user/contribution/success') {
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

describe('Location Verified Contribution E2E', () => {
  beforeEach(() => {
    cy.cleanDatabase();
    cy.seedBasicTestData();
  });

  function openUserContributionPage(coords: {
    latitude: number;
    longitude: number;
  }) {
    const slug = `location-fairteiler-${Date.now()}`;
    const contributionPath = `/hub/user/contribution?fairteilerSlug=${slug}`;

    return cy
      .createTestFairteiler(
        {
          name: 'Standort Fairteiler',
          slug,
          geoLat: String(FAIRTEILER_LOCATION.latitude),
          geoLng: String(FAIRTEILER_LOCATION.longitude),
        },
        true,
      )
      .then((fairteiler) =>
        cy.fixture('users').then(({ existingUser }) =>
          cy
            .createTestUser({ ...existingUser, isFirstLogin: false })
            .then((foodsaver) => {
              cy.task('createTestUserPreferences', foodsaver.id);
              cy.visit(
                `/sign-in?callbackUrl=${encodeURIComponent(contributionPath)}`,
              );
              cy.fillTwoStepLoginForm({
                email: existingUser.email,
                password: existingUser.password,
              });
              cy.url({ timeout: 15000 }).should('include', contributionPath);

              cy.visit(contributionPath, {
                onBeforeLoad: (win) => stubLocation(win, coords),
              });
              cy.contains('Retteformular').should('be.visible');
              // The not-at-fairteiler notice shifts the form once the location
              // resolves, so wait for it before clicking anything.
              cy.contains(/Standort OK|Zu weit entfernt/).should('be.visible');

              return cy.wrap({ fairteiler, foodsaver });
            }),
        ),
      );
  }

  function fillAndSubmitOneContribution() {
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
  }

  it('accepts a contribution from a foodsaver standing at the fairteiler', () => {
    openUserContributionPage(FAIRTEILER_LOCATION).then(
      ({ fairteiler, foodsaver }) => {
        fillAndSubmitOneContribution();
        expectSuccessPage();
        cy.task('getCheckinsByFairteiler', fairteiler.id).then((checkins) => {
          cy.get<number>('@rowCount').then((rowCount) => {
            expect(checkins as LocatedCheckin[]).to.have.length(rowCount);
          });
          (checkins as LocatedCheckin[]).forEach((checkin) =>
            expect(checkin.userId).to.equal(foodsaver.id),
          );
        });
      },
    );
  });

  it('rejects a contribution from a foodsaver away from the fairteiler', () => {
    openUserContributionPage({ latitude: 48.7758, longitude: 9.1829 }).then(
      ({ fairteiler }) => {
        fillAndSubmitOneContribution();

        cy.contains('Wir konnten nicht bestätigen', { timeout: 15000 }).should(
          'be.visible',
        );
        cy.url().should('not.include', '/success');
        cy.task('getCheckinsByFairteiler', fairteiler.id).then((checkins) => {
          expect(checkins as LocatedCheckin[]).to.have.length(0);
        });
      },
    );
  });
});
