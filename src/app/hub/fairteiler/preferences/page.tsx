import { FormSelectionsWrapper } from '@/features/fairteiler/preferences/components/form-selections-wrapper';
import { ListErrorBoundary } from '@/components/error-boundary';
import { FairteilerDisableWrapper } from '@/features/fairteiler/preferences/components/fairteiler-disable-wrapper';
import { FairteilerTutorialCardWrapper } from '@/features/fairteiler/tutorial/components/fairteiler-tutorial-card-wrapper';

export default function FairteilerPreferencesPage() {
  return (
    <div className='mx-2 mt-8 mb-64 flex flex-col gap-4 sm:mx-8'>
      <div className='mb-4 flex flex-col gap-2 text-center text-white sm:text-start'>
        <h2 className='font-londrina text-4xl font-bold tracking-wider'>
          Präferenzen
        </h2>
        <p
          className='max-w-5xl text-sm font-medium text-secondary'
          aria-description='fairteiler preferences and settings'
        >
          Verwalte die Einstellungen deines Fairteilers. Du kannst die
          Sichtbarkeit steuern und die verfügbaren Optionen für Herkünfte,
          Kategorien und Betriebe im Retteformular anpassen. Neue Einträge
          können bei Bedarf vorgeschlagen und ergänzt werden.
        </p>
      </div>
      <ListErrorBoundary>
        <FairteilerDisableWrapper />
      </ListErrorBoundary>
      <ListErrorBoundary>
        <FairteilerTutorialCardWrapper />
      </ListErrorBoundary>
      <FormSelectionsWrapper />
    </div>
  );
}
