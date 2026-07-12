import { UserHubShell } from '@/components/nav/user-hub-shell';

export default function ContributionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserHubShell>{children}</UserHubShell>;
}
