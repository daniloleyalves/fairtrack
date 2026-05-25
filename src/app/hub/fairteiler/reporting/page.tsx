import { DataErrorBoundary } from '@/components/error-boundary';
import FairteilerReportingWrapper from '@/features/fairteiler/reporting/components/reporting-wrapper';

export default function FairteilerReportingPage() {
  return (
    <div className='mx-2 mt-8 mb-64 flex flex-col gap-4 sm:mx-8'>
      <div className='mb-4 flex flex-col gap-2 text-center sm:text-start'>
        <h2 className='font-londrina text-4xl font-bold tracking-wider text-white'>
          Statistiken
        </h2>
        <p
          className='max-w-5xl text-sm font-medium text-secondary'
          aria-description='form to add access view to fairteiler'
        >
          Analysiere die gesammelten Daten und verschaffe dir einen Überblick
          über alle relevanten Statistiken über den Fairteiler.
        </p>
      </div>
      <DataErrorBoundary>
        <FairteilerReportingWrapper />
      </DataErrorBoundary>
    </div>
  );
}
