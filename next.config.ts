/* eslint-disable */

import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';
import withPlaiceholder from '@plaiceholder/next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['https://fairtrack.sentry.io'],
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },
  experimental: {
    reactCompiler: true,
    ppr: true,
    useCache: true,
    inlineCss: true,
    serverActions: {
      bodySizeLimit: '3mb',
    },
  },
  serverExternalPackages: ['ably'],
  async redirects() {
    return [
      {
        source: '/hub/fairteiler',
        destination: '/hub/fairteiler/dashboard',
        permanent: true, // Use true for permanent redirects (HTTP 308)
      },
    ];
  },
  images: {
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mmm5u4fjrhaoeehc.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
        search: '',
      },
    ],
  },
  turbopack: {
    rules: {
      '*.html': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      '*.txt': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(txt|html)$/, // This regex matches both .txt and .html
      use: 'raw-loader',
    });

    return config;
  },
};

export default withSentryConfig(withPlaiceholder(nextConfig), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'fairtrack',
  project: 'fairtrack',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
