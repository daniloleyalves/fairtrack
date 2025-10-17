/* eslint-disable */

import { defineConfig } from 'cypress';
import { databaseTasks } from './cypress/plugins/database-tasks';
import dotenv from 'dotenv';

dotenv.config({ path: '.vercel/.env.development.local' });

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3001',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,

    // Output directories
    videosFolder: '.test-results/cypress/videos',
    screenshotsFolder: '.test-results/cypress/screenshots',

    setupNodeEvents(on, config) {
      on('task', databaseTasks);
      require('cypress-mochawesome-reporter/plugin')(on);

      // Set environment variable to indicate E2E test mode
      process.env.NEXT_PUBLIC_ENV = 'testing';

      return config;
    },
  },

  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: '.test-results/cypress/reports',
    overwrite: false,
    html: true,
    json: true,
    charts: true,
    reportPageTitle: 'FairTrack E2E Test Report',
    embeddedScreenshots: true,
    inlineAssets: true,
  },

  env: {
    DATABASE_TEST_URL: process.env.DATABASE_TEST_URL,
    DATABASE_DEV_URL: process.env.DATABASE_DEV_URL,
  },

  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    videosFolder: '.test-results/cypress/component-videos',
    screenshotsFolder: '.test-results/cypress/component-screenshots',
  },
});
