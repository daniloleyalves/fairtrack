import { Checkbox } from '@/components/ui/checkbox';
import { Dispatch, SetStateAction } from 'react';
import { ReportFilters } from '../types';

interface CoolFilterProps {
  filters: ReportFilters;
  setFilters: Dispatch<SetStateAction<ReportFilters>>;
}

export function BooleanFilter({ filters, setFilters }: CoolFilterProps) {
  const isChecked = filters.cool?.includes('Kühlung erforderlich') ?? false;

  const toggleCool = () => {
    setFilters((prev) => {
      const current = prev.cool ?? [];
      const newValues = current.includes('Kühlung erforderlich')
        ? current.filter((v) => v !== 'Kühlung erforderlich')
        : [...current, 'Kühlung erforderlich'];

      return { ...prev, cool: newValues.length ? newValues : undefined };
    });
  };

  return (
    <div className='flex items-center gap-4 rounded-lg border bg-input/40 pr-2'>
      <Checkbox checked={isChecked} onCheckedChange={toggleCool} size='36px' />
      <span className='text-sm font-medium'>Kühlanforderungen</span>
    </div>
  );
}
