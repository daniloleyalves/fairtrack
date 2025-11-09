import { Loader2 } from 'lucide-react';

export default function UserHistoryLoading() {
  return (
    <div className='container mx-auto py-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>Meine Beiträge</h1>
        <p className='text-muted-foreground'>
          Übersicht über alle deine Lebensmittelbeiträge
        </p>
      </div>

      <div className='flex items-center justify-center py-8'>
        <Loader2 className='size-8 animate-spin' />
      </div>
    </div>
  );
}
