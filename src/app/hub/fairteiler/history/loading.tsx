import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function FairteilerHistoryLoading() {
  const rowCount = 8;
  const colCount = 5;

  return (
    <Card>
      <CardContent>
        <div className='flex items-center pb-4'>
          {/* Input skeleton */}
          <Skeleton className='h-8 w-[250px] bg-secondary' />
        </div>
        <div className='rounded-md border'>
          <table className='w-full'>
            <thead>
              <tr className='border-b'>
                {Array.from({ length: colCount }).map((_, i) => (
                  <th
                    key={i}
                    className='h-10 px-4 text-left align-middle font-medium text-muted-foreground'
                  >
                    {/* Header skeleton */}
                    <Skeleton className='h-5 w-3/4 bg-secondary' />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rowCount }).map((_, rowIndex) => (
                <tr key={rowIndex} className='border-b transition-colors'>
                  {Array.from({ length: colCount }).map((_, colIndex) => (
                    <td
                      key={colIndex}
                      className='p-4 align-middle [&:has([role=checkbox])]:pr-0'
                    >
                      {/* Cell content skeleton */}
                      <Skeleton className='h-6 w-full bg-secondary' />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination skeleton */}
        <div className='flex items-center justify-end space-x-2 py-4'>
          <Skeleton className='h-8 w-[150px]' />
          <Skeleton className='h-8 w-[70px]' /> {/* "Zurück" button */}
          <Skeleton className='h-8 w-[70px]' /> {/* "Weiter" button */}
        </div>
      </CardContent>
    </Card>
  );
}
