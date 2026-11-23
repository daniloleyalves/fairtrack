import { UserHubShell } from '@/components/nav/user-hub-shell';

export default function ScanGuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserHubShell showDock={false}>{children}</UserHubShell>;
}
