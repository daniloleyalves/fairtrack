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

const NOISE_MESSAGE_FRAGMENTS = [
  'Failed to find Server Action',
  'NetworkError',
  'Load failed',
];

const INJECTED_FRAME_PATTERN =
  /^(?:chrome|moz|safari|safari-web|ms-browser)-extension:\/\/|^ext:|^<[a-z][\w-]*:/i;

function isNoiseMessage(text: string): boolean {
  return (
    text.startsWith(NOISE_MESSAGE_PREFIX) ||
    NOISE_MESSAGE_FRAGMENTS.some((fragment) => text.includes(fragment))
  );
}

function isInjectedByExtension(event: ErrorEvent): boolean {
  const frames = (event.exception?.values ?? []).flatMap(
    (exception) => exception.stacktrace?.frames ?? [],
  );
  return (
    frames.length > 0 &&
    frames.some((frame) => INJECTED_FRAME_PATTERN.test(frame.filename ?? ''))
  );
}

export function sentryBeforeSend(event: ErrorEvent): ErrorEvent | null {
  const exceptions = event.exception?.values ?? [];
  const isNoise = exceptions.some(
    (exception) =>
      exception.type === 'AbortError' || isNoiseMessage(exception.value ?? ''),
  );
  if (isNoise || isNoiseMessage(event.message ?? '')) {
    return null;
  }

  if (isInjectedByExtension(event)) {
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
