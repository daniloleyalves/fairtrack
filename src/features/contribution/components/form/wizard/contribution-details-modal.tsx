'use client';

import {
  DaysToDateAdapter,
  QuantityIncrementer,
} from '@/components/form/quantity-incrementer';
import { cn } from '@/lib/utils';
import { Button } from '@components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { Label } from '@components/ui/label';
import type { ContributionItem } from '@features/contribution/models/contribution';
import { GenericItem } from '@server/db/db-types';
import { InfinityIcon, Apple } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ContributionDetailsModalProps {
  // The modal is open whenever a contribution object is passed
  contribution:
    | (ContributionItem & { category: GenericItem & { image: string } })
    | null;
  // Callbacks to notify the parent of user actions
  onSave: (contribution: ContributionItem) => void;
  onRemove: (categoryId: string) => void;
  onClose: () => void;
}

export function ContributionDetailsModal({
  contribution,
  onSave,
  onRemove,
  onClose,
}: ContributionDetailsModalProps) {
  // Internal state to manage the form while the modal is open.
  // This avoids modifying the parent's state directly.
  const [quantity, setQuantity] = useState(0);
  const [shelfLife, setShelfLife] = useState<Date | null>(null);
  const [imageError, setImageError] = useState(false);

  // When the `contribution` prop changes (i.e., a new item is selected),
  // reset the internal form state.
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (contribution && !isInitialized) {
      setQuantity(contribution.quantity);
      setShelfLife(contribution.shelfLife);
      setIsInitialized(true);
    }
  }, [contribution, isInitialized]);

  // Reset the flag when modal closes
  useEffect(() => {
    if (!contribution) {
      setIsInitialized(false);
      setImageError(false);
    }
  }, [contribution]);

  const handleSave = () => {
    if (!contribution) {
      return;
    }
    if (quantity <= 0) {
      toast.error('Die Menge muss größer als 0 sein.');
      return;
    }
    // Call the onSave callback with the updated contribution object
    onSave({
      ...contribution,
      quantity,
      shelfLife,
    });
  };

  const handleRemove = () => {
    if (!contribution) {
      return;
    }

    onRemove(contribution.categoryId);
  };

  // The modal is controlled by the presence of the `contribution` prop
  const isOpen = !!contribution;
  // A contribution is considered "existing" if it already has a quantity > 0
  const isExistingContribution = (contribution?.quantity ?? 0) > 0;

  if (!contribution) {
    return null;
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent
        className='flex h-max max-h-[calc(100vh-8rem)] w-full max-w-xl flex-col sm:max-h-[calc(100vh-2rem)]'
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          onClose();
        }}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className='flex items-center justify-center gap-2 text-2xl'>
            {imageError || !contribution.category.image ? (
              <div className='flex size-10 items-center justify-center rounded-md bg-muted'>
                <Apple className='size-6 text-muted-foreground' />
              </div>
            ) : (
              <Image
                src={contribution.category.image}
                width={40}
                height={40}
                alt='category icon'
                loading='eager'
                decoding='sync'
                onError={() => setImageError(true)}
              />
            )}
            {contribution.category.name}
          </DialogTitle>
          <DialogDescription className='text-center'>
            Bitte gib eine möglichst genaue Menge sowie die geschätzte
            Haltbarkeit des Lebensmittels an.
          </DialogDescription>
        </DialogHeader>
        <div className='min-h-0 overflow-y-auto'>
          <div className='mt-4 mb-8 flex w-full flex-col items-center justify-center gap-10'>
            <div className='flex flex-col items-center justify-center gap-4'>
              <Label htmlFor='quantity' className='text-md text-center'>
                Wie viel hast du gerettet? <br />
                (Kilogramm)
              </Label>
              <QuantityIncrementer
                name='quantity'
                value={quantity}
                inputWidth={80}
                enableSmallIncrements={true}
                onChange={setQuantity}
              />
            </div>
            <div className='flex flex-col items-center justify-center gap-4'>
              <div className='flex flex-col items-center gap-2'>
                <Label htmlFor='shelfLife' className='text-md'>
                  Wie lange genießbar? (Tage)
                </Label>
                <span className='text-center text-sm text-muted-foreground'>
                  Unkritische Haltbarkeit? Einfach unverändert lassen!
                </span>
              </div>
              <DaysToDateAdapter
                name='shelfLife'
                value={shelfLife}
                iconWhenZero={InfinityIcon}
                onChange={setShelfLife}
              />
            </div>
          </div>
          <div className='mx-auto flex w-1/2 flex-col gap-2'>
            <Button
              variant='outline'
              className={cn(
                isExistingContribution &&
                  'border-2 border-destructive hover:bg-destructive hover:text-white',
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isExistingContribution) {
                  handleRemove();
                } else {
                  onClose();
                }
              }}
            >
              {isExistingContribution ? 'Entfernen' : 'Abbrechen'}
            </Button>

            <Button
              type='button'
              disabled={quantity <= 0}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSave();
              }}
            >
              Okay
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
