'use client';

import { GenericItem } from '@server/db/db-types';
import { Button } from '@ui/button';
import { Plus } from 'lucide-react';

export function FormSelectionItem({
  item,
  onAdd,
  isAdding,
  subtitle,
}: {
  item: GenericItem;
  onAdd: () => void;
  isAdding: boolean;
  subtitle?: string;
}) {
  return (
    <li className='flex items-center justify-between gap-4 rounded-lg border p-2'>
      <div className='flex flex-col'>
        <span className='text-sm'>{item.name}</span>
        {subtitle && (
          <span className='text-xs text-muted-foreground'>{subtitle}</span>
        )}
      </div>
      <Button
        variant='outline'
        size='icon'
        onClick={onAdd}
        disabled={isAdding}
        aria-label={`Add ${item.name}`}
      >
        <Plus className='size-4' />
      </Button>
    </li>
  );
}
