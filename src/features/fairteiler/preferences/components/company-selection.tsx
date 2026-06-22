'use client';

import {
  addFairteilerCompanyAction,
  removeFairteilerCompanyAction,
  suggestNewCompanyAction,
  updateCompanyAction,
} from '@server/fairteiler/actions';
import { companyKeys, originKeys } from '@server/fairteiler/query-keys';
import { CompanyWithOrigin, GenericItem } from '@server/db/db-types';
import { toast } from 'sonner';
import { useState } from 'react';
import { Badge } from '@ui/badge';
import { Loader2, Plus, Pencil } from 'lucide-react';
import { Button } from '@ui/button';
import { ScrollArea } from '@ui/scroll-area';

import { FormSelectionItem } from './form-selection-item';
import { Input } from '@ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/select';
import { invokeAction } from '@/lib/hooks/use-form-action';
import { v4 as uuidv4 } from 'uuid';
import { EditItemDialog } from './edit-item-dialog';
import { useQuery } from '@tanstack/react-query';
import { useCatalogResource } from '../hooks/use-catalog-resource';

// --- Main Component ---

export function CompanySelectionWrapper() {
  const companies = useCatalogResource<CompanyWithOrigin, GenericItem>({
    allQuery: companyKeys.all(),
    chosenQuery: companyKeys.byFairteiler(),
    addToFairteiler: (item) => invokeAction(addFairteilerCompanyAction, item),
    removeFromFairteiler: (item) =>
      invokeAction(removeFairteilerCompanyAction, item),
    updatePlatformItem: (item) => invokeAction(updateCompanyAction, item),
    suggestPlatformItem: async (item) => {
      await invokeAction(suggestNewCompanyAction, item);
      return item;
    },
    messages: {
      removeSuccess: 'Betrieb erfolgreich entfernt',
      updateSuccess: 'Betrieb erfolgreich aktualisiert',
    },
  });

  const { data: allOriginsData } = useQuery(originKeys.all());
  const allOrigins = allOriginsData ?? [];

  // --- Derived State  ---

  const chosenCompanyIds = new Set(companies.chosen.map((c) => c.id));
  const availableCompanies = companies.all.filter((company) => {
    const isNotChosen = !chosenCompanyIds.has(company.id);
    const isNotPending = company.status !== 'pending';
    return isNotChosen && isNotPending;
  });
  const pendingCompanies = companies.all.filter(
    (company) => company.status === 'pending',
  );

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='mb-2 text-lg font-semibold'>Betriebe</h3>
        <div className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            <div>
              <h4 className='mb-2 text-sm font-medium'>Ausgewählte Betriebe</h4>
              <p className='mb-3 text-sm text-muted-foreground'>
                Diese Betriebe sind für diesen Fairteiler ausgewählt und
                erscheinen im Rette-Formular.
              </p>
              <ChosenCompanies
                companies={companies.chosen}
                onRemoveAction={companies.removeFromFairteiler}
                onUpdateAction={companies.updatePlatformItem}
                isRemoving={companies.flags.isRemoving}
                isUpdating={companies.flags.isUpdating}
                allOrigins={allOrigins}
              />
            </div>

            <div>
              <h4 className='mb-2 text-sm font-medium'>Betrieb hinzufügen</h4>
              <p className='mb-3 text-sm text-muted-foreground'>
                Wähle einen Betrieb aus der Liste aus, um ihn für diesen
                Fairteiler zu aktivieren.
              </p>

              <ScrollArea className='h-32'>
                <ul className='space-y-2'>
                  {availableCompanies.length ? (
                    availableCompanies.map((company) => (
                      <FormSelectionItem
                        key={company.id}
                        item={company}
                        onAdd={() => companies.addToFairteiler(company)}
                        isAdding={companies.flags.isAdding}
                        subtitle={company.originName ?? 'Keine Herkunft'}
                      />
                    ))
                  ) : (
                    <li className='text-sm text-muted-foreground'>
                      Es stehen keine weiteren Betriebe zur Auswahl
                    </li>
                  )}
                </ul>
              </ScrollArea>
            </div>
          </div>

          <div>
            <h4 className='mb-2 text-sm font-medium'>Betrieb vorschlagen</h4>
            <p className='mb-3 text-sm text-muted-foreground'>
              Ist der gewünschte Betrieb nicht dabei? Schlage einen neuen vor.
            </p>
            <SuggestCompanyForm
              pendingCompanies={pendingCompanies}
              allOrigins={allOrigins}
              onSuggest={companies.suggestPlatformItem}
              isSuggesting={companies.flags.isSuggesting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Child Components ---

export function ChosenCompanies({
  companies,
  onRemoveAction,
  onUpdateAction,
  isRemoving,
  isUpdating,
  allOrigins,
}: {
  companies: GenericItem[];
  onRemoveAction: (company: GenericItem) => void;
  onUpdateAction: (company: GenericItem) => void;
  isRemoving: boolean;
  isUpdating: boolean;
  allOrigins: GenericItem[];
}) {
  const [companyToEdit, setCompanyToEdit] = useState<GenericItem | null>(null);

  const handleEditClick = (company: GenericItem) => {
    setCompanyToEdit(company);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setCompanyToEdit(null);
    }
  };

  return (
    <>
      <div className='flex min-h-10 flex-wrap items-center gap-2 rounded-lg border p-2'>
        {companies.length ? (
          companies.map((company) => (
            <Badge key={company.id} className='flex items-center gap-1 pr-1'>
              {company.name}
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='size-4 p-0 hover:bg-white/30 hover:text-white'
                onClick={() => handleEditClick(company)}
                aria-label={`Edit ${company.name}`}
              >
                <Pencil className='size-3' />
              </Button>
            </Badge>
          ))
        ) : (
          <p className='text-sm text-muted-foreground'>
            Keine Betriebe für diesen Fairteiler ausgewählt.
          </p>
        )}
      </div>
      <EditItemDialog
        item={companyToEdit}
        open={!!companyToEdit}
        onOpenChange={handleDialogOpenChange}
        onUpdate={onUpdateAction}
        onDelete={onRemoveAction}
        isUpdating={isUpdating}
        isDeleting={isRemoving}
        itemType='Betrieb'
        allOrigins={allOrigins}
      />
    </>
  );
}

export function SuggestCompanyForm({
  pendingCompanies,
  allOrigins,
  onSuggest,
  isSuggesting,
}: {
  pendingCompanies: GenericItem[];
  allOrigins: GenericItem[];
  onSuggest: (item: CompanyWithOrigin) => void;
  isSuggesting: boolean;
}) {
  const [newCompanyText, setNewCompanyText] = useState('');
  const [selectedOriginId, setSelectedOriginId] = useState<string | null>();
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    if (!newCompanyText.trim()) {
      toast.info('Bitte geben Sie einen Namen für den Betrieb ein.');
      return;
    }

    if (!selectedOriginId || selectedOriginId === 'none') {
      toast.error('Bitte wählen Sie eine Herkunft für den Betrieb aus.');
      return;
    }

    const newSuggestion: CompanyWithOrigin = {
      id: uuidv4(),
      name: newCompanyText.trim(),
      status: 'active',
      originId: selectedOriginId,
      originName: allOrigins.find((item) => item.id === selectedOriginId)?.name,
    };

    onSuggest(newSuggestion);
    setNewCompanyText('');
    setSelectedOriginId(null);
    setHasAttemptedSubmit(false);
  };

  return (
    <div>
      {pendingCompanies && pendingCompanies.length > 0 && (
        <div className='mb-4'>
          <h4 className='text-sm font-medium text-foreground'>
            Bisherige Vorschläge
          </h4>
          <div className='mt-2 flex flex-wrap gap-2'>
            {pendingCompanies.map((company) => (
              <Badge key={company.id} variant='outline'>
                {company.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
      <form onSubmit={handleAddCompany} className='space-y-3'>
        <div className='flex flex-col items-end gap-2 sm:flex-row'>
          <Input
            type='text'
            value={newCompanyText}
            onChange={(e) => setNewCompanyText(e.target.value)}
            placeholder='Name des neuen Betriebs...'
            disabled={isSuggesting}
          />
          <div className='flex gap-2'>
            <Select
              value={selectedOriginId ?? ''}
              onValueChange={(value) => setSelectedOriginId(value)}
              disabled={isSuggesting}
            >
              <SelectTrigger
                className={
                  hasAttemptedSubmit &&
                  (!selectedOriginId || selectedOriginId === 'none')
                    ? 'border-destructive focus:border-destructive'
                    : ''
                }
              >
                <SelectValue placeholder='Herkunft auswählen...' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='none'>Keine Herkunft</SelectItem>
                {allOrigins.map((origin) => (
                  <SelectItem key={origin.id} value={origin.id}>
                    {origin.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size='icon'
              type='submit'
              variant='outline'
              disabled={
                isSuggesting ||
                newCompanyText.length <= 0 ||
                !selectedOriginId ||
                selectedOriginId === 'none'
              }
              className='shrink-0'
              aria-label='Suggest new company'
            >
              {isSuggesting ? <Loader2 className='animate-spin' /> : <Plus />}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
