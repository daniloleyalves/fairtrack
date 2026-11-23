import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { getVercelPreviewOrigins } from '../trusted-origins';

describe('getVercelPreviewOrigins', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('trusts the deployment and branch URLs of a preview', () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('VERCEL_URL', 'fairtrack-abc123.vercel.app');
    vi.stubEnv('VERCEL_BRANCH_URL', 'fairtrack-git-feature.vercel.app');

    expect(getVercelPreviewOrigins()).toEqual([
      'https://fairtrack-abc123.vercel.app',
      'https://fairtrack-git-feature.vercel.app',
    ]);
  });

  it('skips hostnames Vercel did not set', () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('VERCEL_URL', 'fairtrack-abc123.vercel.app');
    vi.stubEnv('VERCEL_BRANCH_URL', '');

    expect(getVercelPreviewOrigins()).toEqual([
      'https://fairtrack-abc123.vercel.app',
    ]);
  });

  it.each(['production', 'development', ''])(
    'trusts nothing extra outside previews (VERCEL_ENV=%j)',
    (env) => {
      vi.stubEnv('VERCEL_ENV', env);
      vi.stubEnv('VERCEL_URL', 'fairtrack-abc123.vercel.app');

      expect(getVercelPreviewOrigins()).toEqual([]);
    },
  );
});
