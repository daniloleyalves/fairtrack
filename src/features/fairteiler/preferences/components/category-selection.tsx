'use client';

import {
  CATEGORIES_BY_FAIRTEILER_KEY,
  CATEGORY_KEY,
} from '@/lib/config/api-routes';
import useSWRSuspense from '@/lib/services/swr';
import { ConfirmModal } from '@components/confirm-modal';
import {
  addFairteilerCategoryAction,
  removeFairteilerCategoryAction,
  suggestNewCategoryAction,
} from '@server/actions';
import { GenericItem } from '@server/db/db-types';
import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { ScrollArea } from '@ui/scroll-area';
import { Loader2, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import useSWRMutation from 'swr/mutation';
import { FormSelectionItem } from './form-selection-item';
import { v4 as uuidv4 } from 'uuid';

// --- Main Component ---

export function CategorySelectionWrapper() {
  const { data: allCategories } = useSWRSuspense<GenericItem[]>(CATEGORY_KEY);

  const { data: chosenCategories } = useSWRSuspense<GenericItem[]>(
    CATEGORIES_BY_FAIRTEILER_KEY,
  );

  return (
    <CategorySelection
      allCategories={allCategories}
      chosenCategories={chosenCategories}
    />
  );
}

function CategorySelection({
  allCategories,
  chosenCategories,
}: {
  allCategories: GenericItem[];
  chosenCategories: GenericItem[];
}) {
  // --- Mutations ---

  const { trigger: addFairteilerCategoryTrigger, isMutating: isAdding } =
    useSWRMutation(
      CATEGORIES_BY_FAIRTEILER_KEY,
      (_key, { arg }: { arg: GenericItem }) => addFairteilerCategoryAction(arg),
      {
        populateCache: (
          addedCategory: GenericItem,
          currentCategories: GenericItem[] = [],
        ) => {
          if (!currentCategories.length) {
            return [addedCategory];
          }
          return [...currentCategories, addedCategory];
        },
        revalidate: false,
        rollbackOnError: true,
        onError: () => {
          return toast.error(
            'Fehlgeschlagen. Möglicherweise bist du nicht befugt diese Aktion auszuführen',
          );
        },
      },
    );

  const { trigger: removeFairteilerCategoryTrigger, isMutating: isRemoving } =
    useSWRMutation(
      CATEGORIES_BY_FAIRTEILER_KEY,
      (_key, { arg }: { arg: GenericItem }) =>
        removeFairteilerCategoryAction(arg),
      {
        populateCache: (
          removedCategory: GenericItem,
          currentChosen: GenericItem[] = [],
        ) => {
          return (currentChosen || []).filter(
            (c) => c.id !== removedCategory.id,
          );
        },
        revalidate: false,
        rollbackOnError: true,
        onError: () =>
          toast.error(
            'Fehlgeschlagen. Möglicherweise bist du nicht befugt diese Aktion auszuführen',
          ),
      },
    );

  // --- Handlers with Optimistic Updates ---

  const handleAddCategory = (categoryToAdd: GenericItem) => {
    addFairteilerCategoryTrigger(categoryToAdd, {
      optimisticData: (currentChosen: GenericItem[] = []) => {
        return [...currentChosen, categoryToAdd];
      },
    });
  };

  const handleRemoveCategory = (categoryToRemove: GenericItem) => {
    removeFairteilerCategoryTrigger(categoryToRemove, {
      optimisticData: (currentChosen: GenericItem[] = []) => {
        return currentChosen.filter((c) => c.id !== categoryToRemove.id);
      },
    });
  };

  // --- Derived State  ---

  const chosenCategoryIds = new Set(chosenCategories.map((c) => c.id));
  const availableCategories = allCategories.filter(
    (category) =>
      !chosenCategoryIds.has(category.id) && category.status !== 'pending',
  );
  const pendingCategories = allCategories.filter(
    (category) => category.status === 'pending',
  );

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='mb-2 text-lg font-semibold'>Kategorien</h3>
        <div className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            <div>
              <h4 className='mb-2 text-sm font-medium'>
                Ausgewählte Kategorien
              </h4>
              <p className='mb-3 text-sm text-muted-foreground'>
                Diese Kategorien sind für diesen Fairteiler ausgewählt und
                erscheinen im Rette-Formular.
              </p>
              <ChosenCategories
                categories={chosenCategories}
                onRemove={handleRemoveCategory}
                isRemoving={isRemoving}
              />
            </div>

            <div>
              <h4 className='mb-2 text-sm font-medium'>Kategorie hinzufügen</h4>
              <p className='mb-3 text-sm text-muted-foreground'>
                Wähle eine Kategorie aus der Liste aus, um sie für diesen
                Fairteiler zu aktivieren.
              </p>
              <ScrollArea className='h-32'>
                <ul className='space-y-2'>
                  {availableCategories.length ? (
                    availableCategories.map((category) => (
                      <FormSelectionItem
                        key={category.id}
                        item={category}
                        onAdd={() => handleAddCategory(category)}
                        isAdding={isAdding}
                      />
                    ))
                  ) : (
                    <li className='text-sm text-muted-foreground'>
                      Es stehen keine weiteren Kategorien zur Auswahl
                    </li>
                  )}
                </ul>
              </ScrollArea>
            </div>
          </div>

          <div>
            <h4 className='mb-2 text-sm font-medium'>Kategorie vorschlagen</h4>
            <p className='mb-3 text-sm text-muted-foreground'>
              Ist die gewünschte Kategorie nicht dabei? Schlage eine neue vor.
            </p>
            <SuggestCategoryForm pendingCategories={pendingCategories} />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Child Components ---

export function ChosenCategories({
  categories,
  onRemove,
  isRemoving,
}: {
  categories: GenericItem[];
  onRemove: (category: GenericItem) => void;
  isRemoving: boolean;
}) {
  const [categoryToRemove, setCategoryToRemove] = useState<GenericItem | null>(
    null,
  );

  const handleConfirmRemove = () => {
    if (!categoryToRemove) return;
    try {
      onRemove(categoryToRemove);
    } catch (e) {
      console.error('Removal failed', e);
    } finally {
      setCategoryToRemove(null);
    }
  };

  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      setCategoryToRemove(null);
    }
  };

  return (
    <>
      <div className='flex min-h-[2.5rem] flex-wrap items-center gap-2 rounded-lg border p-2'>
        {categories.length ? (
          categories.map((category) => (
            <Badge key={category.id} className='flex items-center gap-1 pr-1'>
              {category.name}
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='size-4 p-0 hover:bg-white/30 hover:text-white'
                onClick={() => setCategoryToRemove(category)}
                aria-label={`Remove ${category.name}`}
              >
                <X className='size-3' />
              </Button>
            </Badge>
          ))
        ) : (
          <p className='text-sm text-muted-foreground'>
            Keine Kategorien für diesen Fairteiler ausgewählt.
          </p>
        )}
      </div>
      <ConfirmModal
        open={!!categoryToRemove}
        onOpenChange={handleModalOpenChange}
        title='Kategorie entfernen?'
        description={
          <>
            Bist du sicher, dass du die Kategorie{' '}
            <strong className='font-semibold'>{categoryToRemove?.name}</strong>{' '}
            aus dem Formular und der Auswertung dieses Fairteilers entfernen
            möchtest?
          </>
        }
        onConfirm={handleConfirmRemove}
        isPending={isRemoving}
        actionTitle='Entfernen'
        actionVariant='destructive'
        useTrigger={false}
      />
    </>
  );
}

export function SuggestCategoryForm({
  pendingCategories,
}: {
  pendingCategories: GenericItem[];
}) {
  const [newCategoryText, setNewCategoryText] = useState('');

  const { trigger: addTrigger, isMutating: isAdding } = useSWRMutation(
    CATEGORY_KEY,
    (_key, { arg }: { arg: GenericItem }) => suggestNewCategoryAction(arg),
    {
      revalidate: false,
      rollbackOnError: true,
    },
  );

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryText.trim()) {
      toast.info('Bitte geben Sie einen Namen für die Kategorie ein.');
      return;
    }

    const newSuggestion: GenericItem = {
      id: uuidv4(),
      name: newCategoryText.trim(),
      status: 'pending',
    };

    try {
      await addTrigger(newSuggestion, {
        optimisticData: (currentCategories: GenericItem[] = []) => {
          return [...currentCategories, newSuggestion];
        },
      });

      setNewCategoryText('');
    } catch (e) {
      console.error('Failed to suggest category:', e);
      toast.error('Fehlgeschlagen, ' + String(e));
    }
  };

  return (
    <div>
      {pendingCategories && pendingCategories.length > 0 && (
        <div className='mb-4'>
          <h4 className='text-sm font-medium text-foreground dark:text-gray-100'>
            Bisherige Vorschläge
          </h4>
          <div className='mt-2 flex flex-wrap gap-2'>
            {pendingCategories.map((category) => (
              <Badge key={category.id} variant='outline'>
                {category.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
      <form onSubmit={handleAddCategory} className='flex gap-2'>
        <Input
          type='text'
          value={newCategoryText}
          onChange={(e) => setNewCategoryText(e.target.value)}
          placeholder='Name der neuen Kategorie...'
          disabled={isAdding}
        />
        <Button
          size='icon'
          type='submit'
          variant='outline'
          disabled={isAdding || newCategoryText.length <= 0}
          className='shrink-0'
          aria-label='Suggest new category'
        >
          {isAdding ? <Loader2 className='animate-spin' /> : <Plus />}
        </Button>
      </form>
    </div>
  );
}
