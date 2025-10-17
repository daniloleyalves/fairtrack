import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import { Separator } from '@components/ui/separator';
import { Skeleton } from '@components/ui/skeleton';

export default function FairteilerPreferencesLoading() {
  return (
    <div className='mx-2 mt-8 mb-64 flex flex-col gap-4 sm:mx-8'>
      <div className='mb-4 flex flex-col gap-2 text-center text-white sm:text-start'>
        <h2 className='font-londrina text-4xl font-bold tracking-wider'>
          Präferenzen
        </h2>
        <p
          className='max-w-5xl font-medium text-secondary'
          aria-description='form to add access view to fairteiler'
        >
          Wähle hier die Herkünfte, Kategorien und Betriebe aus, die für diesen
          Fairteiler relevant sind. Diese Auswahl steuert die angezeigten
          Optionen im Retteformular. Neue Einträge können bei Bedarf
          vorgeschlagen und ergänzt werden.
        </p>
      </div>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'>
        {Array.from({ length: 3 }).map((_, i) => {
          return (
            <Card className='h-max' key={i}>
              <CardHeader>
                <CardTitle>
                  <Skeleton className='h-4 w-48 bg-secondary' />
                </CardTitle>
                <CardDescription>
                  <Skeleton className='mt-1 h-3 w-full bg-secondary' />
                  <Skeleton className='mt-1 size-3/4 bg-secondary' />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className='h-[70px] w-full bg-secondary' />
              </CardContent>
              <Separator />
              <CardHeader>
                <CardTitle>
                  <Skeleton className='h-4 w-40 bg-secondary' />
                </CardTitle>
                <CardDescription>
                  <Skeleton className='mt-1 h-3 w-full bg-secondary' />
                  <Skeleton className='mt-1 h-3 w-full bg-secondary' />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='flex h-50 flex-col gap-2'>
                  <Skeleton className='h-[50px] w-full bg-secondary' />
                  <Skeleton className='h-[50px] w-full bg-secondary' />
                  <Skeleton className='h-[50px] w-full bg-secondary' />
                </div>
              </CardContent>
              <Separator />
              <CardHeader>
                <CardTitle>
                  <Skeleton className='h-4 w-40 bg-secondary' />
                </CardTitle>
                <CardDescription>
                  <Skeleton className='mt-1 h-3 w-full bg-secondary' />
                  <Skeleton className='mt-1 h-3 w-full bg-secondary' />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className='h-[32px] w-full bg-secondary' />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
