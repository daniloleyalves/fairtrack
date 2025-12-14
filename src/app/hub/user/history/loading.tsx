import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserHistoryLoading() {
  const rowCount = 8;
  const colCount = 6;

  return (
    <div className='mx-2 mt-8 mb-64 sm:mx-8'>
      <div className='mb-6'>
        <Skeleton className='mb-2 h-8 w-48 rounded-md bg-secondary' />
        <Skeleton className='h-5 w-80 rounded-md bg-secondary' />
      </div>

      <Card>
        <CardContent className='p-6'>
          <div className='mb-4 flex flex-1 flex-col flex-wrap gap-2 md:flex-row md:items-center md:gap-4'>
            <Skeleton className='h-10 w-[250px] bg-secondary' />

            <Skeleton className='h-10 w-[200px] bg-secondary' />

            <div className='flex flex-wrap gap-2'>
              <Skeleton className='h-10 w-[120px] bg-secondary' />
              <Skeleton className='h-10 w-[100px] bg-secondary' />
              <Skeleton className='h-10 w-[110px] bg-secondary' />
              <Skeleton className='h-10 w-[90px] bg-secondary' />
            </div>
          </div>

          <div className='rounded-md border'>
            <table className='w-full'>
              <thead>
                <tr className='border-b'>
                  {Array.from({ length: colCount }).map((_, i) => (
                    <th
                      key={i}
                      className='h-12 px-4 text-left align-middle font-medium text-muted-foreground'
                    >
                      <Skeleton className='h-5 w-3/4 bg-secondary' />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: rowCount }).map((_, rowIndex) => (
                  <tr key={rowIndex} className='border-b transition-colors'>
                    {Array.from({ length: colCount }).map((_, colIndex) => (
                      <td key={colIndex} className='p-4 align-middle'>
                        <Skeleton className='h-6 w-full bg-secondary' />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='flex flex-col items-center justify-between gap-6 pt-4 sm:flex-row'>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-8 w-[100px] bg-secondary' />
            </div>

            <div className='flex items-center gap-2'>
              <Skeleton className='h-8 w-[70px] bg-secondary' />
              <Skeleton className='h-5 w-[120px] bg-secondary' />
              <Skeleton className='h-8 w-[70px] bg-secondary' />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
