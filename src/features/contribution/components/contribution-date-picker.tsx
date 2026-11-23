'use client';

import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { de } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  earliestContributionDay,
  toContributionDay,
} from '../lib/contribution-date';

interface ContributionDatePickerProps {
  value: string | null;
  onChange: (day: string | null) => void;
}

const toLocalDate = (day: string) => {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year, month - 1, date);
};

const toDisplay = (day: string) => day.split('-').reverse().join('.');

export function ContributionDatePicker({
  value,
  onChange,
}: ContributionDatePickerProps) {
  const [open, setOpen] = useState(false);
  const today = toContributionDay(new Date());
  const earliest = earliestContributionDay();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' className='gap-2 border-none'>
          <CalendarDays className='size-5' />
          <span className='hidden md:inline'>
            {value ? toDisplay(value) : 'Heute'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='end'>
        <div className='px-4 pt-3 text-sm font-medium'>Abgabedatum</div>
        <Calendar
          mode='single'
          locale={de}
          weekStartsOn={1}
          selected={toLocalDate(value ?? today)}
          defaultMonth={toLocalDate(value ?? today)}
          disabled={(date) => {
            const day = toContributionDay(
              new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12),
            );
            return day > today || day < earliest;
          }}
          onSelect={(date) => {
            if (!date) return;
            const day = [
              date.getFullYear(),
              String(date.getMonth() + 1).padStart(2, '0'),
              String(date.getDate()).padStart(2, '0'),
            ].join('-');
            onChange(day === today ? null : day);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
