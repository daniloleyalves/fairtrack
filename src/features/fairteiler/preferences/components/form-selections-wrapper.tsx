'use client';

import { ListErrorBoundary } from '@components/error-boundary';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card';
import { Separator } from '@ui/separator';
import { Settings } from 'lucide-react';
import { CompanySelectionWrapper } from './company-selection';
import { OriginSelectionWrapper } from './origin-selection';
import { CategorySelectionWrapper } from './category-selection';

export function FormSelectionsWrapper() {
  return (
    <Card className='h-max'>
      <CardHeader>
        <div className='flex flex-col gap-3 xs:flex-row'>
          <div className='flex size-10 min-w-10 items-center justify-center rounded-lg bg-primary/10'>
            <Settings className='size-5 text-primary' />
          </div>
          <div>
            <CardTitle>Formular-Einstellungen</CardTitle>
            <CardDescription>
              Verwalte die verfügbaren Optionen für Herkünfte, Kategorien und
              Betriebe im Retteformular
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <ListErrorBoundary>
          <OriginSelectionWrapper />
        </ListErrorBoundary>
        <Separator />
        <ListErrorBoundary>
          <CategorySelectionWrapper />
        </ListErrorBoundary>
        <Separator />
        <ListErrorBoundary>
          <CompanySelectionWrapper />
        </ListErrorBoundary>
      </CardContent>
    </Card>
  );
}
