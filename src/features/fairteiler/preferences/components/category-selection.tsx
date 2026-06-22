'use client';

import { invokeAction } from '@/lib/hooks/use-form-action';
import {
  addFairteilerCategoryAction,
  removeFairteilerCategoryAction,
  suggestNewCategoryAction,
  updateCategoryAction,
} from '@server/fairteiler/actions';
import { categoryKeys } from '@server/fairteiler/query-keys';
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

// --- Main Component ---

export function CategorySelectionWrapper() {
  const categories = useCatalogResource<GenericItem, GenericItem>({
    allQuery: categoryKeys.all(),
    chosenQuery: categoryKeys.byFairteiler(),
    addToFairteiler: (item) => invokeAction(addFairteilerCategoryAction, item),
    removeFromFairteiler: (item) =>
      invokeAction(removeFairteilerCategoryAction, item),
    updatePlatformItem: (item) => invokeAction(updateCategoryAction, item),
    suggestPlatformItem: (item) => invokeAction(suggestNewCategoryAction, item),
    messages: {
      removeSuccess: 'Kategorie erfolgreich entfernt',
      updateSuccess: 'Kategorie erfolgreich aktualisiert',
    },
  });

  // --- Derived State  ---

  const chosenCategoryIds = new Set(categories.chosen.map((c) => c.id));
  const availableCategories = categories.all.filter(
    (category) =>
      !chosenCategoryIds.has(category.id) && category.status !== 'pending',
  );
  const pendingCategories = categories.all.filter(
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
                categories={categories.chosen}
                onRemoveAction={categories.removeFromFairteiler}
                onUpdateAction={categories.updatePlatformItem}
                isRemoving={categories.flags.isRemoving}
                isUpdating={categories.flags.isUpdating}
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
                        onAdd={() => categories.addToFairteiler(category)}
                        isAdding={categories.flags.isAdding}
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
            <SuggestCategoryForm
              pendingCategories={pendingCategories}
              onSuggest={categories.suggestPlatformItem}
              isSuggesting={categories.flags.isSuggesting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Child Components ---

export function ChosenCategories({
  categories,
  onRemoveAction,
  onUpdateAction,
  isRemoving,
  isUpdating,
}: {
  categories: GenericItem[];
  onRemoveAction: (category: GenericItem) => void;
  onUpdateAction: (category: GenericItem) => void;
  isRemoving: boolean;
  isUpdating: boolean;
}) {
  const [categoryToEdit, setCategoryToEdit] = useState<GenericItem | null>(
    null,
  );

  const handleEditClick = (category: GenericItem) => {
    setCategoryToEdit(category);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setCategoryToEdit(null);
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
                onClick={() => handleEditClick(category)}
                aria-label={`Edit ${category.name}`}
              >
                <Pencil className='size-3' />
              </Button>
            </Badge>
          ))
        ) : (
          <p className='text-sm text-muted-foreground'>
            Keine Kategorien für diesen Fairteiler ausgewählt.
          </p>
        )}
      </div>
      <EditItemDialog
        item={categoryToEdit}
        open={!!categoryToEdit}
        onOpenChange={handleDialogOpenChange}
        onUpdate={onUpdateAction}
        onDelete={onRemoveAction}
        isUpdating={isUpdating}
        isDeleting={isRemoving}
        itemType='Kategorie'
      />
    </>
  );
}

export function SuggestCategoryForm({
  pendingCategories,
  onSuggest,
  isSuggesting,
}: {
  pendingCategories: GenericItem[];
  onSuggest: (item: GenericItem) => void;
  isSuggesting: boolean;
}) {
  const [newCategoryText, setNewCategoryText] = useState('');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryText.trim()) {
      toast.info('Bitte geben Sie einen Namen für die Kategorie ein.');
      return;
    }

    const newSuggestion: GenericItem = {
      id: uuidv4(),
      name: newCategoryText.trim(),
      status: 'active',
    };

    onSuggest(newSuggestion);
    setNewCategoryText('');
  };

  return (
    <div>
      {pendingCategories && pendingCategories.length > 0 && (
        <div className='mb-4'>
          <h4 className='text-sm font-medium text-foreground'>
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
          disabled={isSuggesting}
        />
        <Button
          size='icon'
          type='submit'
          variant='outline'
          disabled={isSuggesting || newCategoryText.length <= 0}
          className='shrink-0'
          aria-label='Suggest new category'
        >
          {isSuggesting ? <Loader2 className='animate-spin' /> : <Plus />}
        </Button>
      </form>
    </div>
  );
}
