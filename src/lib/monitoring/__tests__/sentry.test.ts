import { describe, expect, it } from 'vitest';
import type { Breadcrumb, ErrorEvent } from '@sentry/nextjs';
import {
  scrubEmails,
  sentryBeforeBreadcrumb,
  sentryBeforeSend,
} from '../sentry';

function errorEvent(overrides: Partial<ErrorEvent>): ErrorEvent {
  return { type: undefined, ...overrides } as ErrorEvent;
}

describe('sentryBeforeSend', () => {
  it('drops events whose exception is an AbortError', () => {
    const event = errorEvent({
      exception: {
        values: [{ type: 'AbortError', value: 'The user aborted a request.' }],
      },
    });

    expect(sentryBeforeSend(event)).toBeNull();
  });

  it('drops ResizeObserver loop limit exceeded events', () => {
    const event = errorEvent({
      exception: {
        values: [
          { type: 'Error', value: 'ResizeObserver loop limit exceeded' },
        ],
      },
    });

    expect(sentryBeforeSend(event)).toBeNull();
  });

  it('drops ResizeObserver loop completed with undelivered notifications events', () => {
    const event = errorEvent({
      exception: {
        values: [
          {
            type: 'Error',
            value:
              'ResizeObserver loop completed with undelivered notifications.',
          },
        ],
      },
    });

    expect(sentryBeforeSend(event)).toBeNull();
  });

  it('drops message-only ResizeObserver events', () => {
    const event = errorEvent({
      message: 'ResizeObserver loop limit exceeded',
    });

    expect(sentryBeforeSend(event)).toBeNull();
  });

  it('passes normal error events through unchanged', () => {
    const event = errorEvent({
      exception: {
        values: [{ type: 'TypeError', value: 'x is not a function' }],
      },
    });

    expect(sentryBeforeSend(event)).toBe(event);
  });

  it('passes events without exception values through unchanged', () => {
    const event = errorEvent({ message: 'plain message' });

    expect(sentryBeforeSend(event)).toBe(event);
  });

  it('scrubs emails from the event message and request url', () => {
    const event = errorEvent({
      message: 'failed for john.doe@example.com',
      request: { url: 'https://app.test/verify?email=jane@example.com' },
    });

    const result = sentryBeforeSend(event);

    expect(result?.message).toBe('failed for [email]');
    expect(result?.request?.url).toBe('https://app.test/verify?email=[email]');
  });
});

describe('scrubEmails', () => {
  it('replaces all email addresses with a placeholder', () => {
    expect(scrubEmails('a@b.de wrote to c.d+tag@example.co.uk')).toBe(
      '[email] wrote to [email]',
    );
  });

  it('leaves text without emails untouched', () => {
    expect(scrubEmails('nothing to scrub')).toBe('nothing to scrub');
  });
});

describe('sentryBeforeBreadcrumb', () => {
  it('scrubs emails from the breadcrumb message', () => {
    const breadcrumb: Breadcrumb = {
      message: 'Error sending email to john@example.com',
    };

    expect(sentryBeforeBreadcrumb(breadcrumb).message).toBe(
      'Error sending email to [email]',
    );
  });

  it('scrubs emails from string data values', () => {
    const breadcrumb: Breadcrumb = {
      data: {
        url: 'https://app.test/check?email=jane@example.com',
        method: 'POST',
        status_code: 200,
      },
    };

    const result = sentryBeforeBreadcrumb(breadcrumb);

    expect(result.data?.url).toBe('https://app.test/check?email=[email]');
    expect(result.data?.method).toBe('POST');
    expect(result.data?.status_code).toBe(200);
  });

  it('passes breadcrumbs without message or data through', () => {
    const breadcrumb: Breadcrumb = { category: 'ui.click' };

    expect(sentryBeforeBreadcrumb(breadcrumb)).toBe(breadcrumb);
  });
});
