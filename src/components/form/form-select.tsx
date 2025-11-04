'use client';

import { Control, FieldValues, Path } from 'react-hook-form';
import { GenericItem } from '@server/db/db-types';
import { FormControl, FormField, FormItem } from '@components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@components/ui/select';
import React from 'react';

interface FormSelectProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  options: GenericItem[] | null | undefined;
  placeholder: string;
  isLoading?: boolean;
  isError?: boolean;
  cypressIdentifier?: string;
  className?: string;
}

export function FormSelect<T extends FieldValues>({
  name,
  control,
  options,
  isLoading,
  isError,
  placeholder,
  cypressIdentifier,
  className,
  ref,
}: FormSelectProps<T> & { ref?: React.Ref<HTMLButtonElement> }) {
  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem>
          <Select onValueChange={field.onChange} value={field.value ?? ''}>
            <FormControl>
              <SelectTrigger
                ref={ref}
                className={className}
                disabled={isLoading ?? isError}
                data-cy={cypressIdentifier}
              >
                {options?.find((item) => item.id === field.value)?.name ??
                  placeholder}
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options?.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
}
