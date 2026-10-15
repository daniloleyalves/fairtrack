import { AnnouncementBanner } from '@features/announcement/components/announcement-banner';
import { UserHubNav } from '@/components/nav/user-hub-nav';
import { UserHubShell } from '@/components/nav/user-hub-shell';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserHubShell
      nav={
        <>
          <AnnouncementBanner audience='user' className='mx-2 mt-4 sm:mx-8' />
          <UserHubNav />
        </>
      }
    >
      {children}
    </UserHubShell>
  );
}
