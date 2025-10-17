import { headers } from 'next/headers';
import { getSession } from '@server/dto';

export async function AuthProvider({ children }: React.ComponentProps<'div'>) {
  // Auth Provider calls session and user data by default and caches it.
  // This ensures all child components get the cached session data.
  const nextHeaders = await headers();
  await getSession(nextHeaders);
  return <>{children}</>;
}
