'use client';

import { Check, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Dispatch, SetStateAction } from 'react';
import { ReportFilters, StringFilterKeys } from '../types';

interface ChartFilterProps {
  title: string;
  filterKey: StringFilterKeys;
  options: { label: string; value: string }[];
  filters: ReportFilters;
  setFilters: Dispatch<SetStateAction<ReportFilters>>;
}

export function ChartFilter({
  title,
  filterKey,
  options,
  filters,
  setFilters,
}: ChartFilterProps) {
  const selectedValues = new Set(filters[filterKey] ?? []);

  const toggleValue = (value: string) => {
    setFilters((prev) => {
      const current = prev[filterKey] ?? [];
      const exists = current.includes(value);
      return {
        ...prev,
        [filterKey]: exists
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  const clearFilter = () =>
    setFilters((prev) => {
      const updated = { ...prev };
      delete updated[filterKey];
      return updated;
    });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'border-dashed bg-input/40 font-normal',
            selectedValues.size ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          <PlusCircle className='size-4' />
          {title}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation='vertical' className='mx-2 h-4' />
              <Badge variant='secondary' className='lg:hidden'>
                {selectedValues.size}
              </Badge>
              <div className='hidden space-x-1 lg:flex'>
                {selectedValues.size > 2 ? (
                  <Badge variant='secondary'>
                    {selectedValues.size} ausgewählt
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge variant='secondary' key={option.value}>
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-[220px] p-0' align='start'>
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>Keine Ergebnisse gefunden</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    className='h-12'
                    onSelect={() => toggleValue(option.value)}
                  >
                    <div
                      className={cn(
                        'mr-2 flex size-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible',
                      )}
                    >
                      <Check className='size-3 text-white' />
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>

            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={clearFilter}
                    className='justify-center text-center'
                  >
                    Filter zurücksetzen
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
