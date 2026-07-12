import { UserHistoryWrapper } from '@/features/user/history/components/user-history-wrapper';
import { getSession } from '@/server/user/queries';
import { headers } from 'next/headers';
import { UnauthorizedAccess } from '@/components/unauthorized-access';
import { DataErrorBoundary } from '@/components/error-boundary';

export default async function UserHistoryPage() {
  const nextHeaders = await headers();
  const auth = await getSession(nextHeaders);
  const user = auth?.user;

  if (!user) {
    return <UnauthorizedAccess />;
  }

  return (
    <div className='mx-2 mt-8 mb-64 sm:mx-8'>
      <div className='mb-4'>
        <h2 className='font-londrina text-4xl font-bold tracking-wider text-white'>
          Meine Beiträge
        </h2>
      </div>

      <DataErrorBoundary>
        <UserHistoryWrapper />
      </DataErrorBoundary>
    </div>
  );
}
