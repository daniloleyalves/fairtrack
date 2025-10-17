'use client';

import {
  addFairteilerCompanyAction,
  removeFairteilerCompanyAction,
  suggestNewCompanyAction,
} from '@server/actions';
import { GenericItem } from '@server/db/db-types';
import { toast } from 'sonner';
import { useState } from 'react';
import useSWRMutation from 'swr/mutation';
import { Badge } from '@ui/badge';
import { Loader2, Plus, X } from 'lucide-react';
import { Button } from '@ui/button';
import { ConfirmModal } from '@components/confirm-modal';
import { ScrollArea } from '@ui/scroll-area';
import { FormSelectionItem } from './form-selection-item';
import { Input } from '@ui/input';
import useSWRSuspense from '@/lib/services/swr';
import {
  COMPANIES_BY_FAIRTEILER_KEY,
  COMPANY_KEY,
} from '@/lib/config/api-routes';
import { v4 as uuidv4 } from 'uuid';

// --- Main Component ---

export function CompanySelectionWrapper() {
  const { data: allCompanies } = useSWRSuspense<GenericItem[]>(COMPANY_KEY);

  const { data: chosenCompanies } = useSWRSuspense<GenericItem[]>(
    COMPANIES_BY_FAIRTEILER_KEY,
  );

  return (
    <CompanySelection
      allCompanies={allCompanies}
      chosenCompanies={chosenCompanies}
    />
  );
}

function CompanySelection({
  allCompanies,
  chosenCompanies,
}: {
  allCompanies: GenericItem[];
  chosenCompanies: GenericItem[];
}) {
  // --- Mutations  ---

  const { trigger: addFairteilerCompanyTrigger, isMutating: isAdding } =
    useSWRMutation(
      COMPANIES_BY_FAIRTEILER_KEY,
      (_key, { arg }: { arg: GenericItem }) => addFairteilerCompanyAction(arg),
      {
        populateCache: (
          addedCompany: GenericItem,
          currentCompanies: GenericItem[] = [],
        ) => {
          if (!currentCompanies.length) {
            return [addedCompany];
          }
          return [...currentCompanies, addedCompany];
        },
        revalidate: false,
        rollbackOnError: true,
        onError: () =>
          toast.error(
            'Fehlgeschlagen. Möglicherweise bist du nicht befug, diese Aktion auszuführen',
          ),
      },
    );

  const { trigger: removeFairteilerCompanyTrigger, isMutating: isRemoving } =
    useSWRMutation(
      COMPANIES_BY_FAIRTEILER_KEY,
      (_key, { arg }: { arg: GenericItem }) =>
        removeFairteilerCompanyAction(arg),
      {
        populateCache: (
          removedCompany: GenericItem,
          currentChosen: GenericItem[] = [],
        ) => {
          return (currentChosen || []).filter(
            (c) => c.id !== removedCompany.id,
          );
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

  // --- Handlers with Optimistic Updates ---

  const handleAddCompany = (companyToAdd: GenericItem) => {
    addFairteilerCompanyTrigger(companyToAdd, {
      optimisticData: (currentChosen: GenericItem[] = []) => {
        return [...currentChosen, companyToAdd];
      },
    });
  };

  const handleRemoveCompany = (companyToRemove: GenericItem) => {
    removeFairteilerCompanyTrigger(companyToRemove, {
      optimisticData: (currentChosen: GenericItem[] = []) => {
        return currentChosen.filter((c) => c.id !== companyToRemove.id);
      },
    });
  };

  // --- Derived State  ---

  const chosenCompanyIds = new Set(chosenCompanies.map((c) => c.id));
  const availableCompanies = allCompanies.filter(
    (company) =>
      !chosenCompanyIds.has(company.id) && company.status !== 'pending',
  );
  const pendingCompanies = allCompanies.filter(
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
                companies={chosenCompanies}
                onRemove={handleRemoveCompany}
                isRemoving={isRemoving}
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
                        onAdd={() => handleAddCompany(company)}
                        isAdding={isAdding}
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
            <SuggestCompanyForm pendingCompanies={pendingCompanies} />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Child Components ---

export function ChosenCompanies({
  companies,
  onRemove,
  isRemoving,
}: {
  companies: GenericItem[];
  onRemove: (company: GenericItem) => void;
  isRemoving: boolean;
}) {
  const [companyToRemove, setCompanyToRemove] = useState<GenericItem | null>(
    null,
  );

  const handleConfirmRemove = () => {
    if (!companyToRemove) return;
    try {
      onRemove(companyToRemove);
    } catch (e) {
      console.error('Removal failed', e);
    } finally {
      setCompanyToRemove(null);
    }
  };

  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      setCompanyToRemove(null);
    }
  };

  return (
    <>
      <div className='flex min-h-[2.5rem] flex-wrap items-center gap-2 rounded-lg border p-2'>
        {companies.length ? (
          companies.map((company) => (
            <Badge key={company.id} className='flex items-center gap-1 pr-1'>
              {company.name}
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='size-4 p-0 hover:bg-white/30 hover:text-white'
                onClick={() => setCompanyToRemove(company)}
                aria-label={`Remove ${company.name}`}
              >
                <X className='size-3' />
              </Button>
            </Badge>
          ))
        ) : (
          <p className='text-sm text-muted-foreground'>
            Keine Betriebe für diesen Fairteiler ausgewählt.
          </p>
        )}
      </div>
      <ConfirmModal
        open={!!companyToRemove}
        onOpenChange={handleModalOpenChange}
        title='Betrieb entfernen?'
        description={
          <>
            Bist du sicher, dass du den Betrieb{' '}
            <strong className='font-semibold'>{companyToRemove?.name}</strong>{' '}
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

export function SuggestCompanyForm({
  pendingCompanies,
}: {
  pendingCompanies: GenericItem[];
}) {
  const [newCompanyText, setNewCompanyText] = useState('');

  const { trigger: addTrigger, isMutating: isAdding } = useSWRMutation(
    COMPANY_KEY,
    (_key, { arg }: { arg: GenericItem }) => suggestNewCompanyAction(arg),
    {
      revalidate: false,
      rollbackOnError: true,
    },
  );

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyText.trim()) {
      toast.info('Bitte geben Sie einen Namen für den Betrieb ein.');
      return;
    }

    const newSuggestion: GenericItem = {
      id: uuidv4(),
      name: newCompanyText.trim(),
      status: 'pending',
    };

    try {
      await addTrigger(newSuggestion, {
        optimisticData: (currentCompanies: GenericItem[] = []) => {
          return [...currentCompanies, newSuggestion];
        },
      });

      setNewCompanyText('');
    } catch (e) {
      console.error('Failed to suggest company:', e);
      toast.error('Fehlgeschlagen, ' + String(e));
    }
  };

  return (
    <div>
      {pendingCompanies && pendingCompanies.length > 0 && (
        <div className='mb-4'>
          <h4 className='text-sm font-medium text-foreground dark:text-gray-100'>
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
      <form onSubmit={handleAddCompany} className='flex gap-2'>
        <Input
          type='text'
          value={newCompanyText}
          onChange={(e) => setNewCompanyText(e.target.value)}
          placeholder='Name des neuen Betriebs...'
          disabled={isAdding}
        />
        <Button
          size='icon'
          type='submit'
          variant='outline'
          disabled={isAdding || newCompanyText.length <= 0}
          className='shrink-0'
          aria-label='Suggest new company'
        >
          {isAdding ? <Loader2 className='animate-spin' /> : <Plus />}
        </Button>
      </form>
    </div>
  );
}
