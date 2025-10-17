'use client';

import { useRouter } from 'next/navigation';
import { DropdownMenuItem } from '@components/ui/dropdown-menu';
import { handleClientOperation, noop } from '@/lib/client-error-handling';
import { authClient } from '@/lib/auth/auth-client';
import { LogOut } from 'lucide-react';

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = () => {
    handleClientOperation(
      async () => {
        const result = await authClient.signOut();

        if (result.data?.success) {
          router.push('/sign-in');
        }
      },
      noop,
      (error) => {
        console.error('Error checking invitation:', error);
      },
    );
  };

  return (
    <DropdownMenuItem
      className='font-medium text-foreground/60'
      onClick={handleSignOut}
    >
      <LogOut className='size-4' />
      Abmelden
    </DropdownMenuItem>
  );
}
