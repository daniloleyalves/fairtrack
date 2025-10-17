/// <reference types="cypress" />

import type { UsersFixture } from '../../support/types';
import { isDatabaseFairteiler } from '../../support/types';

describe('Fairteiler Profile Edit E2E', () => {
  beforeEach(() => {
    cy.cleanDatabase();
  });
  it('should successfully edit fairteiler profile as owner', () => {
    // Setup user with fairteiler as owner
    cy.setupUserWithFairteiler({ role: 'owner' }).then(() => {
      // Navigate to profile page
      cy.navigateToProfile();

      // Verify page elements
      cy.contains('Fairteilerprofil').should('be.visible');
      cy.get('form').should('be.visible');

      // Verify current values are loaded
      cy.get('input[name="name"]').should('have.value', 'Test Fairteiler');

      // Edit profile information
      const updatedData = {
        name: 'Updated Fairteiler Name',
        address: 'Musterstraße 123, 12345 Berlin',
        website: 'https://updated-fairteiler.example.com',
        geoLink: 'https://maps.google.com/updated-location',
      };

      cy.get('input[name="name"]').clear().type(updatedData.name);
      cy.get('input[name="address"]').clear().type(updatedData.address);
      cy.get('input[name="website"]').clear().type(updatedData.website);
      cy.get('input[name="geoLink"]').clear().type(updatedData.geoLink);

      // Submit form
      cy.get('button[type="submit"]').click();

      // Verify success message or redirect
      cy.contains('Profil erfolgreich aktualisiert').should('be.visible', {
        timeout: 10000,
      });

      // Verify data persistence by reloading page
      cy.reload();
      cy.get('input[name="name"]').should('have.value', updatedData.name);
      cy.get('input[name="address"]').should('have.value', updatedData.address);
      cy.get('input[name="website"]').should('have.value', updatedData.website);
      cy.get('input[name="geoLink"]').should('have.value', updatedData.geoLink);

      // Database verification would happen here in a real test
      // For now, we rely on the form persistence check above
    });
  });

  it('should handle form validation errors', () => {
    // Setup user with fairteiler as owner
    cy.setupUserWithFairteiler({ role: 'owner' }).then(() => {
      // Navigate to profile page
      cy.navigateToProfile();

      // Clear required name field
      cy.get('input[name="name"]').clear();

      // Try to submit with invalid data
      cy.get('button[type="submit"]').click();

      // Should show validation error
      cy.contains('Bitte gib mindestens 2 Zeichen ein').should('be.visible');
    });
  });

  it('should handle image upload functionality', () => {
    // Setup user with fairteiler as owner
    cy.setupUserWithFairteiler({ role: 'owner' }).then(() => {
      // Navigate to profile page
      cy.navigateToProfile();

      // Create a test image file
      const fileName = 'test-image.jpg';
      cy.fixture('images/test-image.jpg', 'base64').then((fileContent) => {
        // Upload image
        cy.get('input[type="file"]').selectFile(
          {
            contents: Cypress.Buffer.from(fileContent, 'base64'),
            fileName: fileName,
            mimeType: 'image/jpeg',
          },
          { force: true },
        );

        // Verify image preview appears
        cy.get('img[alt*="Fairteiler Thumbnail"]').should('be.visible');

        // Submit form with image
        cy.get('button[type="submit"]').click();

        // Verify success
        cy.contains('Profil erfolgreich aktualisiert').should('be.visible', {
          timeout: 10000,
        });
      });
    });
  });

  it('should prevent non-owners from accessing profile edit', () => {
    // Setup user with fairteiler as member (not owner)
    cy.setupUserWithFairteiler({ role: 'member' }).then(() => {
      // Navigate to profile page
      cy.navigateToProfile();

      cy.get('input[name="name"]').clear().type('Updated Fairteiler Name');

      // Submit form
      cy.get('button[type="submit"]').click();

      // check for access denied message
      cy.contains('Du bist nicht befugt diese Aktion auszuführen').should(
        'be.visible',
      );
    });
  });

  // it('should handle server errors gracefully', () => {
  //   cy.fixture('users').then((users: UsersFixture) => {
  //     const { validUser } = users;

  //     cy.createTestUser({
  //       email: validUser.email,
  //       firstName: validUser.firstName,
  //       lastName: validUser.lastName || 'User',
  //       password: validUser.password,
  //     }).then((user) => {
  //       if (user) {
  //         cy.createTestFairteiler({
  //           name: 'Test Fairteiler',
  //           slug: 'test-fairteiler',
  //         }).then((fairteiler) => {
  //           if (isDatabaseFairteiler(fairteiler)) {
  //             cy.task('addUserToFairteiler', {
  //               userId: user.id,
  //               fairteilerId: fairteiler.id,
  //               role: 'owner',
  //             });

  //             cy.visit('/sign-in');
  //             cy.fillLoginForm({
  //               email: validUser.email,
  //               password: validUser.password,
  //             });

  //             // Navigate to profile page
  //             cy.url({ timeout: 15000 }).should(
  //               'include',
  //               '/hub/fairteiler/dashboard',
  //             );
  //             cy.visit('/hub/fairteiler/profile');

  //             // Intercept the update request to return error
  //             cy.intercept('POST', '**/profile', {
  //               statusCode: 500,
  //               body: { error: 'Server error' },
  //             });

  //             // Make a change and submit
  //             cy.get('input[name="name"]').clear().type('Updated Name');
  //             cy.get('button[type="submit"]').click();

  //             // Should show error message
  //             cy.contains('Fehler beim Aktualisieren').should('be.visible');
  //           }
  //         });
  //       }
  //     });
  //   });
  // });

  it('should reset form when navigating away and back', () => {
    cy.setupUserWithFairteiler({ role: 'owner' }).then(() => {
      // Navigate to profile page
      cy.navigateToProfile();

      // Make changes without saving
      cy.get('input[name="name"]').clear().type('Unsaved Changes');
      cy.get('input[name="address"]').clear().type('Unsaved Address');

      // Navigate away
      cy.visit('/hub/fairteiler/dashboard');

      // Navigate to profile page
      cy.url({ timeout: 15000 }).should('include', '/hub/fairteiler/dashboard');

      // Navigate back
      cy.visit('/hub/fairteiler/profile');

      // Form should be reset to original values
      cy.get('input[name="name"]').should('have.value', 'Test Fairteiler');
      cy.get('input[name="address"]').should('have.value', 'Test Address 123');
    });
  });
});
