'use client';

import * as React from 'react';
import { ComponentProps } from 'react';
import { DayPicker, type DayButtonProps } from 'react-day-picker';
import { cn, formatNumber } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../../components/ui/popover';
import { Button } from '../../../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { Calendar } from '../../../../components/ui/calendar';
import { useIsTablet } from '@/lib/hooks/use-devices';
import { formatDate } from 'date-fns';
import { CalendarDays } from 'lucide-react';

interface DataPoint {
  value: string;
  quantity: number;
}

interface CustomDayButtonComponentProps extends DayButtonProps {
  dataMap: Map<string, DataPoint>;
  unit?: string;
}

function CustomDayButtonComponent({
  day,
  modifiers,
  dataMap,
  unit,
}: CustomDayButtonComponentProps) {
  const isSmallScreen = useIsTablet();

  const key = formatDate(day.date, 'yyyy-MM-dd');
  const dayData = dataMap.get(key);
  const isSelected = !!dayData;

  const dayNumber = day.date.getDate();

  if (isSelected) {
    if (isSmallScreen) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='default'
              className={cn(
                'mx-auto flex h-full w-10 flex-col items-center justify-center gap-0 p-1 xs:w-full',
                { 'opacity-50': modifiers.outside },
              )}
            >
              {dayNumber}
              <span className='mt-0.5 size-1 rounded-full bg-white/80'></span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto rounded-lg border-none p-0'>
            <div className='relative flex size-[100px] flex-col items-center justify-center rounded-lg bg-primary text-primary-foreground'>
              <div className='absolute top-2 right-2 text-sm'>{dayNumber}</div>
              <div className='flex flex-col text-center font-londrina font-bold'>
                <span className='text-4xl'>
                  {formatNumber(dayData.quantity)}
                </span>
                {unit && <span className='text-xs font-normal'>{unit}</span>}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      );
    }

    return (
      <div
        className={cn(
          'mx-auto flex h-full w-10 flex-col items-center justify-center rounded-lg bg-primary p-1 text-primary-foreground xs:w-full',
          { 'opacity-50': modifiers.outside },
        )}
      >
        <div className='absolute top-1.5 right-1.5 text-xs'>{dayNumber}</div>
        <div
          className={cn(
            'gap-1 text-center font-londrina leading-tight font-bold xl:flex-row',
            dayData.quantity.toLocaleString().length < 5
              ? 'flex items-end'
              : 'mt-2',
          )}
        >
          <div
            className={cn(
              'xl:[32px] text-xl',
              dayData.quantity.toLocaleString().replace(/,/g, '').length > 2
                ? 'h-[20px] xl:text-2xl'
                : 'h-[24px] xl:text-3xl',
            )}
          >
            {formatNumber(dayData.quantity)}
          </div>{' '}
          {unit && (
            <div className='h-[12px] text-xs font-normal xl:mt-2'>{unit}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Button
      variant='ghost'
      className={cn('mx-auto h-full w-8 xs:w-full', {
        'text-muted-foreground': modifiers.outside,
      })}
    >
      {dayNumber}
    </Button>
  );
}

interface DataCalendarProps
  extends Omit<ComponentProps<typeof DayPicker>, 'selected' | 'mode'> {
  data: DataPoint[];
  unit?: string;
}

export function DataCalendar({
  className,
  data,
  unit,
  ...props
}: DataCalendarProps) {
  const dataMap = new Map<string, DataPoint>();
  for (const item of data) {
    const key = item.value.split('T')[0];
    dataMap.set(key, item);
  }

  const selectedDates = data
    .map((item) => new Date(item.value))
    .sort((a, b) => a.getTime() - b.getTime());

  return (
    <div className='w-full'>
      <Card>
        <CardHeader className='px-4 xs:px-6'>
          <CardTitle className='flex items-center gap-2'>
            <CalendarDays className='size-5' />
            Kalender
          </CardTitle>
        </CardHeader>
        <CardContent className='px-2 xs:px-6'>
          <Calendar
            mode='multiple'
            selected={selectedDates}
            weekStartsOn={1}
            defaultMonth={selectedDates[selectedDates.length - 1] || new Date()}
            components={{
              DayButton: (dayButtonProps) => (
                <CustomDayButtonComponent
                  {...dayButtonProps}
                  dataMap={dataMap}
                  unit={unit}
                />
              ),
            }}
            modifiersClassNames={{
              selected:
                'bg-transparent text-current hover:bg-transparent focus:bg-transparent',
            }}
            className={cn('w-full p-0', className)}
            showOutsideDays
            {...props}
          />
        </CardContent>
      </Card>
    </div>
  );
}
