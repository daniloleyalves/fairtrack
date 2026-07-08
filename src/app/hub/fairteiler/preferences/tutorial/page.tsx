import { FairteilerTutorialCardWrapper } from '@/features/fairteiler/tutorial/components/fairteiler-tutorial-card-wrapper';
import { ListErrorBoundary } from '@/components/error-boundary';

export default function FairteilerTutorialPage() {
  return (
    <div className='mx-2 mt-8 mb-64 flex flex-col gap-4 sm:mx-8'>
      <div className='mb-4 flex flex-col gap-2 text-center text-white sm:text-start'>
        <h2 className='font-londrina text-4xl font-bold tracking-wider'>
          Tutorial Verwaltung
        </h2>
        <p className='max-w-5xl text-sm font-medium text-secondary'>
          Erstelle und verwalte eine personalisierte Schritt-für-Schritt
          Anleitung für deine Fairteiler-Benutzer. Das Tutorial wird vor dem
          Retteformular angezeigt und kann übersprungen werden.
        </p>
      </div>

      <ListErrorBoundary>
        <FairteilerTutorialCardWrapper />
      </ListErrorBoundary>
    </div>
  );
}
