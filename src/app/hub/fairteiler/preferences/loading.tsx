import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import { Separator } from '@components/ui/separator';
import { Settings } from 'lucide-react';
import { FairteilerDisableSkeleton } from '@/features/fairteiler/preferences/components/fairteiler-disable-wrapper';
import { CatalogSelectionSkeleton } from '@/features/fairteiler/preferences/components/catalog-selection-skeleton';
import { TutorialCardSkeleton } from '@/features/fairteiler/tutorial/components/tutorial-card-skeleton';

export default function FairteilerPreferencesLoading() {
  return (
    <div className='mx-2 mt-8 mb-64 flex flex-col gap-4 sm:mx-8'>
      <div className='mb-4 flex flex-col gap-2 text-center text-white sm:text-start'>
        <h2 className='font-londrina text-4xl font-bold tracking-wider'>
          Präferenzen
        </h2>
        <p
          className='max-w-5xl font-medium text-secondary'
          aria-description='fairteiler preferences and settings'
        >
          Verwalte die Einstellungen deines Fairteilers. Du kannst die
          Sichtbarkeit steuern und die verfügbaren Optionen für Herkünfte,
          Kategorien und Betriebe im Retteformular anpassen. Neue Einträge
          können bei Bedarf vorgeschlagen und ergänzt werden.
        </p>
      </div>

      <FairteilerDisableSkeleton />
      <TutorialCardSkeleton />

      <Card className='h-max'>
        <CardHeader>
          <div className='flex flex-col gap-3 xs:flex-row'>
            <div className='flex size-10 min-w-10 items-center justify-center rounded-lg bg-primary/10'>
              <Settings className='size-5 text-primary' />
            </div>
            <div>
              <CardTitle>Formular-Einstellungen</CardTitle>
              <CardDescription>
                Verwalte die verfügbaren Optionen für Herkünfte, Kategorien und
                Betriebe im Retteformular
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <CatalogSelectionSkeleton title='Herkünfte' />
          <Separator />
          <CatalogSelectionSkeleton title='Kategorien' />
          <Separator />
          <CatalogSelectionSkeleton title='Betriebe' />
        </CardContent>
      </Card>
    </div>
  );
}
