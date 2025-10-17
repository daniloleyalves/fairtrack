'use client';

import React from 'react';
import { Button } from '@components/ui/button';
import { AlertTriangle, RefreshCw, Lock, LogIn } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@components/ui/card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error?: Error;
    resetError: () => void;
  }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundaryClass extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback ?? DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({
  _error,
  resetError,
}: {
  _error?: Error;
  resetError: () => void;
}) {
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
                {_error?.message}
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

/**
 * Error Boundary component with sensible defaults
 */
export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <ErrorBoundaryClass {...props} />;
}

/**
 * Higher-order component to wrap components with error boundary
 */
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

// Specialized fallback components for different contexts

/**
 * Error fallback for data loading failures
 */
function DataErrorFallback({
  error: _error,
  resetError,
}: {
  error?: Error;
  resetError: () => void;
}) {
  return (
    <div className='flex flex-col items-center justify-center space-y-4 rounded-lg bg-white p-8'>
      <AlertTriangle className='size-8 text-destructive' />
      <h3 className='text-lg font-semibold'>
        Daten konnten nicht geladen werden
      </h3>
      <p className='max-w-md text-center text-muted-foreground'>
        Es gab ein Problem beim Laden der Daten. <br /> Bitte versuchen Sie es
        erneut.
      </p>
      <Button onClick={resetError} variant='outline'>
        <RefreshCw className='mr-2 size-4' />
        Erneut laden
      </Button>
    </div>
  );
}

/**
 * Error fallback for list/table loading failures
 */
function ListErrorFallback({
  error: _error,
  resetError,
}: {
  error?: Error;
  resetError: () => void;
}) {
  return (
    <div className='flex flex-col items-center space-y-4 rounded-lg border border-dashed p-6'>
      <AlertTriangle className='size-6 text-destructive' />
      <p className='text-sm text-muted-foreground'>
        Liste konnte nicht geladen werden
      </p>
      <Button onClick={resetError} size='sm' variant='outline'>
        Erneut versuchen
      </Button>
    </div>
  );
}

/**
 * Error fallback for form/settings loading failures
 */
function FormErrorFallback({
  error: _error,
  resetError,
}: {
  error?: Error;
  resetError: () => void;
}) {
  return (
    <div className='flex flex-col items-center space-y-4 rounded-lg bg-muted/50 p-6'>
      <AlertTriangle className='size-6 text-destructive' />
      <div className='text-center'>
        <h4 className='font-medium'>Formular konnte nicht geladen werden</h4>
        <p className='text-sm text-muted-foreground'>
          Die Formulardaten sind nicht verfügbar.
        </p>
      </div>
      <Button onClick={resetError} size='sm' variant='outline'>
        <RefreshCw className='mr-2 size-3' />
        Neu laden
      </Button>
    </div>
  );
}

/**
 * Error fallback for unauthorized access
 */
function UnauthorizedErrorFallback({
  error: _error,
  resetError,
}: {
  error?: Error;
  resetError: () => void;
}) {
  return (
    <div className='flex flex-col items-center space-y-4 rounded-lg border border-dashed p-6 text-center'>
      <Lock className='size-6 text-muted-foreground' />
      <div>
        <h4 className='font-medium'>Nicht authentifiziert</h4>
        <p className='text-sm text-muted-foreground'>
          Du bist nicht authentifiziert. Bitte melde dich erneut an.
        </p>
      </div>
      <div className='flex gap-2'>
        <Button size='sm' variant='outline' onClick={resetError}>
          <RefreshCw className='mr-2 size-3' />
          Erneut versuchen
        </Button>
        <Button size='sm' onClick={() => (window.location.href = '/sign-in')}>
          <LogIn className='mr-2 size-3' />
          Anmelden
        </Button>
      </div>
    </div>
  );
}

// Convenience wrapper components

/**
 * Error boundary optimized for data loading scenarios
 */
export function DataErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={DataErrorFallback}
      onError={(error) => console.error('Data loading error:', error)}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Error boundary optimized for list/table scenarios
 */
export function ListErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={ListErrorFallback}
      onError={(error) => console.error('List loading error:', error)}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Error boundary optimized for form/settings scenarios
 */
export function FormErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={FormErrorFallback}
      onError={(error) => console.error('Form loading error:', error)}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Error boundary optimized for unauthorized access scenarios
 */
export function UnauthorizedErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={UnauthorizedErrorFallback}
      onError={(error) => console.error('Unauthorized access error:', error)}
    >
      {children}
    </ErrorBoundary>
  );
}
