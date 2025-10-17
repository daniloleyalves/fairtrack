/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  css: {
    postcss: {
      plugins: [],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      'node_modules',
      'dist',
      '.github',
      '.next',
      '.vercel',
      '.husky',
      '.test-results',
      'cypress',
      'src/**/*.d.ts',
    ],
    alias: {
      'server-only': path.resolve(
        __dirname,
        './src/__tests__/mocks/server-only.ts',
      ),
    },

    // Test Reporters
    reporters: [
      'default',
      ['junit', { outputFile: '.test-results/vitest-report.xml' }],
      ['html', { outputFile: '.test-results/vitest-report.html' }],
    ],

    env: {
      RESEND_API_KEY: 'some_api_key',
      DATABASE_TEST_URL: process.env.DATABASE_TEST_URL,
      DATABASE_DEV_URL: process.env.DATABASE_DEV_URL,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@features': path.resolve(__dirname, './src/features'),
      '@server': path.resolve(__dirname, './src/server'),
      '@lib': path.resolve(__dirname, './src/lib'),
    },
  },

  define: {
    'process.env.NODE_ENV': '"test"',
    'process.env.NEXT_PUBLIC_ENV': '"testing"',
  },
});
