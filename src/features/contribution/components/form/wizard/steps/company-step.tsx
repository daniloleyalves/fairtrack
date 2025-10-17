'use client';

import { SimpleFilter } from '@/features/statistics/components/simple-filter';
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { RadioGroup, RadioGroupItem } from '@components/ui/radio-group';
import { Separator } from '@components/ui/separator';
import { GenericItem } from '@server/db/db-types';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CompanyStepProps {
  companies: (GenericItem & { originId: string })[];
  origins: GenericItem[];
  selection: { id: string | null; name: string };
  onSelect: (selection: { id: string | null; name: string }) => void;
}

export function CompanyStep({
  companies,
  origins,
  selection,
  onSelect,
}: CompanyStepProps) {
  const [filteredCompanies, setFilteredCompanies] = useState(companies);
  const [selectedValues, setSelectedValues] = useState<Set<string>>(
    new Set([]),
  );
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const filtered = companies.filter((company) => {
      const matchesSearch = company.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesOrigin =
        selectedValues.size === 0 || selectedValues.has(company.originId);
      return matchesSearch && matchesOrigin;
    });
    setFilteredCompanies(filtered);
  }, [searchTerm, selectedValues, companies]);

  const handleRadioSelect = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId);
    if (company) {
      onSelect({ id: company.id, name: company.name });
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect({ id: null, name: e.target.value });
  };

  return (
    <div className='relative flex flex-col gap-1 overflow-y-auto'>
      <DialogHeader className='pt-6'>
        <DialogTitle>Betrieb</DialogTitle>
        <DialogDescription>
          Wähle einen Betrieb aus oder gib einen neuen Namen ein (optional).
        </DialogDescription>
      </DialogHeader>
      <Separator className='my-6' />
      <div className='mb-4 flex gap-2'>
        <div className='relative w-full'>
          <Search className='absolute top-2.5 left-3 size-4 text-foreground/70' />
          <Input
            placeholder='Suchen...'
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-9'
          />
        </div>
        <SimpleFilter
          title='Herkunft'
          options={origins.map((origin) => ({
            title: origin.name,
            value: origin.id,
          }))}
          onChange={setSelectedValues}
        />
      </div>

      <RadioGroup
        value={selection.id}
        onValueChange={handleRadioSelect}
        className='grid w-full grid-cols-1 gap-2 sm:grid-cols-2'
      >
        {filteredCompanies.map((company) => (
          <Label
            key={company.id}
            htmlFor={company.id}
            className={cn(
              'flex cursor-pointer items-center justify-center rounded-md border py-12 text-center shadow-sm transition-colors',
              selection.id === company.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-muted-foreground hover:bg-accent',
            )}
          >
            <RadioGroupItem
              value={company.id}
              id={company.id}
              className='sr-only'
            />
            {company.name}
          </Label>
        ))}
      </RadioGroup>

      <div className='mt-8'>
        <Label htmlFor='custom-company' className='text-muted-foreground'>
          Oder gib einen neuen Betrieb an:
        </Label>
        <Input
          id='custom-company'
          placeholder='z.B. Unverpacktladen Musterstadt'
          value={selection.name}
          onChange={handleCustomInputChange}
          className='mt-2 mb-1'
        />
      </div>
    </div>
  );
}
