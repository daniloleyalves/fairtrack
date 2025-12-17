'use client';

import { cn } from '@/lib/utils';
import { addDays, differenceInCalendarDays, startOfToday } from 'date-fns';
import { LucideIcon } from 'lucide-react';
import React, {
  forwardRef,
  InputHTMLAttributes,
  KeyboardEvent,
  useEffect,
  useState,
} from 'react';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';

/**
 * A utility to restrict keyboard input in the number field.
 * Allows numbers, a single decimal point, and navigation keys.
 */
const restrictNumericInput = (e: KeyboardEvent<HTMLInputElement>) => {
  // Allow navigation and editing keys
  if (
    [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
    ].includes(e.key)
  ) {
    return;
  }

  // Prevent input if it's not a digit or a decimal point
  if (!/[0-9.]/.test(e.key)) {
    e.preventDefault();
    return;
  }

  // Prevent multiple decimal points
  const currentValue = (e.target as HTMLInputElement).value;
  if (e.key === '.' && currentValue.includes('.')) {
    e.preventDefault();
  }
};

export interface NumberInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value'
> {
  value: number;
  onChange: (value: number) => void;
  maxValue?: number;
  enableSmallIncrements?: boolean;
  iconWhenZero?: LucideIcon;
  inputWidth?: number;
  index?: number;
  preventAutoFocus?: boolean;
}

const QuantityIncrementer = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      name,
      value,
      onChange,
      maxValue,
      enableSmallIncrements = false,
      iconWhenZero,
      inputWidth,
      className,
      index,
      preventAutoFocus = false,
      ...props
    },
    ref,
  ) => {
    const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

    useEffect(() => {
      if (enableSmallIncrements && value?.toString().length > 4) {
        const roundedValue = parseFloat(value.toFixed(2));
        if (value !== roundedValue) {
          onChange(roundedValue);
        }
      }
    }, [value, enableSmallIncrements, onChange]);

    const IconComponent = iconWhenZero;

    const handleValueChange = (adjustment: number) => {
      const currentValue = Number(value) || 0;
      let newValue = parseFloat((currentValue + adjustment).toPrecision(15));

      // Ensure minimum is 0, as we don't want past dates
      if (newValue < 0) {
        newValue = 0;
      }

      if (maxValue !== undefined && newValue > maxValue) {
        newValue = maxValue;
      }

      onChange(newValue);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const stringValue = e.target.value;
      if (stringValue === '' || stringValue === '-') {
        // If input is empty or just '-', treat as 0 for QuantityIncrementer's internal state
        // The adapter will handle converting 0 days to null for the form.
        onChange(0);
        return;
      }
      const numValue = parseFloat(stringValue);
      if (!isNaN(numValue)) {
        // Ensure manual input also respects the minimum of 0
        onChange(Math.max(0, numValue));
      }
    };

    return (
      <div className={cn('relative flex w-min rounded-l', className)}>
        {/* --- Decrement Buttons --- */}
        <Button
          type='button'
          variant='outline'
          className='rounded-none rounded-l-lg'
          disabled={value <= 0} // Disable when value is 0 or less
          onClick={() => handleValueChange(-1)}
        >
          {enableSmallIncrements ? '--' : '-'}
        </Button>
        {enableSmallIncrements && (
          <Button
            type='button'
            variant='outline'
            className='rounded-none border-l-0'
            disabled={value <= 0} // Disable when value is 0 or less
            onClick={() => handleValueChange(-0.01)}
          >
            -
          </Button>
        )}

        {/* --- Input Field with Icon --- */}
        <div className='relative'>
          <Input
            data-cy={`quantity-incrementer-${index}`}
            ref={ref}
            name={name}
            value={value}
            onChange={handleInputChange}
            onFocus={(e) => {
              if (preventAutoFocus) {
                e.target.blur();
                return;
              }
              setIsInputFocused(true);
            }}
            onBlur={() => setIsInputFocused(false)}
            onKeyDown={restrictNumericInput}
            step={enableSmallIncrements ? 0.01 : 1}
            max={maxValue}
            min={0} // Explicitly set min to 0 to prevent negative visual input
            type='number'
            autoFocus={false}
            className='max-w-[100px] min-w-[55px] rounded-none border-x-0 text-center font-medium'
            style={{
              color:
                value === 0 && IconComponent && !isInputFocused
                  ? 'transparent'
                  : 'inherit',
              width: inputWidth ? `${inputWidth}px` : undefined,
            }}
            {...props}
          />
          {value === 0 && IconComponent && !isInputFocused && (
            <span className='pointer-events-none absolute inset-0 flex items-center justify-center'>
              <IconComponent className='size-5 text-muted-foreground' />
            </span>
          )}
        </div>

        {/* --- Increment Buttons --- */}
        {enableSmallIncrements && (
          <Button
            type='button'
            variant='outline'
            className='rounded-none border-r-0'
            disabled={!!maxValue && value >= maxValue}
            onClick={() => handleValueChange(0.01)}
          >
            +
          </Button>
        )}
        <Button
          type='button'
          variant='outline'
          className='rounded-none rounded-r-lg'
          disabled={!!maxValue && value >= maxValue}
          onClick={() => handleValueChange(1)}
        >
          {enableSmallIncrements ? '++' : '+'}
        </Button>
      </div>
    );
  },
);
QuantityIncrementer.displayName = 'QuantityIncrementer';

export { QuantityIncrementer };

// --------------------------------------------------

function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

export function DaysToDateAdapter({
  value,
  onChange,
  ...props
}: {
  value: Date | null;
  onChange: (value: Date | null) => void;
  name?: string;
  maxValue?: number;
  enableSmallIncrements?: boolean;
  iconWhenZero?: LucideIcon;
  inputWidth?: number;
  className?: string;
}) {
  const today = startOfToday();

  // --- Step 1: Derive the UI value directly from props during render ---
  // This is a pure calculation, no state or effects needed here.
  const valueInDays = isDate(value)
    ? Math.max(0, differenceInCalendarDays(value, today))
    : 0;

  // --- Step 2: Handle the side effect of cleaning up invalid initial props ---
  // This effect runs only if the `value` prop is invalid.
  useEffect(() => {
    if (isDate(value)) {
      // If the date is in the past...
      if (differenceInCalendarDays(value, today) < 0) {
        // ...tell the parent to set it to null.
        onChange(null);
      }
    } else if (value !== null) {
      // If the value is not a Date but also not null (e.g., undefined),
      // normalize it to null.
      onChange(null);
    }
    // This effect only runs when the `value` prop from the parent changes.
  }, [value, today, onChange]);

  // --- Step 3: Create the callback for the UI component ---
  // This translates the number from the UI back to a Date for the parent.
  const handleDaysChange = (days: number) => {
    // If days is 0, set form value to null
    if (days === 0) {
      onChange(null);
    } else {
      // Otherwise, convert the number of days back to a Date.
      const newDate = addDays(today, days);
      onChange(newDate);
    }
  };

  return (
    <QuantityIncrementer
      value={valueInDays}
      onChange={handleDaysChange}
      min={0}
      {...props}
    />
  );
}
