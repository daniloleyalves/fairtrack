/// <reference types="cypress" />

import type { UsersFixture } from '../../support/types';
import { isDatabaseFairteiler } from '../../support/types';

describe('User Registration E2E', () => {
  beforeEach(() => {
    cy.cleanDatabase();
  });
  it('should complete successful registration workflow', () => {
    cy.fixture('users').then((users: UsersFixture) => {
      const { validUser } = users;

      // 1. Visit registration page
      cy.visit('/sign-up');

      // 2. Verify page elements
      cy.contains('REGISTRIEREN').should('be.visible');
      cy.contains('Bitte fülle das Formular aus').should('be.visible');

      // 3. Fill registration form
      cy.fillRegistrationForm({
        email: validUser.email,
        firstName: validUser.firstName || 'Test',
        lastName: validUser.lastName || 'User',
        password: validUser.password,
        acceptTos: true,
        isFirstLogin: false,
        isAnonymous: false,
      });

      // 4. Submit form
      cy.get('button[type="submit"]')
        .should('contain', 'Jetzt Registrieren')
        .click();

      // 5. Wait for redirect to dashboard
      cy.url({ timeout: 15000 }).should('include', '/hub/user/dashboard');

      // // 6. Verify user was created in database
      // cy.getUserByEmail(validUser.email).then((user) => {
      //   expect(user).to.exist;
      //   if (user) {
      //     expect(user.firstName).to.equal(validUser.firstName || 'Test');
      //     expect(user.lastName).to.equal(validUser.lastName || 'User');
      //     expect(user.email).to.equal(validUser.email);
      //     expect(user.emailVerified).to.be.false;
      //   }
      // });
    });
  });

  it('should handle registration form validation errors', () => {
    cy.fixture('users').then((users: UsersFixture) => {
      const { invalidUser } = users;

      cy.visit('/sign-up');

      // Submit button should be disabled initially
      cy.get('button[type="submit"]').should('be.disabled');

      // Fill form with invalid data
      cy.fillRegistrationForm({
        email: invalidUser.email, // not a valid email
        firstName: invalidUser.firstName || 'a', // too short or empty
        lastName: invalidUser.lastName || 'b', // too short or empty
        password: invalidUser.password, // invalid (too short / no uppercase / no number)
        acceptTos: false, // TOS not accepted
        isFirstLogin: false,
        isAnonymous: false,
      });

      // Try to submit form
      cy.get('button[type="submit"]')
        .should('contain', 'Jetzt Registrieren')
        .click();

      // Trigger blur on inputs to show field-level validation
      cy.get('input[name="firstName"]').focus().blur();
      cy.get('input[name="lastName"]').focus().blur();
      cy.get('input[name="email"]').focus().blur();
      cy.get('input[name="password"]').focus().blur();
      cy.get('input[name="passwordConfirm"]').focus().blur();

      // Check all validation messages
      cy.contains('Bitte gib mindestens 2 Zeichen ein.').should('be.visible');
      cy.contains('Ungültige E-Mail-Adresse.').should('be.visible');
      cy.contains('Passwort muss mindestens 8 Zeichen lang sein.').should(
        'be.visible',
      );
      cy.contains('Bitte aktzeptiere die Nutzungsbedingungen.').should(
        'be.visible',
      );
    });
  });

  it('should handle password mismatch validation', () => {
    cy.visit('/sign-up');

    cy.get('input[name="firstName"]').type('Test');
    cy.get('input[name="lastName"]').type('User');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="passwordConfirm"]').type('differentpassword');
    cy.get('button[role="checkbox"]').click();

    cy.get('button[type="submit"]').click();

    // Should show password mismatch error
    cy.contains('Passwörter stimmen nicht überein.').should('be.visible');
  });

  it('should handle existing user registration attempt', () => {
    cy.fixture('users').then((users: UsersFixture) => {
      const { existingUser } = users;

      // Create existing user in database
      cy.createTestUser({
        email: existingUser.email,
        firstName: existingUser.firstName || 'Existing',
        lastName: existingUser.lastName || 'User',
        password: existingUser.password,
        isFirstLogin: false,
        isAnonymous: false,
      });

      cy.visit('/sign-up');
      cy.fillRegistrationForm({
        email: existingUser.email,
        firstName: existingUser.firstName || 'Existing',
        lastName: existingUser.lastName || 'User',
        password: existingUser.password,
        acceptTos: true,
        isFirstLogin: false,
        isAnonymous: false,
      });
      cy.get('button[type="submit"]').click();

      // Should show error message for existing user
      cy.contains('Benutzer bereits registriert.').should('be.visible');
    });
  });

  it('should handle registration with invitation', () => {
    cy.fixture('users').then((users: UsersFixture) => {
      const { invitedUser } = users;

      cy.createTestFairteiler({
        name: 'Test Fairteiler',
        slug: `test-fairteiler-${Date.now()}`,
      }).then((fairteiler) => {
        if (isDatabaseFairteiler(fairteiler)) {
          const invitationId = `invitation-${Date.now()}`;

          // First create the inviter user
          cy.createTestUser({
            email: 'inviter-user@example.com',
            firstName: 'Inviter',
            lastName: 'User',
            password: 'randomPassword123!',
            isFirstLogin: false,
            isAnonymous: false,
          }).then((inviterUser) => {
            if (!inviterUser) {
              throw new Error('Inviter user could not be created');
            }

            // Now create the invitation using inviterUser.id
            cy.task('createTestInvitation', {
              id: invitationId,
              email: invitedUser.email,
              organizationId: fairteiler.id,
              role: 'member',
              inviterId: inviterUser.id,
            }).then(() => {
              cy.visit(`/sign-up?invitationId=${invitationId}`);

              // Email should be pre-filled
              cy.get('input[name="email"]').should(
                'have.value',
                invitedUser.email,
              );

              // Should show invitation message
              cy.contains('Sie wurden zu').should('be.visible');

              // Complete registration
              cy.get('input[name="firstName"]').type(
                invitedUser.firstName || 'Invited',
              );
              cy.get('input[name="lastName"]').type(
                invitedUser.lastName || 'User',
              );
              cy.get('input[name="password"]').type(invitedUser.password);
              cy.get('input[name="passwordConfirm"]').type(
                invitedUser.password,
              );
              cy.get('button[role="checkbox"]').click();
              cy.get('button[type="submit"]').click();

              // Should redirect to dashboard
              cy.url({ timeout: 15000 }).should(
                'include',
                '/hub/user/dashboard',
              );

              // Verify user is member of fairteiler
              // cy.getUserByEmail(invitedUser.email).then((user) => {
              //   if (user) {
              //     cy.task('getMemberByUserId', user.id).then((member) => {
              //       expect(member).to.exist;
              //       if (member && isDatabaseMember(member)) {
              //         expect(member.organizationId).to.equal(fairteiler.id);
              //         expect(member.role).to.equal('member');
              //       }
              //     });
              //   }
              // });
            });
          });
        }
      });
    });
  });

  it('should show password visibility toggle', () => {
    cy.visit('/sign-up');

    // Password fields should be type="password" initially
    cy.get('input[name="password"]').should('have.attr', 'type', 'password');
    cy.get('input[name="passwordConfirm"]').should(
      'have.attr',
      'type',
      'password',
    );

    // Click eye icon to show password
    cy.get('input[name="password"]').parent().find('button').first().click();

    // Password fields should now be type="text"
    cy.get('input[name="password"]').should('have.attr', 'type', 'text');
    cy.get('input[name="passwordConfirm"]').should('have.attr', 'type', 'text');

    // Click eye-off icon to hide password
    cy.get('input[name="password"]').parent().find('button').first().click();

    // Password fields should be type="password" again
    cy.get('input[name="password"]').should('have.attr', 'type', 'password');
    cy.get('input[name="passwordConfirm"]').should(
      'have.attr',
      'type',
      'password',
    );
  });
});
