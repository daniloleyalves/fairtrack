import { Logo } from '@/lib/assets/logo';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export function LoadingScreen({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-background',
        className,
      )}
    >
      <div className='flex flex-col items-center gap-4 text-primary'>
        <Logo className='h-auto w-[min(80vw,475px)] animate-pulse' />
        <Loader2 className='size-12 animate-spin sm:size-16' />
      </div>
    </div>
  );
}
