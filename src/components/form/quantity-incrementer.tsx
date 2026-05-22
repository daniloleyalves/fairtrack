'use client';

import { cn } from '@/lib/utils';
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

  // Prevent input if it's not a digit, decimal point, or comma
  if (!/[0-9.,]/.test(e.key)) {
    e.preventDefault();
    return;
  }

  // Treat comma as decimal separator: prevent if there's already a decimal
  const currentValue = (e.target as HTMLInputElement).value;
  if (
    (e.key === '.' || e.key === ',') &&
    (currentValue.includes('.') || currentValue.includes(','))
  ) {
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
  showStepperButtons?: boolean;
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
      showStepperButtons = true,
      ...props
    },
    ref,
  ) => {
    const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
    const [inputText, setInputText] = useState<string>('');

    useEffect(() => {
      if (enableSmallIncrements && value?.toString().length > 4) {
        const roundedValue = parseFloat(value.toFixed(2));
        if (value !== roundedValue) {
          onChange(roundedValue);
        }
      }
    }, [value, enableSmallIncrements, onChange]);

    const IconComponent = iconWhenZero;

    // Format number with comma for display when not focused
    const displayValue = isInputFocused
      ? inputText
      : String(value).replace('.', ',');

    const handleValueChange = (adjustment: number) => {
      const currentValue = Number(value) || 0;
      let newValue = parseFloat((currentValue + adjustment).toPrecision(15));

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
      setInputText(stringValue);

      if (stringValue === '' || stringValue === '-') {
        onChange(0);
        return;
      }
      // Normalize comma to period for parsing
      const normalized = stringValue.replace(',', '.');
      const numValue = parseFloat(normalized);
      if (!isNaN(numValue)) {
        onChange(Math.max(0, numValue));
      }
    };

    const handleFocus = () => {
      setIsInputFocused(true);
      setInputText(String(value).replace('.', ','));
    };

    const handleBlur = () => {
      setIsInputFocused(false);
    };

    return (
      <div className={cn('relative flex w-min rounded-l', className)}>
        {/* --- Decrement Buttons --- */}
        {showStepperButtons && (
          <>
            <Button
              type='button'
              variant='outline'
              className='rounded-none rounded-l-lg'
              disabled={value <= 0}
              onClick={() => handleValueChange(-1)}
            >
              {enableSmallIncrements ? '--' : '-'}
            </Button>
            {enableSmallIncrements && (
              <Button
                type='button'
                variant='outline'
                className='rounded-none border-l-0'
                disabled={value <= 0}
                onClick={() => handleValueChange(-0.01)}
              >
                -
              </Button>
            )}
          </>
        )}

        {/* --- Input Field with Icon --- */}
        <div className='relative'>
          <Input
            data-cy={`quantity-incrementer-${index}`}
            ref={ref}
            name={name}
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={restrictNumericInput}
            inputMode='decimal'
            type='text'
            autoFocus={false}
            tabIndex={preventAutoFocus ? -1 : undefined}
            className={cn(
              'max-w-[100px] min-w-[55px] text-center font-medium',
              showStepperButtons ? 'rounded-none border-x-0' : 'rounded-lg',
            )}
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
        {showStepperButtons && (
          <>
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
          </>
        )}
      </div>
    );
  },
);
QuantityIncrementer.displayName = 'QuantityIncrementer';

export { QuantityIncrementer };
