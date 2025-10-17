import { Skeleton } from '@components/ui/skeleton';

export default function FairteilerContributionPageLoading() {
  return (
    <div className='mx-2 mt-8 mb-64 flex flex-col gap-3 sm:mx-8'>
      {/* Page Title and Buttons Skeleton */}
      <div className='mb-4 flex flex-col items-center gap-2 text-center text-white sm:flex-row sm:justify-between sm:text-start'>
        <Skeleton className='h-10 w-48 bg-secondary sm:w-64' /> {/* Title */}
        <div className='mt-2 flex flex-wrap gap-2 self-center sm:self-start'>
          <Skeleton className='h-10 w-28 rounded-md bg-secondary' />{' '}
          {/* Button 1 */}
          <Skeleton className='h-10 w-40 rounded-md bg-secondary' />{' '}
          {/* Button 2 */}
        </div>
      </div>

      {/* Main Card Skeleton (mimics ContributionTable Card) */}
      <div className='rounded-lg border bg-card text-card-foreground shadow-sm'>
        <div className='p-4 md:p-6'>
          {/* Table Skeleton */}
          <div className='rounded-md border'>
            <table className='w-full'>
              <thead>
                <tr className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'>
                  <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0'>
                    <Skeleton className='h-5 w-24 bg-secondary' />
                  </th>
                  <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0'>
                    <Skeleton className='h-5 w-20 bg-secondary' />
                  </th>
                  <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0'>
                    <Skeleton className='h-5 w-20 bg-secondary' />
                  </th>
                  <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0'>
                    <Skeleton className='h-5 w-24 bg-secondary' />
                  </th>
                  <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0'>
                    <Skeleton className='h-5 w-28 bg-secondary' />
                  </th>
                  <th className='w-[48px]'></th>
                </tr>
              </thead>
              <tbody>
                {/* Single row for initial loading prompt */}
                <tr className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'>
                  <td
                    className='p-4 align-middle [&:has([role=checkbox])]:pr-0'
                    colSpan={6}
                  >
                    <Skeleton className='mx-auto h-5 w-2/3 bg-secondary' />
                    <Skeleton className='mx-auto mt-2 h-4 w-1/4 bg-secondary' />
                  </td>
                </tr>
                {/* "Add" button skeleton */}
                <tr className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'>
                  <td
                    className='p-4 align-middle [&:has([role=checkbox])]:pr-0'
                    colSpan={6}
                  >
                    <div className='flex justify-center'>
                      <Skeleton className='size-12 rounded-full bg-secondary' />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bottom controls skeleton */}
          <div className='mt-4 flex w-full items-start justify-between gap-4 md:items-center'>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-6 w-10 rounded-full bg-secondary' />{' '}
              {/* Switch */}
              <Skeleton className='h-4 w-28 bg-secondary' /> {/* Label */}
            </div>
            <Skeleton className='h-10 w-32 rounded-md bg-secondary' />{' '}
            {/* Submit Button */}
          </div>
        </div>
      </div>
    </div>
  );
}
