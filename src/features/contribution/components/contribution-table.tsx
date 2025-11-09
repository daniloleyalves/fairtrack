'use client';

import {
  createContributionItem,
  type ContributionItem,
} from '@features/contribution/models/contribution';
import { useUserPreferences } from '@/lib/services/preferences-service';
import { ArrowDown, Loader2, Plus, Send } from 'lucide-react';
import { Suspense, useState } from 'react';
import { useFieldArray, useFormContext, useFormState } from 'react-hook-form';
import { Button } from '@ui/button';
import { Card, CardContent } from '@ui/card';
import { Label } from '@ui/label';
import { Switch } from '@ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ui/table';
import { EditableContributionRow } from './form/contribution-row';
import {
  ContributionTableProvider,
  useContributionTable,
} from '../context/contribution-table-context';
import { cn } from '@/lib/utils';
import { GenericItem } from '@server/db/db-types';
import { ContributionWizard } from './form/wizard/contribution-wizard';
import { Skeleton } from '@ui/skeleton';
import { useContribution } from '../context/contribution-context';

export default function ContributionTable() {
  const { preferences, updatePreference } = useUserPreferences();
  const [_editingIndex, setEditingIndex] = useState<number | null>(null);

  const isFormTableViewFast = preferences.formTableView === 'fast';

  const { control, trigger } = useFormContext();
  const formState = useFormState({ control });

  return (
    <ContributionTableProvider isFastView={isFormTableViewFast}>
      <Card>
        <CardContent className='p-4 md:p-6'>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <ContributionTableHead />
              </TableHeader>
              <TableBody>
                <Suspense fallback={<ContributionRowSkeleton />}>
                  <ContributionRows />
                </Suspense>
              </TableBody>
            </Table>
          </div>

          <div className='mt-4 flex w-full items-start justify-between gap-4 md:items-center'>
            <div className='flex items-center gap-2'>
              <Switch
                id='tableView-mode'
                checked={isFormTableViewFast}
                onCheckedChange={() => {
                  setEditingIndex(null);
                  // Trigger validation to show errors for incomplete rows when switching to wizard mode
                  if (preferences.formTableView === 'fast') {
                    trigger('contributions');
                  }
                  updatePreference(
                    'formTableView',
                    preferences.formTableView === 'fast' ? 'wizard' : 'fast',
                  );
                }}
              />
              <Label
                htmlFor='tableView-mode'
                className='text-xs font-normal text-muted-foreground'
              >
                Schnelle Ansicht
              </Label>
            </div>
            <Button type='submit' disabled={!formState.isDirty}>
              {formState.isSubmitSuccessful ? (
                <Loader2 className='animate-spin' />
              ) : (
                <Send className='mr-2 size-4' />
              )}
              Absenden
            </Button>
          </div>
        </CardContent>
      </Card>
    </ContributionTableProvider>
  );
}

function ContributionTableHead() {
  const { showAllColumns } = useContributionTable();

  return (
    <TableRow>
      <TableHead>Kategorie</TableHead>
      <TableHead
        className={cn(
          !showAllColumns && 'hidden',
          'sm:table-cell md:hidden lg:table-cell',
        )}
      >
        Herkunft
      </TableHead>
      <TableHead className={cn(!showAllColumns && 'hidden', 'sm:table-cell')}>
        Betrieb
      </TableHead>
      <TableHead>Menge (kg)</TableHead>
      <TableHead className={cn(!showAllColumns && 'hidden', 'sm:table-cell')}>
        Haltbarkeit
      </TableHead>
      <TableHead className='w-[48px]'></TableHead>
    </TableRow>
  );
}

export function ContributionRows() {
  // ---- GET DATA FROM CONTEXT ----
  const { origins, categories, companies } = useContribution();

  const formOptions = {
    fairteilerOrigins: [...origins].sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
    fairteilerCategories: [
      ...(categories as (GenericItem & { image: string })[]),
    ].sort((a, b) => a.name.localeCompare(b.name)),
    fairteilerCompanies: [
      ...(companies as (GenericItem & { originId: string })[]),
    ].sort((a, b) => a.name.localeCompare(b.name)),
  };

  // ---- ROW STATE ----
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const { isFastView, editingIndex, setEditingIndex } = useContributionTable();

  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    keyName: 'fieldId',
    control,
    name: 'contributions',
  });

  // ---- Row Actions ----
  const handleAddContribution = () => {
    if (isFastView) {
      append(createContributionItem());
    } else {
      setIsWizardOpen(true);
    }
  };

  const handleWizardSave = (newContributions: ContributionItem[]) => {
    append(newContributions);
  };

  return (
    <>
      {fields.length > 0 ? (
        fields.map((contributionField, index) => {
          const isEditing = isFastView || editingIndex === index;

          return (
            <EditableContributionRow
              key={contributionField.fieldId}
              index={index}
              fieldId={contributionField.fieldId}
              remove={remove}
              isEditing={isEditing}
              onEdit={() => setEditingIndex(index)}
              onSave={() => setEditingIndex(null)}
              formOptions={formOptions}
            />
          );
        })
      ) : (
        <TableRow>
          <TableCell className='py-10 text-center text-foreground' colSpan={6}>
            <p className='mb-2'>
              Bitte trage jedes Lebensmittel{' '}
              <span className='font-medium text-primary'>einzeln</span> ein.
            </p>
            <ArrowDown className='mx-auto mt-2 size-4' />
          </TableCell>
        </TableRow>
      )}
      <TableRow>
        <TableCell className='py-4' colSpan={6}>
          <div className='flex justify-center'>
            <Button
              type='button'
              className='flex size-12 items-center justify-center rounded-full'
              onClick={handleAddContribution}
            >
              <Plus />
            </Button>
          </div>
          <ContributionWizard
            open={isWizardOpen}
            onOpenChange={setIsWizardOpen}
            onSave={handleWizardSave}
            formOptions={formOptions}
          />
        </TableCell>
      </TableRow>
    </>
  );
}

function ContributionRowSkeleton() {
  return (
    <>
      <TableRow>
        <TableCell className='py-10 text-center text-foreground' colSpan={6}>
          <Skeleton className='mx-auto h-2 w-1/4 bg-secondary' />
          <Skeleton className='mx-auto mt-3 h-6 w-2 bg-secondary' />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className='py-4' colSpan={6}>
          <Skeleton className='mx-auto size-12 rounded-full bg-secondary' />
        </TableCell>
      </TableRow>
    </>
  );
}
