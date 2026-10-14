/**
 * Vercel serves every preview deployment under its own hostnames (the
 * per-deployment URL and the per-branch URL), but BETTER_AUTH_URL is a single
 * value per Vercel environment. Without trusting those hostnames, sign-in and
 * every other auth POST from a preview fails Better Auth's origin check with
 * INVALID_ORIGIN. Production deployments are unaffected.
 */
export function getVercelPreviewOrigins(): string[] {
  if (process.env.VERCEL_ENV !== 'preview') return [];
  return [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]
    .filter((host): host is string => !!host)
    .map((host) => `https://${host}`);
}
