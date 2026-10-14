import { describe, it, expect, vi } from 'vitest';
import { act, render, waitFor } from '@testing-library/react';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { Table, TableBody } from '@components/ui/table';
import type { ContributionFormValues } from '@features/contribution/schemas/contribution-schema';
import { ContributionTableProvider } from '../../../context/contribution-table-context';
import { EditableContributionRow } from '../contribution-row';

vi.mock('@/components/form/form-select', () => ({
  FormSelect: () => <div>select</div>,
}));
vi.mock('@/components/form/quantity-incrementer', () => ({
  QuantityIncrementer: () => <div>quantity</div>,
}));
vi.mock('../optional-fields-modal', () => ({
  OptionalFieldsModal: () => null,
}));

const categories = [
  { id: 'cat-veg', name: 'Gemüse', image: '' },
  { id: 'cat-fruit', name: 'Obst', image: '' },
];

let form: UseFormReturn<ContributionFormValues>;

function Harness({ title }: { title: string }) {
  form = useForm<ContributionFormValues>({
    defaultValues: {
      contributions: [
        {
          id: 'c1',
          foodId: 'f1',
          title,
          categoryId: 'cat-veg',
          originId: 'o1',
          companyId: null,
          company: null,
          quantity: 2,
          allergens: '',
          comment: '',
        },
      ],
    },
  });

  return (
    <FormProvider {...form}>
      <ContributionTableProvider isFastView={false}>
        <Table>
          <TableBody>
            <EditableContributionRow
              index={0}
              fieldId='c1'
              remove={vi.fn()}
              isEditing={false}
              onEdit={vi.fn()}
              onSave={vi.fn()}
              formOptions={{
                fairteilerOrigins: [{ id: 'o1', name: 'Betrieb' }],
                fairteilerCategories: [...categories],
                fairteilerCompanies: [],
              }}
            />
          </TableBody>
        </Table>
      </ContributionTableProvider>
    </FormProvider>
  );
}

describe('EditableContributionRow title', () => {
  it('keeps a custom title set before the row mounts', async () => {
    const { rerender } = render(<Harness title='Karotten' />);
    rerender(<Harness title='Karotten' />);

    await waitFor(() =>
      expect(form.getValues('contributions.0.title')).toBe('Karotten'),
    );
  });

  it('fills an empty title with the category name', async () => {
    render(<Harness title='' />);

    await waitFor(() =>
      expect(form.getValues('contributions.0.title')).toBe('Gemüse'),
    );
  });

  it('follows the category when the title was the previous category name', async () => {
    render(<Harness title='' />);
    await waitFor(() =>
      expect(form.getValues('contributions.0.title')).toBe('Gemüse'),
    );

    act(() => form.setValue('contributions.0.categoryId', 'cat-fruit'));

    await waitFor(() =>
      expect(form.getValues('contributions.0.title')).toBe('Obst'),
    );
  });

  it('keeps a custom title when the category changes', async () => {
    render(<Harness title='Karotten' />);

    act(() => form.setValue('contributions.0.categoryId', 'cat-fruit'));

    await waitFor(() =>
      expect(form.getValues('contributions.0.categoryId')).toBe('cat-fruit'),
    );
    expect(form.getValues('contributions.0.title')).toBe('Karotten');
  });
});
