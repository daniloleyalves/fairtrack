'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Loader2, User } from 'lucide-react';
import { authClient } from '@/lib/auth/auth-client';

const isDemo = process.env.NEXT_PUBLIC_ENV === 'demo';

const DEMO_PASSWORD = 'Demo1234';

const DEMO_USERS = [
  {
    name: 'Demo Admin',
    email: 'demo.admin@fairtrack.com',
    role: 'Inhaber:in',
  },
  {
    name: 'Sarah Wilson',
    email: 'sarah.wilson@demo.com',
    role: 'Mitglied',
  },
  {
    name: 'Emma Rodriguez',
    email: 'emma.rodriguez@demo.com',
    role: 'Mitglied',
  },
  {
    name: 'Mitarbeitende',
    email: 'employee-1@stuttgart-mitte.local',
    role: 'Mitarbeiter:in',
  },
  {
    name: 'Gastzugang',
    email: 'guest-1@stuttgart-mitte.local',
    role: 'Gast',
  },
];

export function DemoCredentialsBox() {
  const [loginInProgress, setLoginInProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!isDemo) return null;

  async function handleDemoLogin(email: string) {
    setError(null);
    setLoginInProgress(email);

    try {
      await authClient.signIn.email(
        {
          email,
          password: DEMO_PASSWORD,
        },
        {
          onSuccess: async () => {
            const session = await authClient.getSession();
            const hasOrganization = session.data?.session?.activeOrganizationId;
            router.push(
              hasOrganization
                ? '/hub/fairteiler/dashboard'
                : '/hub/user/dashboard',
            );
          },
          onError: (ctx) => {
            console.error('Demo login error:', ctx.error);
            setError(
              'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.',
            );
            setLoginInProgress(null);
          },
        },
      );
    } catch {
      setError('Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.');
      setLoginInProgress(null);
    }
  }

  return (
    <Card className='w-full border-amber-200 bg-amber-50'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-center text-lg'>Demo-Zugangsdaten</CardTitle>
        <p className='text-center text-sm text-muted-foreground'>
          Klicken Sie auf einen Benutzer, um sich anzumelden
        </p>
        <p className='text-center text-xs text-muted-foreground'>
          Passwort: {DEMO_PASSWORD}
        </p>
      </CardHeader>
      <CardContent className='flex flex-col gap-2'>
        {DEMO_USERS.map((user) => (
          <button
            key={user.email}
            onClick={() => handleDemoLogin(user.email)}
            disabled={loginInProgress !== null}
            className='flex cursor-pointer items-center gap-3 rounded-lg border bg-white p-3 text-left transition-colors hover:bg-gray-50 disabled:cursor-wait disabled:opacity-50'
          >
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100'>
              {loginInProgress === user.email ? (
                <Loader2 className='h-4 w-4 animate-spin text-amber-600' />
              ) : (
                <User className='h-4 w-4 text-amber-600' />
              )}
            </div>
            <div className='min-w-0 flex-1'>
              <div className='text-sm font-medium'>{user.name}</div>
              <div className='truncate text-xs text-muted-foreground'>
                {user.email}
              </div>
            </div>
            <Badge variant='outline' className='shrink-0 text-xs'>
              {user.role}
            </Badge>
          </button>
        ))}
        {error && (
          <p className='mt-1 text-center text-sm text-destructive'>{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
