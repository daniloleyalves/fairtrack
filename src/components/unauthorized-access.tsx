'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Lock, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UnauthorizedAccessProps {
  title?: string;
  message?: string;
  showSignInButton?: boolean;
  signInPath?: string;
  variant?: 'default' | 'compact' | 'minimal';
}

export function UnauthorizedAccess({
  title = 'Nicht authentifiziert',
  message = 'Du bist nicht authentifiziert. Bitte melde dich erneut an.',
  showSignInButton = true,
  signInPath = '/sign-in',
  variant = 'default',
}: UnauthorizedAccessProps) {
  const router = useRouter();

  const handleSignIn = () => {
    router.push(signInPath);
  };

  if (variant === 'minimal') {
    return (
      <div className='flex items-center justify-center space-x-2 rounded-lg bg-muted/50 p-4 text-muted-foreground'>
        <Lock className='size-4' />
        <span className='text-sm'>{message}</span>
        {showSignInButton && (
          <Button size='sm' variant='outline' onClick={handleSignIn}>
            <LogIn className='mr-1 size-3' />
            Anmelden
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className='flex flex-col items-center space-y-3 rounded-lg border border-dashed p-6 text-center'>
        <Lock className='size-6 text-muted-foreground' />
        <div>
          <h4 className='font-medium'>{title}</h4>
          <p className='text-sm text-muted-foreground'>{message}</p>
        </div>
        {showSignInButton && (
          <Button size='sm' onClick={handleSignIn}>
            <LogIn className='mr-2 size-4' />
            Anmelden
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className='flex min-h-[400px] flex-col items-center justify-center space-y-4 p-8 text-center'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-center space-x-2 text-muted-foreground'>
            <Lock className='size-6' />
            <h2 className='text-xl font-semibold'>{title}</h2>
          </div>
        </CardHeader>
        <CardContent>
          <p className='max-w-md text-muted-foreground'>{message}</p>
        </CardContent>
        {showSignInButton && (
          <CardFooter className='flex justify-center'>
            <Button onClick={handleSignIn}>
              <LogIn className='mr-2 size-4' />
              Anmelden
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export function UnauthorizedAccessFallback() {
  return <UnauthorizedAccess />;
}
