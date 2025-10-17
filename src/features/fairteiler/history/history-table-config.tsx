'use client';

import { ContributionInfoModal } from '@/features/fairteiler/contribution-info-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { fetcher } from '@/lib/services/swr';
import { formatNumber } from '@/lib/utils';
import { vContribution } from '@/server/db/db-types';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { formatInTimeZone } from 'date-fns-tz';
import {
  ArrowUpDown,
  Edit,
  Eye,
  History,
  Loader2,
  MoreHorizontal,
} from 'lucide-react';
import Image from 'next/image';
import { Suspense, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { preload } from 'swr';
import { HistoryEditModal } from './components/history-edit-modal';
import { HistoryVersionHistory } from './components/history-version-history';
import { FAIRTEILER_CONTRIBUTION_VERSION_HISTORY } from '@/lib/config/api-routes';

export const columns: ColumnDef<vContribution>[] = [
  {
    id: 'date',
    accessorKey: 'contributionDate',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='h-8 px-2'
        >
          Datum
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = formatInTimeZone(row.getValue('date'), 'UTC', 'dd.MM.yyyy');
      return <div className='max-w-[100px] text-center'>{date}</div>;
    },
    filterFn: (row, _columnId, filterValue: DateRange) => {
      if (!filterValue?.from || !filterValue?.to || !row.getValue('date')) {
        return false;
      }

      const startDate = new Date(filterValue.from);
      const endDate = new Date(filterValue.to);
      endDate.setHours(23, 59, 59, 999);
      const dateValue = new Date(row.getValue('date'));

      return dateValue >= startDate && dateValue <= endDate;
    },
  },
  {
    id: 'title',
    header: 'Lebensmittel',
    accessorKey: 'foodTitle',
    cell: ({ row }) => {
      return (
        <div className='flex w-full min-w-[180px] items-center gap-2 font-medium'>
          {row.original.categoryImage && (
            <Image
              src={row.original.categoryImage || ''}
              alt='category icon'
              width={40}
              height={40}
              className='size-10 rounded'
            />
          )}
          <span>{row.getValue('title')}</span>
        </div>
      );
    },
  },
  {
    id: 'category',
    header: 'Kategorie',
    accessorKey: 'categoryName',
    filterFn: (row, id, value: string) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: 'origin',
    header: 'Herkunft',
    accessorKey: 'originName',
    filterFn: (row, id, value: string) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: 'company',
    header: 'Betrieb',
    accessorKey: 'companyName',
    filterFn: (row, id, value: string) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: 'quantity',
    accessorKey: 'quantity',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='h-8 px-2'
        >
          Menge (kg)
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className='max-w-[125px] text-center'>
          {formatNumber(row.getValue('quantity'))}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <RowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
];

const RowActions = ({ row }: { row: Row<vContribution> }) => {
  const historyItem = row.original;

  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);

  const preloadContributionVersionHistory = () => {
    preload(
      `${FAIRTEILER_CONTRIBUTION_VERSION_HISTORY}?checkinId=${row.original.checkinId}`,
      fetcher,
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='size-8 p-0'
            onPointerDown={preloadContributionVersionHistory}
          >
            <span className='sr-only'>Menü öffnen</span>
            <MoreHorizontal className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => setIsInfoOpen(true)}>
            <Eye />
            Info anzeigen
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Edit />
            Bearbeiten
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <Popover
            open={isVersionHistoryOpen}
            onOpenChange={(open) => setIsVersionHistoryOpen(open)}
          >
            <PopoverTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <History />
                Versionsverlauf
              </DropdownMenuItem>
            </PopoverTrigger>
            <PopoverContent
              className='w-80'
              onFocusOutside={(e) => e.preventDefault()}
            >
              <Suspense fallback={<Loader2 className='mx-auto animate-spin' />}>
                <HistoryVersionHistory checkinId={historyItem.checkinId} />
              </Suspense>
            </PopoverContent>
          </Popover>
        </DropdownMenuContent>
      </DropdownMenu>

      <ContributionInfoModal
        item={historyItem}
        open={isInfoOpen}
        setOpen={setIsInfoOpen}
      />

      <HistoryEditModal
        item={historyItem}
        open={isEditOpen}
        setOpen={setIsEditOpen}
      />
    </>
  );
};
