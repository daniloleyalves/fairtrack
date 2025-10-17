'use client';

interface LoadingBarProps {
  isLoading: boolean;
  className?: string;
}

export function LoadingBar({ isLoading, className = '' }: LoadingBarProps) {
  if (!isLoading) return null;

  return (
    <div
      className={`fixed top-0 right-0 left-0 z-50 h-1 bg-transparent ${className}`}
    >
      <div className='animate-loading-bar h-full origin-left bg-gradient-to-r from-blue-500 to-tertiary' />
    </div>
  );
}
