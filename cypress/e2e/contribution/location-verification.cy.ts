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

              return cy.wrap({ fairteiler, foodsaver });
            }),
        ),
      );
  }

  function fillAndSubmitOneContribution() {
    cy.switchContributionMode('fast');
    cy.fixture('contributions').then((contributions) => {
      cy.addContributionRow();
      cy.fillContributionRow(0, contributions.fastModeContributions[0]);
      cy.get('button[type="submit"]').contains('Absenden').click();
    });
  }

  it('accepts a contribution from a foodsaver standing at the fairteiler', () => {
    openUserContributionPage(FAIRTEILER_LOCATION).then(
      ({ fairteiler, foodsaver }) => {
        fillAndSubmitOneContribution();

        cy.url({ timeout: 15000 }).should(
          'include',
          '/hub/user/contribution/success',
        );
        cy.task('getCheckinsByFairteiler', fairteiler.id).then((checkins) => {
          expect(checkins as LocatedCheckin[]).to.have.length(1);
          expect((checkins as LocatedCheckin[])[0].userId).to.equal(
            foodsaver.id,
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
