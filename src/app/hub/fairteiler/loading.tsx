import { Logo } from '@/lib/assets/logo';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className='absolute left-1/2 flex h-[calc(100vh-64px)] w-screen -translate-x-1/2 items-center justify-center bg-white'>
      <div className='flex flex-col items-center gap-4 text-primary'>
        <Logo className='h-12 animate-pulse sm:h-72' />
        <Loader2 className='size-12 animate-spin sm:size-16' />
      </div>
    </div>
  );
}
