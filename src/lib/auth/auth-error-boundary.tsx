'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface AuthErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface AuthErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class AuthErrorBoundary extends Component<
  AuthErrorBoundaryProps,
  AuthErrorBoundaryState
> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Auth Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Alert variant='destructive' className='mx-auto w-max'>
          <AlertTriangle className='size-4' />
          <AlertTitle>Authentifizierungsfehler</AlertTitle>
          <AlertDescription className='mt-2'>
            Ein Fehler ist bei der Authentifizierung aufgetreten.
            <div className='mt-3 flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => window.location.reload()}
              >
                Seite neu laden
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => (window.location.href = '/sign-in')}
              >
                Zur Anmeldung
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
