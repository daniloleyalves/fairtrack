// Import commands.js using ES2015 syntax:
import './commands';
import 'cypress-mochawesome-reporter/register';

// Hide fetch/XHR requests from command log to reduce noise
const app = window.top;
if (
  app &&
  !app.document.head.querySelector('[data-hide-command-log-request]')
) {
  const style = app.document.createElement('style');
  style.innerHTML =
    '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// Global after hook to clean database at the very end
after(() => {
  cy.task('cleanDatabase');
});

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('Permission denied')) {
    return false;
  }
  if (
    err.message.includes(
      'The specific message is omitted in production builds to avoid leaking sensitive details',
    )
  ) {
    return false;
  }
});
