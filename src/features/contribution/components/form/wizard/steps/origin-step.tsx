'use client';

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { Label } from '@components/ui/label';
import { RadioGroup, RadioGroupItem } from '@components/ui/radio-group';
import { Separator } from '@components/ui/separator';
import { GenericItem } from '@server/db/db-types';
import { cn } from '@/lib/utils';

interface OriginStepProps {
  origins: GenericItem[];
  selectedOriginId?: string;
  onSelect: (originId: string) => void;
}

export function OriginStep({
  origins,
  selectedOriginId,
  onSelect,
}: OriginStepProps) {
  return (
    <div className='overflow-y-auto'>
      <DialogHeader className='pt-6'>
        <DialogTitle>Herkunft</DialogTitle>
        <DialogDescription>
          Dieser Assistent führt dich Schritt für Schritt durch das Formular, um
          deine geretteten Lebensmittel zu erfassen. Starte mit der Auswahl der
          Herkunft der Lebensmittel, um sie eindeutig zuordnen zu können.
        </DialogDescription>
      </DialogHeader>
      <Separator className='my-6' />

      <RadioGroup
        value={selectedOriginId}
        className='mt-2 grid w-full grid-cols-1 gap-2 sm:grid-cols-2'
      >
        {origins.map((origin) => (
          <div
            key={origin.id}
            className={cn(
              'flex cursor-pointer items-center justify-center rounded-md border border-muted-foreground py-12 shadow-sm',
              selectedOriginId === origin.id && 'bg-primary text-white',
            )}
            onClick={() => onSelect(origin.id)}
          >
            <RadioGroupItem value={origin.id} className='sr-only' />
            <Label>{origin.name}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
