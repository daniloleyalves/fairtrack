import { DataErrorBoundary } from '@/components/error-boundary';
import { UnauthorizedAccess } from '@/components/unauthorized-access';
import UserDashboardWrapper from '@/features/user/dashboard/user-dashboard-wrapper';
import {
  checkMilestoneProgressForCurrentUser,
  getSession,
  getUserPreferences,
  getUserStreak,
} from '@/server/user/queries';
import { headers } from 'next/headers';
import { Streak } from '@/features/user/gamification/streaks/streak';

export default async function UserDashboardPage() {
  const nextHeaders = await headers();
  const auth = await getSession(nextHeaders);
  const user = auth?.user;
  if (!user) {
    return <UnauthorizedAccess />;
  }

  const userPreferences = await getUserPreferences();
  let userStreak = null;

  if (userPreferences?.enableStreaks) {
    userStreak = await getUserStreak(nextHeaders);
  }
  await checkMilestoneProgressForCurrentUser(nextHeaders);

  return (
    <div className='mx-2 mt-8 mb-64 sm:mx-8'>
      <div className='mb-8 flex w-full flex-col items-center gap-4 md:mb-4 md:flex-row md:gap-6'>
        <h2 className='flex items-center gap-2 font-londrina text-4xl font-bold tracking-wider text-white'>
          <div>
            <h3>Hallo</h3>
          </div>
          <div>
            <h3>{user.firstName}!</h3>
          </div>
        </h2>
        {userStreak && (
          <div>
            <Streak streak={userStreak} />
          </div>
        )}
      </div>
      <DataErrorBoundary>
        <UserDashboardWrapper />
      </DataErrorBoundary>
    </div>
  );
}
