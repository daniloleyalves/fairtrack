'use client';

import { GenericItem } from '@server/db/db-types';
import { Button } from '@ui/button';
import { Plus } from 'lucide-react';

export function FormSelectionItem({
  item,
  onAdd,
  isAdding,
}: {
  item: GenericItem;
  onAdd: () => void;
  isAdding: boolean;
}) {
  return (
    <li className='flex items-center justify-between gap-4 rounded-lg border p-2'>
      <span className='text-sm'>{item.name}</span>
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
