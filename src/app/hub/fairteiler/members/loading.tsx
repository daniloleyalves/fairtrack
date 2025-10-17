import { Skeleton } from '@components/ui/skeleton';

export default function FairteilerMemberPageLoading() {
  return (
    <div className='mx-2 mt-8 mb-64 flex flex-col gap-4 sm:mx-8'>
      <div className='mb-4 flex flex-col gap-2 text-center text-white sm:text-start'>
        <h2 className='font-londrina text-4xl font-bold tracking-wider'>
          Mitglieder
        </h2>
        <p
          className='max-w-5xl font-medium text-secondary'
          aria-description='form to add access view to fairteiler'
        >
          Lade Teammitglieder ein, verwalte ihre Rollen und erstelle
          individuelle Zugangsprofile – z.B. für Mitarbeitende oder als
          Gastzugänge.
        </p>
      </div>
      <Skeleton className='h-[250px] w-full' />
      <Skeleton className='h-[250px] w-full' />
    </div>
  );
}
