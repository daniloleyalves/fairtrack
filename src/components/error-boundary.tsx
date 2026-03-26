'use client';

import React from 'react';
import { Button } from '@components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@components/ui/card';
import { UnauthorizedAccess } from './unauthorized-access';

// --- Types ---

interface FallbackProps {
  error?: Error;
  resetError: () => void;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<FallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

// --- Core Error Boundary ---

class ErrorBoundaryClass extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback ?? DefaultErrorFallback;
      return <Fallback error={this.state.error} resetError={this.resetError} />;
    }
    return this.props.children;
  }
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <ErrorBoundaryClass {...props} />;
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName ?? Component.name})`;
  return WrappedComponent;
}

// --- Auth Error Detection ---

function isAuthError(error?: Error): boolean {
  if (!error) return false;
  const name = error.name ?? '';
  const message = error.message ?? '';
  if (name === 'AuthError') return true;
  if (
    name === 'NotFoundError' &&
    (message.includes('active fairteiler') ||
      message.includes('session') ||
      message.includes('authentifiziert'))
  )
    return true;
  if (
    message.includes('not authenticated') ||
    message.includes('Nicht authentifiziert')
  )
    return true;
  return false;
}

// --- Fallback Components ---

function DefaultErrorFallback({ error, resetError }: FallbackProps) {
  if (isAuthError(error)) {
    return <UnauthorizedAccess />;
  }

  return (
    <div className='flex min-h-[400px] flex-col items-center justify-center space-y-4 p-8 text-center'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-center space-x-2 text-destructive'>
            <AlertTriangle className='size-6' />
            <h2 className='text-xl font-semibold'>Etwas ist schiefgelaufen</h2>
          </div>
        </CardHeader>
        <CardContent>
          <p className='max-w-md text-muted-foreground'>
            Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es
            erneut oder kontaktieren Sie den Support, falls das Problem
            weiterhin besteht.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className='mt-4 max-w-2xl'>
              <summary className='cursor-pointer text-sm font-medium text-muted-foreground'>
                Fehlerdetails (nur in Entwicklung sichtbar)
              </summary>
              <pre className='mt-2 overflow-auto rounded bg-muted p-4 text-left text-xs'>
                {error?.message}
              </pre>
            </details>
          )}
        </CardContent>
        <CardFooter className='flex w-full justify-center gap-2'>
          <Button variant='outline' onClick={resetError}>
            <RefreshCw className='mr-2 size-4' />
            Erneut versuchen
          </Button>
          <Button onClick={() => window.location.reload()}>
            Seite neu laden
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function ErrorFallback({
  title,
  message,
  resetLabel = 'Erneut versuchen',
  resetError,
}: FallbackProps & { title: string; message: string; resetLabel?: string }) {
  return (
    <div className='flex flex-col items-center space-y-4 rounded-lg border border-dashed p-6 text-center'>
      <AlertTriangle className='size-6 text-destructive' />
      <div>
        <h4 className='font-medium'>{title}</h4>
        <p className='text-sm text-muted-foreground'>{message}</p>
      </div>
      <Button onClick={resetError} size='sm' variant='outline'>
        <RefreshCw className='mr-2 size-3' />
        {resetLabel}
      </Button>
    </div>
  );
}

// --- Convenience Wrappers ---

export function DataErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ resetError }) => (
        <ErrorFallback
          title='Daten konnten nicht geladen werden'
          message='Es gab ein Problem beim Laden der Daten. Bitte versuchen Sie es erneut.'
          resetError={resetError}
        />
      )}
      onError={(error) => console.error('Data loading error:', error)}
    >
      {children}
    </ErrorBoundary>
  );
}

export function ListErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ resetError }) => (
        <ErrorFallback
          title='Liste konnte nicht geladen werden'
          message='Bitte versuchen Sie es erneut.'
          resetError={resetError}
        />
      )}
      onError={(error) => console.error('List loading error:', error)}
    >
      {children}
    </ErrorBoundary>
  );
}

export function FormErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ resetError }) => (
        <ErrorFallback
          title='Formular konnte nicht geladen werden'
          message='Die Formulardaten sind nicht verfügbar.'
          resetLabel='Neu laden'
          resetError={resetError}
        />
      )}
      onError={(error) => console.error('Form loading error:', error)}
    >
      {children}
    </ErrorBoundary>
  );
}

export function UnauthorizedErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={() => <UnauthorizedAccess variant='compact' />}
      onError={(error) => console.error('Unauthorized access error:', error)}
    >
      {children}
    </ErrorBoundary>
  );
}
