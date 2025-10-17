'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { defaultDateRange } from '@/lib/config/site-config';
import { cn } from '@/lib/utils';
import {
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
  subMonths,
  subYears,
} from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { de } from 'date-fns/locale';
import { Clock } from 'lucide-react';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

interface TimespanPickerProps {
  dateRange?: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  className?: string;
}

export function TimespanPicker({
  dateRange = defaultDateRange,
  onDateRangeChange,
  className,
}: TimespanPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange>(dateRange);

  const today = new Date();
  const currentYear = today.getFullYear();

  const quickOptions = [
    {
      label: 'Gesamter Zeitraum',
      range: {
        from: new Date(2023, 0, 1),
        to: new Date(currentYear, 11, 31, 23, 59, 59),
      },
    },
    {
      label: 'Dieses Jahr',
      range: {
        from: startOfYear(today),
        to: today,
      },
    },
    {
      label: 'Letztes Jahr',
      range: {
        from: startOfYear(subYears(today, 1)),
        to: endOfYear(subYears(today, 1)),
      },
    },
    {
      label: 'Dieser Monat',
      range: {
        from: startOfMonth(today),
        to: today,
      },
    },
    {
      label: 'Letzter Monat',
      range: {
        from: startOfMonth(subMonths(today, 1)),
        to: endOfMonth(subMonths(today, 1)),
      },
    },
  ];

  const formatDateRange = (range: DateRange, showLabel = false) => {
    if (!range.from || !range.to) return 'Zeitraum auswählen';

    const option = quickOptions.find(
      (option) =>
        range.from?.toDateString() === option.range.from.toDateString() &&
        range.to?.toDateString() === option.range.to.toDateString(),
    );
    if (option && showLabel) {
      return option.label;
    }

    if (range.from.getTime() === range.to.getTime()) {
      return formatInTimeZone(range.from, 'UTC', 'dd.MM.yyyy');
    }

    return `${formatInTimeZone(range.from, 'UTC', 'dd.MM.yyyy')} - ${formatInTimeZone(range.to, 'UTC', 'dd.MM.yyyy')}`;
  };

  const isQuickOptionSelected = (option: DateRange) => {
    if (!tempRange.from || !tempRange.to || !option.from || !option.to)
      return false;

    return (
      tempRange.from.toDateString() === option.from.toDateString() &&
      tempRange.to.toDateString() === option.to.toDateString()
    );
  };

  const handleQuickOptionSelect = (option: DateRange) => {
    setTempRange(option);
    onDateRangeChange(option);
    setIsOpen(false);
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    if (range) {
      setTempRange(range);
      if (range.from && range.to) {
        onDateRangeChange(range);
        setIsOpen(false);
      }
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'max-w-[280px] bg-input/40 font-normal',
            !tempRange.from && 'text-muted-foreground',
            className,
          )}
        >
          <Clock className='size-4' />
          {formatDateRange(tempRange, true)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <div className='flex flex-col md:flex-row'>
          <div className='flex flex-col gap-2 border-b p-4 md:border-r md:border-b-0'>
            <div className='px-2 text-sm font-medium'>Zeitraum wählen</div>
            <div className='grid min-w-[250px] gap-1'>
              {quickOptions.map((option, index) => (
                <Button
                  key={index}
                  variant='ghost'
                  className={cn(
                    'flex h-12 justify-between font-normal',
                    isQuickOptionSelected(option.range) && 'bg-accent',
                  )}
                  onClick={() => handleQuickOptionSelect(option.range)}
                >
                  <span>{option.label}</span>
                  <span className='text-xs text-muted-foreground'>
                    {formatDateRange(option.range, false)}
                  </span>
                </Button>
              ))}
            </div>
          </div>
          <div className='p-4'>
            <Calendar
              mode='range'
              defaultMonth={today}
              selected={tempRange}
              onSelect={handleCalendarSelect}
              numberOfMonths={1}
              locale={de}
              disabled={(date) => date > today}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
