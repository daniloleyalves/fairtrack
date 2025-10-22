'use client';

import { ORIGIN_KEY, ORIGINS_BY_FAIRTEILER_KEY } from '@/lib/config/api-routes';
import useSWRSuspense from '@/lib/services/swr';
import {
  addFairteilerOriginAction,
  removeFairteilerOriginAction,
  suggestNewOriginAction,
  updateOriginAction,
} from '@server/actions';
import { GenericItem } from '@server/db/db-types';
import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { ScrollArea } from '@ui/scroll-area';
import { Loader2, Plus, Pencil } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import useSWRMutation from 'swr/mutation';
import { FormSelectionItem } from './form-selection-item';
import { v4 as uuidv4 } from 'uuid';
import { EditItemDialog } from './edit-item-dialog';
import { useSWRConfig } from 'swr';

// --- Main Component ---

export function OriginSelectionWrapper() {
  const { data: allOrigins } = useSWRSuspense<GenericItem[]>(ORIGIN_KEY);

  const { data: chosenOrigins } = useSWRSuspense<GenericItem[]>(
    ORIGINS_BY_FAIRTEILER_KEY,
  );

  return (
    <OriginSelection allOrigins={allOrigins} chosenOrigins={chosenOrigins} />
  );
}

function OriginSelection({
  allOrigins,
  chosenOrigins,
}: {
  allOrigins: GenericItem[];
  chosenOrigins: GenericItem[];
}) {
  const { mutate } = useSWRConfig();

  // --- Mutations  ---
  const { trigger: addFairteilerOriginTrigger, isMutating: isAdding } =
    useSWRMutation(
      ORIGINS_BY_FAIRTEILER_KEY,
      (_key, { arg }: { arg: GenericItem }) => addFairteilerOriginAction(arg),
      {
        populateCache: (
          addedOrigin: GenericItem,
          currentOrigins: GenericItem[] = [],
        ) => {
          if (!currentOrigins.length) {
            return [addedOrigin];
          }
          return [...currentOrigins, addedOrigin];
        },
        revalidate: false,
        rollbackOnError: true,
        onError: () =>
          toast.error(
            'Fehlgeschlagen. Möglicherweise bist du nicht befugt diese Aktion auszuführen',
          ),
      },
    );

  const { trigger: removeFairteilerOriginTrigger, isMutating: isRemoving } =
    useSWRMutation(
      ORIGINS_BY_FAIRTEILER_KEY,
      (_key, { arg }: { arg: GenericItem }) =>
        removeFairteilerOriginAction(arg),
      {
        populateCache: (
          removedOrigin: GenericItem,
          currentChosen: GenericItem[] = [],
        ) => {
          return (currentChosen || []).filter((o) => o.id !== removedOrigin.id);
        },
        revalidate: false,
        rollbackOnError: true,
        onSuccess: () => {
          toast.success('Änderung erfolgreich gespeichert.');
        },
        onError: () => {
          return toast.error(
            'Fehlgeschlagen. Möglicherweise bist du nicht befugt diese Aktion auszuführen',
          );
        },
      },
    );

  const { trigger: updateOriginTrigger, isMutating: isUpdating } =
    useSWRMutation(
      ORIGINS_BY_FAIRTEILER_KEY,
      (_key, { arg }: { arg: GenericItem }) => updateOriginAction(arg),
      {
        populateCache: (
          updatedOrigin: GenericItem,
          currentOrigins: GenericItem[] = [],
        ) => {
          return currentOrigins.map((o) =>
            o.id === updatedOrigin.id ? updatedOrigin : o,
          );
        },
        revalidate: false,
        rollbackOnError: true,
        onSuccess: () => {
          mutate(ORIGIN_KEY);
          toast.success('Änderung erfolgreich gespeichert.');
        },
        onError: () => {
          return toast.error(
            'Fehlgeschlagen. Möglicherweise bist du nicht befugt diese Aktion auszuführen',
          );
        },
      },
    );

  // --- Handlers with Optimistic Updates  ---

  const handleAddOrigin = (originToAdd: GenericItem) => {
    addFairteilerOriginTrigger(originToAdd, {
      optimisticData: (currentChosen: GenericItem[] = []) => {
        return [...currentChosen, originToAdd];
      },
    });
  };

  const handleRemoveOrigin = (originToRemove: GenericItem) => {
    removeFairteilerOriginTrigger(originToRemove, {
      optimisticData: (currentChosen: GenericItem[] = []) => {
        return currentChosen.filter((o) => o.id !== originToRemove.id);
      },
    });
  };

  const handleUpdateOrigin = (originToUpdate: GenericItem) => {
    updateOriginTrigger(originToUpdate, {
      optimisticData: (currentOrigins: GenericItem[] = []) => {
        return currentOrigins.map((o) =>
          o.id === originToUpdate.id ? originToUpdate : o,
        );
      },
    });
  };

  // --- Derived State ---

  const chosenOriginIds = new Set(chosenOrigins.map((o) => o.id));
  const availableOrigins = allOrigins.filter(
    (origin) => !chosenOriginIds.has(origin.id) && origin.status !== 'pending',
  );
  const pendingOrigins = allOrigins.filter(
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
                origins={chosenOrigins}
                onRemoveAction={handleRemoveOrigin}
                onUpdateAction={handleUpdateOrigin}
                isRemoving={isRemoving}
                isUpdating={isUpdating}
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
                        onAdd={() => handleAddOrigin(origin)}
                        isAdding={isAdding}
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
            <SuggestOriginForm pendingOrigins={pendingOrigins} />
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
}: {
  pendingOrigins: GenericItem[];
}) {
  const [newOriginText, setNewOriginText] = useState('');

  const { trigger: addTrigger, isMutating: isAdding } = useSWRMutation(
    ORIGIN_KEY,
    (_key, { arg }: { arg: GenericItem }) => suggestNewOriginAction(arg),
    {
      revalidate: false,
      rollbackOnError: true,
    },
  );

  const handleAddOrigin = async (e: React.FormEvent) => {
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

    try {
      await addTrigger(newSuggestion, {
        optimisticData: (currentOrigins: GenericItem[] = []) => {
          return [...currentOrigins, newSuggestion];
        },
      });

      setNewOriginText('');
    } catch (e) {
      console.error('Failed to suggest origin:', e);
      toast.error('Fehlgeschlagen, ' + String(e));
    }
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
          disabled={isAdding}
        />
        <Button
          size='icon'
          type='submit'
          variant='outline'
          disabled={isAdding || newOriginText.length <= 0}
          className='shrink-0'
          aria-label='Suggest new origin'
        >
          {isAdding ? <Loader2 className='animate-spin' /> : <Plus />}
        </Button>
      </form>
    </div>
  );
}
