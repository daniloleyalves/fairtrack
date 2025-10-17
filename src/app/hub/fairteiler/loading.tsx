import { Logo } from '@/lib/assets/logo';

export default function FairteilerLoading() {
  return (
    <div className='absolute left-1/2 flex h-[calc(100vh-64px)] w-screen -translate-x-1/2 items-center justify-center bg-white'>
      <div className='flex flex-col items-center gap-4 text-primary'>
        <Logo className='h-72 animate-pulse' />
        <p className='-translate-y-12 text-xl font-medium text-muted-foreground'>
          Lade Benutzeroberfläche...
        </p>
      </div>
    </div>
  );
}
