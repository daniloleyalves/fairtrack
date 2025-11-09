'use client';

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { Label } from '@components/ui/label';
import { Separator } from '@components/ui/separator';
import { GenericItem } from '@server/db/db-types';
import type { ContributionItem } from '@features/contribution/models/contribution';
import { cn, formatNumber } from '@/lib/utils';
import { differenceInCalendarDays, startOfToday } from 'date-fns';
import { InfinityIcon, Apple } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface CategoryStepProps {
  categories: (GenericItem & { image: string })[];
  contributions: ContributionItem[];
  onSelectCategory: (category: GenericItem & { image: string }) => void;
}

export function CategoryStep({
  categories,
  contributions,
  onSelectCategory,
}: CategoryStepProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const handleImageError = (categoryId: string) => {
    setImageErrors((prev) => new Set(prev).add(categoryId));
  };

  return (
    <div className='overflow-y-auto'>
      <DialogHeader className='pt-6'>
        <DialogTitle>Kategorien</DialogTitle>
        <DialogDescription>
          Wähle alle zutreffenden Kategorien sowie die Menge und Haltbarkeit der
          Lebensmittel, die aus der ausgewählten Herkunft stammen.
        </DialogDescription>
      </DialogHeader>
      <Separator className='my-6' />

      <div className='mb-14 grid w-full grid-cols-1 gap-2 sm:grid-cols-2'>
        {sortedCategories.map((category) => {
          const contribution = contributions.find(
            (item) => item.categoryId === category.id,
          );

          return (
            <div key={category.id} className='relative'>
              <button
                type='button'
                className={cn(
                  'flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md shadow-sm',
                  contribution
                    ? 'border-[3px] border-primary p-2 py-6'
                    : 'border-[1px] border-muted-foreground px-[10px] py-[26px]',
                )}
                onClick={() => onSelectCategory(category)}
              >
                {imageErrors.has(category.id) || !category.image ? (
                  <div className='flex size-14 items-center justify-center rounded-md bg-muted'>
                    <Apple className='size-8 text-muted-foreground' />
                  </div>
                ) : (
                  <Image
                    src={category.image}
                    width={56}
                    height={56}
                    alt='category icon'
                    loading='eager'
                    decoding='sync'
                    onError={() => handleImageError(category.id)}
                  />
                )}
                <Label>{category.name}</Label>
              </button>
              {contribution && (
                <div
                  className={cn(
                    'absolute bottom-0.5 left-1/2 z-50 flex h-[50px] w-[90px] -translate-x-1/2 translate-y-[100%] flex-col items-center justify-center rounded-b-lg',
                    !contribution.quantity ? 'bg-destructive' : 'bg-primary',
                  )}
                >
                  <span className='text-white'>
                    {formatNumber(contribution.quantity)} kg
                  </span>
                  <span className='text-xs text-white'>
                    {contribution.shelfLife ? (
                      <>
                        {differenceInCalendarDays(
                          contribution.shelfLife,
                          startOfToday(),
                        )}{' '}
                        Tage
                      </>
                    ) : (
                      <InfinityIcon className='size-4' />
                    )}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
