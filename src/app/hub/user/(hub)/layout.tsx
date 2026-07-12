import { UserHubNav } from '@/components/nav/user-hub-nav';
import { UserHubShell } from '@/components/nav/user-hub-shell';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserHubShell nav={<UserHubNav />}>{children}</UserHubShell>;
}
