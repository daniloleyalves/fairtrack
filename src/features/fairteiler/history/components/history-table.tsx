'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TimespanPicker } from '@/features/statistics/components/timespan-picker';
import { useIsTablet } from '@/lib/hooks/use-devices';
import { vContribution } from '@/server/db/db-types';
import {
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { DataFilter } from '../../../statistics/components/data-filter';
import { columns } from '../history-table-config';
import { usePaginationState } from '../use-history-pagination';

interface DataTableProps<TData> {
  data: TData[];
  loadingControls?: React.ReactNode;
}

export function HistoryTable({
  data,
  loadingControls,
}: DataTableProps<vContribution>) {
  const isTablet = useIsTablet();

  // Separate pagination state management
  const { pageIndex, pageSize, setPageIndex, setPageSize } =
    usePaginationState();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    category: false,
  });
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: { pageIndex, pageSize }, // Controlled pagination state
    },

    // Pagination configuration
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({ pageIndex, pageSize });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      } else {
        setPageIndex(updater.pageIndex);
        setPageSize(updater.pageSize);
      }
    },

    // Other table configuration
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,

    // Core models
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // Client-side pagination
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),

    // Manual control
    manualPagination: false, // Client-side pagination
  });

  const categoryOptions = () => {
    const categories = new Set<string>();
    data.forEach((item: vContribution) => {
      if (item.categoryName) {
        categories.add(item.categoryName);
      }
    });
    return Array.from(categories)
      .sort()
      .map((category) => ({
        label: category,
        value: category,
      }));
  };

  const originOptions = () => {
    const origins = new Set<string>();
    data.forEach((item: vContribution) => {
      if (item.originName) {
        origins.add(item.originName);
      }
    });
    return Array.from(origins)
      .sort()
      .map((origin) => ({
        label: origin,
        value: origin,
      }));
  };

  const companyOptions = () => {
    const companies = new Set<string>();
    data.forEach((item: vContribution) => {
      if (item.companyName) {
        companies.add(item.companyName);
      }
    });
    return Array.from(companies)
      .sort()
      .map((company) => ({
        label: company,
        value: company,
      }));
  };

  useEffect(() => {
    if (isTablet) {
      setColumnVisibility((prev) => ({
        ...prev,
        company: false,
        origin: false,
      }));
    } else {
      setColumnVisibility((prev) => ({ ...prev, company: true, origin: true }));
    }
  }, [isTablet]);

  return (
    <div className='w-full'>
      <div className='flex flex-1 flex-col flex-wrap gap-2 md:flex-row md:items-center md:gap-4'>
        <Input
          placeholder='Lebensmittel filtern...'
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('title')?.setFilterValue(event.target.value)
          }
          className='max-w-sm'
        />

        <TimespanPicker
          onDateRangeChange={(e) =>
            table.getColumn('date')?.setFilterValue({ from: e.from, to: e.to })
          }
        />

        <div className='flex gap-2'>
          {table.getColumn('category') && (
            <DataFilter
              column={table.getColumn('category')}
              title='Kategorie'
              options={categoryOptions()}
            />
          )}

          {table.getColumn('origin') && (
            <DataFilter
              column={table.getColumn('origin')}
              title='Herkunft'
              options={originOptions()}
            />
          )}

          {table.getColumn('company') && (
            <DataFilter
              column={table.getColumn('company')}
              title='Betrieb'
              options={companyOptions()}
            />
          )}
        </div>
      </div>

      <div className='mt-4 rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='text-center'>
                  Keine Ergebnisse gefunden
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex flex-col items-center justify-between gap-6 pt-4 sm:flex-row'>
        {/* Loading controls on the left */}
        <div className='flex items-center gap-2'>{loadingControls}</div>

        {/* Pagination controls on the right */}
        <div className='flex items-center gap-2'>
          <Button
            className='bg-input/40'
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Zurück
          </Button>

          <span className='text-sm text-muted-foreground sm:hidden lg:block'>
            Seite {table.getState().pagination.pageIndex + 1} von{' '}
            {table.getPageCount()}
          </span>

          <Button
            className='bg-input/40'
            variant='outline'
            size='sm'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Weiter
          </Button>
        </div>
      </div>
    </div>
  );
}
