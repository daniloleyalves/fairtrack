import { DataErrorBoundary } from '@/components/error-boundary';
import { FairteilerHistoryWrapper } from '@/features/fairteiler/history/components/history-table-wrapper';

export default function FairteilerHistoryPage() {
  return (
    <div className='mx-2 mt-8 mb-64 flex flex-col gap-4 sm:mx-8'>
      <div className='mb-4 flex flex-col gap-2 text-center sm:text-start'>
        <h2 className='font-londrina text-4xl font-bold tracking-wider text-white'>
          Lebensmittelabgaben-Verlauf
        </h2>
        <p
          className='max-w-5xl text-sm font-medium text-secondary'
          aria-description='form to add access view to fairteiler'
        >
          Verfolge den Verlauf deiner Lebensmittel und nimm nachträglich
          Änderungen vor.
        </p>
      </div>
      <DataErrorBoundary>
        <FairteilerHistoryWrapper />
      </DataErrorBoundary>
    </div>
  );
}
