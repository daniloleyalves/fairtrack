'use client';

import * as React from 'react';
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const DEFAULT_COUNTRY: CountryCode = 'DE';

const regionNames = new Intl.DisplayNames(['de'], { type: 'region' });

function flagEmoji(iso: string): string {
  return iso
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(0x1f1a5 + c.charCodeAt(0)));
}

interface CountryEntry {
  code: CountryCode;
  name: string;
  dial: string;
  flag: string;
}

const COUNTRIES: CountryEntry[] = getCountries()
  .map((code) => ({
    code,
    name: regionNames.of(code) ?? code,
    dial: `+${getCountryCallingCode(code)}`,
    flag: flagEmoji(code),
  }))
  .sort((a, b) => a.name.localeCompare(b.name, 'de'));

export interface PhoneInputProps {
  value: string;
  onChange: (e164: string) => void;
  defaultCountry?: CountryCode;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  id?: string;
  name?: string;
  'aria-invalid'?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  defaultCountry = DEFAULT_COUNTRY,
  disabled,
  className,
  placeholder,
  id,
  name,
  'aria-invalid': ariaInvalid,
}: PhoneInputProps) {
  const parsed = React.useMemo(
    () => (value ? parsePhoneNumberFromString(value) : undefined),
    [value],
  );

  const [country, setCountry] = React.useState<CountryCode>(
    parsed?.country ?? defaultCountry,
  );
  const [national, setNational] = React.useState<string>(() => {
    if (!parsed) return '';
    return new AsYouType(parsed.country).input(parsed.nationalNumber);
  });
  const [open, setOpen] = React.useState(false);

  // Sync from external value changes (e.g., form reset)
  React.useEffect(() => {
    if (!value) {
      setNational('');
      return;
    }
    const p = parsePhoneNumberFromString(value);
    if (p?.country) setCountry(p.country);
    if (p) {
      setNational(new AsYouType(p.country).input(p.nationalNumber));
    }
  }, [value]);

  function emit(nextCountry: CountryCode, nextNational: string) {
    const digits = nextNational.replace(/\D/g, '');
    if (!digits) {
      onChange('');
      return;
    }
    onChange(`+${getCountryCallingCode(nextCountry)}${digits}`);
  }

  function handleNationalChange(input: string) {
    const formatted = new AsYouType(country).input(input);
    setNational(formatted);
    emit(country, formatted);
  }

  function handleCountryChange(next: CountryCode) {
    setCountry(next);
    setOpen(false);
    // Reformat the current national number with the new country's rules
    if (national) {
      const digits = national.replace(/\D/g, '');
      const reformatted = new AsYouType(next).input(digits);
      setNational(reformatted);
    }
    emit(next, national);
  }

  const current = COUNTRIES.find((c) => c.code === country);

  return (
    <InputGroup className={className} data-disabled={disabled ? '' : undefined}>
      <InputGroupAddon align='inline-start' className='gap-1 pl-2'>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <InputGroupButton
              variant='ghost'
              size='sm'
              disabled={disabled}
              aria-label='Land auswählen'
              className='gap-1 px-2'
            >
              <span className='text-base leading-none'>{current?.flag}</span>
              <span className='text-muted-foreground'>{current?.dial}</span>
              <ChevronsUpDown className='size-3 opacity-50' />
            </InputGroupButton>
          </PopoverTrigger>
          <PopoverContent className='w-[300px] p-0' align='start'>
            <Command>
              <CommandInput placeholder='Land suchen…' />
              <CommandList>
                <CommandEmpty>Kein Land gefunden.</CommandEmpty>
                <CommandGroup>
                  {COUNTRIES.map((c) => (
                    <CommandItem
                      key={c.code}
                      value={`${c.name} ${c.dial} ${c.code}`}
                      onSelect={() => handleCountryChange(c.code)}
                    >
                      <span className='mr-2 text-base leading-none'>
                        {c.flag}
                      </span>
                      <span className='flex-1 truncate'>{c.name}</span>
                      <span className='ml-2 text-muted-foreground'>
                        {c.dial}
                      </span>
                      <Check
                        className={cn(
                          'ml-2 size-4',
                          c.code === country ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        name={name}
        type='tel'
        inputMode='tel'
        autoComplete='tel-national'
        value={national}
        placeholder={placeholder ?? '151 23456789'}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        onChange={(e) => handleNationalChange(e.target.value)}
      />
    </InputGroup>
  );
}
