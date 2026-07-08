'use client';

import { invokeAction } from '@/lib/hooks/use-form-action';
import {
  addFairteilerOriginAction,
  removeFairteilerOriginAction,
  suggestNewOriginAction,
  updateOriginAction,
} from '@server/fairteiler/actions';
import { getOrigins, getOriginsByFairteiler } from '@server/fairteiler/queries';
import { originKeys } from '@server/fairteiler/query-keys';
import { GenericItem } from '@server/db/db-types';
import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { ScrollArea } from '@ui/scroll-area';
import { Loader2, Plus, Pencil } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { FormSelectionItem } from './form-selection-item';
import { v4 as uuidv4 } from 'uuid';
import { EditItemDialog } from './edit-item-dialog';
import { useCatalogResource } from '../hooks/use-catalog-resource';
import { CatalogSelectionSkeleton } from './catalog-selection-skeleton';

// --- Main Component ---

export function OriginSelectionWrapper() {
  const origins = useCatalogResource<GenericItem, GenericItem>({
    allKey: originKeys.all(),
    allQueryFn: getOrigins,
    chosenKey: originKeys.byFairteiler(),
    chosenQueryFn: getOriginsByFairteiler,
    addToFairteiler: (item) => invokeAction(addFairteilerOriginAction, item),
    removeFromFairteiler: (item) =>
      invokeAction(removeFairteilerOriginAction, item),
    updatePlatformItem: (item) => invokeAction(updateOriginAction, item),
    suggestPlatformItem: (item) => invokeAction(suggestNewOriginAction, item),
  });

  if (origins.flags.isLoading) {
    return <CatalogSelectionSkeleton title='Herkünfte' />;
  }

  // --- Derived State ---

  const chosenOriginIds = new Set(origins.chosen.map((o) => o.id));
  const availableOrigins = origins.all.filter(
    (origin) => !chosenOriginIds.has(origin.id) && origin.status !== 'pending',
  );
  const pendingOrigins = origins.all.filter(
    (origin) => origin.status === 'pending',
  );

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='mb-2 text-lg font-semibold'>Herkünfte</h3>
        <div className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            <div>
              <h4 className='mb-2 text-sm font-medium'>
                Ausgewählte Herkünfte
              </h4>
              <p className='mb-3 text-sm text-muted-foreground'>
                Diese Herkünfte sind für diesen Fairteiler ausgewählt und
                erscheinen im Rette-Formular.
              </p>
              <ChosenOrigins
                origins={origins.chosen}
                onRemoveAction={origins.removeFromFairteiler}
                onUpdateAction={origins.updatePlatformItem}
                isRemoving={origins.flags.isRemoving}
                isUpdating={origins.flags.isUpdating}
              />
            </div>

            <div>
              <h4 className='mb-2 text-sm font-medium'>Herkunft hinzufügen</h4>
              <p className='mb-3 text-sm text-muted-foreground'>
                Wähle eine Herkunft aus der Liste aus, um sie für diesen
                Fairteiler zu aktivieren.
              </p>
              <ScrollArea className='h-32'>
                <ul className='space-y-2'>
                  {availableOrigins.length ? (
                    availableOrigins.map((origin) => (
                      <FormSelectionItem
                        key={origin.id}
                        item={origin}
                        onAdd={() => origins.addToFairteiler(origin)}
                        isAdding={origins.flags.isAdding}
                      />
                    ))
                  ) : (
                    <li className='text-sm text-muted-foreground'>
                      Es stehen keine weiteren Herkünfte zur Auswahl
                    </li>
                  )}
                </ul>
              </ScrollArea>
            </div>
          </div>

          <div>
            <h4 className='mb-2 text-sm font-medium'>Herkunft vorschlagen</h4>
            <p className='mb-3 text-sm text-muted-foreground'>
              Ist die gewünschte Herkunft nicht dabei? Schlage eine neue vor.
            </p>
            <SuggestOriginForm
              pendingOrigins={pendingOrigins}
              onSuggest={origins.suggestPlatformItem}
              isSuggesting={origins.flags.isSuggesting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Child Components ---

export function ChosenOrigins({
  origins,
  onRemoveAction,
  onUpdateAction,
  isRemoving,
  isUpdating,
}: {
  origins: GenericItem[];
  onRemoveAction: (origin: GenericItem) => void;
  onUpdateAction: (origin: GenericItem) => void;
  isRemoving: boolean;
  isUpdating: boolean;
}) {
  const [originToEdit, setOriginToEdit] = useState<GenericItem | null>(null);

  const handleEditClick = (origin: GenericItem) => {
    setOriginToEdit(origin);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setOriginToEdit(null);
    }
  };

  return (
    <>
      <div className='flex min-h-[2.5rem] flex-wrap items-center gap-2 rounded-lg border p-2'>
        {origins.length ? (
          origins.map((origin) => (
            <Badge key={origin.id} className='flex items-center gap-1 pr-1'>
              {origin.name}
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='size-4 p-0 hover:bg-white/30 hover:text-white'
                onClick={() => handleEditClick(origin)}
                aria-label={`Edit ${origin.name}`}
              >
                <Pencil className='size-3' />
              </Button>
            </Badge>
          ))
        ) : (
          <p className='text-sm text-muted-foreground'>
            Keine Herkünfte für diesen Fairteiler ausgewählt.
          </p>
        )}
      </div>
      <EditItemDialog
        item={originToEdit}
        open={!!originToEdit}
        onOpenChange={handleDialogOpenChange}
        onUpdate={onUpdateAction}
        onDelete={onRemoveAction}
        isUpdating={isUpdating}
        isDeleting={isRemoving}
        itemType='Herkunft'
      />
    </>
  );
}

export function SuggestOriginForm({
  pendingOrigins,
  onSuggest,
  isSuggesting,
}: {
  pendingOrigins: GenericItem[];
  onSuggest: (item: GenericItem) => void;
  isSuggesting: boolean;
}) {
  const [newOriginText, setNewOriginText] = useState('');

  const handleAddOrigin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOriginText.trim()) {
      toast.info('Bitte geben Sie einen Namen für die Herkunft ein.');
      return;
    }

    const newSuggestion: GenericItem = {
      id: uuidv4(),
      name: newOriginText.trim(),
      status: 'active',
    };

    onSuggest(newSuggestion);
    setNewOriginText('');
  };

  return (
    <div>
      {pendingOrigins && pendingOrigins.length > 0 && (
        <div className='mb-4'>
          <h4 className='text-sm font-medium text-foreground'>
            Bisherige Vorschläge
          </h4>
          <div className='mt-2 flex flex-wrap gap-2'>
            {pendingOrigins.map((origin) => (
              <Badge key={origin.id} variant='outline'>
                {origin.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
      <form onSubmit={handleAddOrigin} className='flex gap-2'>
        <Input
          type='text'
          value={newOriginText}
          onChange={(e) => setNewOriginText(e.target.value)}
          placeholder='Name der neuen Herkunft...'
          disabled={isSuggesting}
        />
        <Button
          size='icon'
          type='submit'
          variant='outline'
          disabled={isSuggesting || newOriginText.length <= 0}
          className='shrink-0'
          aria-label='Suggest new origin'
        >
          {isSuggesting ? <Loader2 className='animate-spin' /> : <Plus />}
        </Button>
      </form>
    </div>
  );
}
