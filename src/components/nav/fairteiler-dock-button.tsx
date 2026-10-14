'use client';

import { useSession } from '@/lib/auth/auth-hooks';
import { isGuestOrEmployeeEmail } from '@/lib/auth/auth-helpers';
import { DockButton } from '@/components/ui/dock-button';
import { Separator } from '@/components/ui/separator';

export function FairteilerDockButton() {
  const { user, session } = useSession();

  if (!user || !session?.activeOrganizationId) return null;

  return (
    <>
      <Separator orientation='vertical' />
      {isGuestOrEmployeeEmail(user.email) ? (
        <DockButton href='/hub/fairteiler/contribution' icon='ClipboardList' />
      ) : (
        <DockButton href='/hub/fairteiler/dashboard' icon='Coffee' />
      )}
    </>
  );
}
