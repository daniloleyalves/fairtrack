import type { Breadcrumb, ErrorEvent } from '@sentry/nextjs';

const FALLBACK_SENTRY_DSN =
  'https://58a1a1907f0139cb73444bbee77f46ad@o4509632474775552.ingest.de.sentry.io/4509632476217424';

export const SENTRY_DSN =
  process.env.NEXT_PUBLIC_SENTRY_DSN ?? FALLBACK_SENTRY_DSN;

export const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_ENV;

export const SENTRY_ENABLED =
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PUBLIC_ENV !== 'testing';

const UNSAMPLED_TRANSACTION_NAMES = ['/monitoring'];

const FULLY_SAMPLED_TRANSACTION_NAMES = [
  '/api/auth',
  '/sign-in',
  '/sign-up',
  '/reset-password',
  '/contribution',
];

const HEALTHY_TRACES_SAMPLE_RATE = 0.15;

export function sentryTracesSampler(context: {
  name?: string;
  parentSampled?: boolean;
}): number {
  if (typeof context.parentSampled === 'boolean') {
    return context.parentSampled ? 1 : 0;
  }

  const name = context.name ?? '';
  if (UNSAMPLED_TRANSACTION_NAMES.some((route) => name.includes(route))) {
    return 0;
  }

  if (FULLY_SAMPLED_TRANSACTION_NAMES.some((route) => name.includes(route))) {
    return 1;
  }

  return HEALTHY_TRACES_SAMPLE_RATE;
}

const NOISE_MESSAGE_PREFIX = 'ResizeObserver loop';

export function sentryBeforeSend(event: ErrorEvent): ErrorEvent | null {
  const exceptions = event.exception?.values ?? [];
  const isNoise = exceptions.some(
    (exception) =>
      exception.type === 'AbortError' ||
      (exception.value ?? '').startsWith(NOISE_MESSAGE_PREFIX),
  );
  if (isNoise || (event.message ?? '').startsWith(NOISE_MESSAGE_PREFIX)) {
    return null;
  }

  if (event.message) {
    event.message = scrubEmails(event.message);
  }
  if (event.request?.url) {
    event.request.url = scrubEmails(event.request.url);
  }

  return event;
}

const EMAIL_PATTERN = /[\w.+-]+@[\w-]+\.[\w.-]+/gi;

export function scrubEmails(text: string): string {
  return text.replace(EMAIL_PATTERN, '[email]');
}

export function sentryBeforeBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb {
  if (breadcrumb.message) {
    breadcrumb.message = scrubEmails(breadcrumb.message);
  }
  if (breadcrumb.data) {
    for (const [key, value] of Object.entries(breadcrumb.data)) {
      if (typeof value === 'string') {
        breadcrumb.data[key] = scrubEmails(value);
      }
    }
  }

  return breadcrumb;
}
