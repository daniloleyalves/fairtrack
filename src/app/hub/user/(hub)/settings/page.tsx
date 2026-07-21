import { DataErrorBoundary } from '@/components/error-boundary';
import { UnauthorizedAccess } from '@/components/unauthorized-access';
import UserSettingsWrapper from '@/features/user/settings/components/user-settings-wrapper';
import { getSession } from '@/server/user/queries';
import { headers } from 'next/headers';

export default async function UserSettingsPage() {
  const auth = await getSession(await headers());
  const user = auth?.user;

  if (!user) {
    return <UnauthorizedAccess />;
  }

  return (
    <div className='mx-2 mt-8 mb-64 sm:mx-8'>
      <div className='mb-4'>
        <h2 className='font-londrina text-4xl font-bold tracking-wider text-white'>
          Einstellungen
        </h2>
      </div>
      <DataErrorBoundary>
        <UserSettingsWrapper user={user} />
      </DataErrorBoundary>
    </div>
  );
}
