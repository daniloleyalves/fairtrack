import { LoadingScreen } from '@components/loading-screen';

export default function Loading() {
  return (
    <LoadingScreen className='absolute left-1/2 h-[calc(100vh-64px)] w-screen -translate-x-1/2' />
  );
}
