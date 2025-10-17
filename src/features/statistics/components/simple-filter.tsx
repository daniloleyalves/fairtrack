'use client';

import { cn } from '@/lib/utils';
import { Check, CirclePlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '../../../components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/ui/popover';
import { Separator } from '../../../components/ui/separator';

export function SimpleFilter({
  title,
  options,
  onChange,
}: {
  title: string;
  options: {
    title: string;
    value?: string;
  }[];
  onChange?: (set: Set<string>) => void;
}) {
  const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set());

  useEffect(() => {
    onChange?.(selectedValues);
  }, [selectedValues, onChange]);

  const toggle = (value: string) => {
    setSelectedValues((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return newSet;
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            'h-auto flex-wrap border-dashed bg-input/40 text-xs font-normal sm:text-sm',
            selectedValues.values().toArray().length
              ? 'text-foreground'
              : 'text-muted-foreground',
          )}
          variant='outline'
          size='sm'
        >
          <CirclePlus />
          {title}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation='vertical' className='mx-2 h-4' />
              <Badge variant='secondary' className='font-normal lg:hidden'>
                {selectedValues.size}
              </Badge>
              <div className='hidden flex-wrap gap-1 lg:flex'>
                {selectedValues.size > 2 ? (
                  <Badge variant='secondary' className='font-normal'>
                    {selectedValues.size} ausgewählt
                  </Badge>
                ) : (
                  options
                    .filter((opt) => selectedValues.has(opt.value ?? opt.title))
                    .map((option) => (
                      <Badge
                        key={option.value}
                        variant='secondary'
                        className='font-normal break-words'
                      >
                        {option.title}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-[220px] p-0'
        align='start'
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>Keine Ergebnisse gefunden</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                return (
                  <CommandItem
                    key={option.value ?? option.title}
                    value={option.title}
                    onSelect={() => toggle(option.value ?? option.title)}
                  >
                    <div
                      className={cn(
                        'mr-2 flex size-4 items-center justify-center rounded-full border border-primary',
                        selectedValues.has(option.value ?? option.title)
                          ? 'bg-primary'
                          : 'opacity-50 [&_svg]:invisible',
                      )}
                    >
                      <Check className='size-3 text-white' />
                    </div>

                    <span>{option.title}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    className='justify-center'
                    onSelect={() => setSelectedValues(new Set())}
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
