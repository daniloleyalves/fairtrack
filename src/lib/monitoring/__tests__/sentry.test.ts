import { describe, expect, it } from 'vitest';
import type { ErrorEvent } from '@sentry/nextjs';
import { sentryBeforeSend } from '../sentry';

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
});
