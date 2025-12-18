'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { FormControl, FormField, FormItem } from '@components/ui/form';
import { TableCell, TableRow } from '@components/ui/table';
import { GenericItem } from '@server/db/db-types';
import { differenceInCalendarDays, startOfToday } from 'date-fns';
import {
  Edit,
  InfinityIcon,
  MoreHorizontal,
  PlusCircle,
  Save,
  Trash2,
  Apple,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { ContributionFormValues } from '@features/contribution/schemas/contribution-schema';
import { OptionalFieldsModal } from './optional-fields-modal';
import { Button } from '@components/ui/button';
import { cn } from '@/lib/utils';
import { useContributionTable } from '../../context/contribution-table-context';
import { FormSelect } from '@/components/form/form-select';
import {
  DaysToDateAdapter,
  QuantityIncrementer,
} from '@/components/form/quantity-incrementer';

interface EditableContributionRowProps {
  index: number;
  fieldId: string;
  remove: (index: number) => void;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  formOptions: {
    fairteilerOrigins: GenericItem[];
    fairteilerCategories: (GenericItem & { image: string })[];
    fairteilerCompanies: (GenericItem & { originId: string })[];
  };
}

export function EditableContributionRow({
  index,
  fieldId,
  remove,
  isEditing,
  onEdit,
  onSave,
  formOptions,
}: EditableContributionRowProps) {
  // --- FORM HOOKS ---
  const { control, setValue } = useFormContext<ContributionFormValues>();
  const categorySelectRef = useRef<HTMLButtonElement>(null);
  const [
    categoryId,
    originId,
    companyId,
    customCompanyName,
    quantity,
    shelfLife,
  ] = useWatch({
    control,
    name: [
      `contributions.${index}.categoryId` as const,
      `contributions.${index}.originId` as const,
      `contributions.${index}.companyId` as const,
      `contributions.${index}.company` as const,
      `contributions.${index}.quantity` as const,
      `contributions.${index}.shelfLife` as const,
    ],
  }) as [string, string, string, string | null, number, Date | null];

  // --- SIDE EFFECTS ---
  useEffect(() => {
    if (formOptions.fairteilerCategories && categoryId) {
      const selectedCategory = formOptions.fairteilerCategories.find(
        (item) => item.id === categoryId,
      );
      if (selectedCategory) {
        setValue(`contributions.${index}.title`, selectedCategory.name, {
          shouldValidate: true,
        });
      }
    }
    categorySelectRef.current?.focus();
  }, [categoryId, formOptions.fairteilerCategories, index, setValue]);

  // --- DISPLAY LOGIC ---
  const category = formOptions.fairteilerCategories?.find(
    (c) => c.id === categoryId,
  );
  const origin = formOptions.fairteilerOrigins?.find((o) => o.id === originId);

  // Helper function to check if required fields are missing
  const hasRequiredFieldErrors = () => ({
    category: !categoryId,
    origin: !originId,
    quantity: !quantity || quantity <= 0,
  });
  const selectedCompany = formOptions.fairteilerCompanies?.find(
    (c) => c.id === companyId,
  );
  const shelfLifeDays = shelfLife
    ? differenceInCalendarDays(new Date(shelfLife), startOfToday())
    : null;

  const { showAllColumns } = useContributionTable();

  return (
    <TableRow key={fieldId}>
      {/* Category Cell */}
      <TableCell
        className={cn(
          !isEditing &&
            hasRequiredFieldErrors().category &&
            'outline-2 outline-offset-[-6px] outline-destructive',
        )}
      >
        {isEditing ? (
          <FormSelect
            ref={categorySelectRef}
            cypressIdentifier={`category-select-${index}`}
            name={`contributions.${index}.categoryId`}
            control={control}
            options={formOptions.fairteilerCategories}
            placeholder='Kategorie auswählen'
            className='w-full min-w-[180px]'
          />
        ) : (
          <div className='flex items-center gap-2'>
            {category?.image ? (
              <Image
                src={category.image}
                width={36}
                height={36}
                alt='category icon'
              />
            ) : category ? (
              <div className='flex size-9 items-center justify-center rounded-md bg-muted'>
                <Apple className='size-5 text-muted-foreground' />
              </div>
            ) : null}
            <span
              className={cn(
                hasRequiredFieldErrors().category &&
                  'mx-auto font-medium text-destructive',
              )}
            >
              {category?.name ?? '-'}
            </span>
          </div>
        )}
      </TableCell>

      <TableCell
        className={cn(
          !showAllColumns && 'hidden',
          'sm:table-cell md:hidden lg:table-cell',
          !isEditing &&
            hasRequiredFieldErrors().origin &&
            'outline-2 outline-offset-[-6px] outline-destructive',
        )}
      >
        {isEditing ? (
          <FormSelect
            cypressIdentifier={`origin-select-${index}`}
            name={`contributions.${index}.originId`}
            control={control}
            options={formOptions.fairteilerOrigins}
            placeholder='Herkunft auswählen'
            className='w-full min-w-[180px]'
          />
        ) : (
          <div className='flex items-center gap-2'>
            <span
              className={cn(
                hasRequiredFieldErrors().origin &&
                  'mx-auto font-medium text-destructive',
              )}
            >
              {origin?.name ?? '-'}
            </span>
          </div>
        )}
      </TableCell>
      <TableCell className={cn(!showAllColumns && 'hidden', 'md:table-cell')}>
        {isEditing ? (
          <FormSelect
            cypressIdentifier={`company-select-${index}`}
            name={`contributions.${index}.companyId`}
            control={control}
            options={formOptions.fairteilerCompanies}
            placeholder='Betrieb auswählen'
            className='w-full min-w-[180px]'
          />
        ) : (
          <>{customCompanyName ?? selectedCompany?.name ?? '-'}</>
        )}
      </TableCell>
      <TableCell
        className={cn(
          !isEditing &&
            hasRequiredFieldErrors().quantity &&
            'outline-2 outline-offset-[-6px] outline-destructive',
        )}
      >
        {isEditing ? (
          <FormField
            name={`contributions.${index}.quantity`}
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <QuantityIncrementer
                    {...field}
                    enableSmallIncrements={true}
                    inputWidth={80}
                    index={index}
                    preventAutoFocus={true}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        ) : (
          <div className='flex items-center gap-2'>
            <span
              className={cn(
                hasRequiredFieldErrors().quantity &&
                  'mx-auto font-medium text-destructive',
              )}
            >
              {quantity ? quantity.toFixed(2) : '-'}
            </span>
          </div>
        )}
      </TableCell>
      <TableCell className={cn(!showAllColumns && 'hidden', 'sm:table-cell')}>
        {isEditing ? (
          <FormField
            name={`contributions.${index}.shelfLife`}
            control={control}
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <DaysToDateAdapter
                    value={field.value}
                    onChange={field.onChange}
                    iconWhenZero={InfinityIcon}
                    inputWidth={40}
                    className={
                      fieldState.error
                        ? 'rounded-lg ring-2 ring-destructive ring-offset-2'
                        : ''
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
        ) : (
          <>
            {shelfLifeDays !== null
              ? `${shelfLifeDays} ${shelfLifeDays <= 1 ? 'Tag' : 'Tage'}`
              : 'Unkritisch'}
          </>
        )}
      </TableCell>

      {/* Actions Cell */}
      <TableCell className='w-[48px] pl-0'>
        <ContributionRowTableActions
          index={index}
          remove={remove}
          isEditing={isEditing}
          onEdit={onEdit}
          onSave={onSave}
          hideEditButton={useContributionTable().isFastView}
        />
      </TableCell>
    </TableRow>
  );
}

interface ContributionRowTableActionsProps {
  index: number;
  remove: (index: number) => void;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  hideEditButton?: boolean;
}

export function ContributionRowTableActions({
  index,
  remove,
  isEditing,
  onEdit,
  onSave,
  hideEditButton = false,
}: ContributionRowTableActionsProps) {
  const [openOptionalFields, setOpenOptionalFields] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon'>
            <span className='sr-only'>Aktionsmenü öffnen</span>
            <MoreHorizontal className='size-5' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {!hideEditButton && (
            <>
              {isEditing ? (
                <DropdownMenuItem onClick={onSave} className='cursor-pointer'>
                  <Save className='mr-2 size-4' />
                  Speichern
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={onEdit} className='cursor-pointer'>
                  <Edit className='mr-2 size-4' />
                  Bearbeiten
                </DropdownMenuItem>
              )}
            </>
          )}
          <DropdownMenuItem
            onClick={() => setOpenOptionalFields(true)}
            className='cursor-pointer'
          >
            <PlusCircle className='mr-2 size-4' />
            Optionale Infos
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => remove(index)}
            className='cursor-pointer text-destructive focus:text-destructive'
          >
            <Trash2 className='mr-2 size-4' />
            Entfernen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <OptionalFieldsModal
        index={index}
        open={openOptionalFields}
        setOpen={setOpenOptionalFields}
      />
    </>
  );
}
