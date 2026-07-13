// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import {
  SENTRY_DSN,
  SENTRY_ENABLED,
  SENTRY_ENVIRONMENT,
  sentryTracesSampler,
} from '@/lib/monitoring/sentry';

Sentry.init({
  enabled: SENTRY_ENABLED,

  dsn: SENTRY_DSN,

  environment: SENTRY_ENVIRONMENT,

  tracesSampler: sentryTracesSampler,

  debug: false,
});
