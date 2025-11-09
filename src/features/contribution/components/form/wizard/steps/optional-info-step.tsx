'use client';

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { Separator } from '@components/ui/separator';
import { GenericItem } from '@server/db/db-types';
import type { ContributionItem } from '@features/contribution/models/contribution';
import { cn, formatNumber } from '@/lib/utils';
import { differenceInCalendarDays, startOfToday } from 'date-fns';
import {
  MessageSquareText,
  Store,
  Tag,
  Thermometer,
  Wheat,
  Apple,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface OptionalInfoStepProps {
  contributions: ContributionItem[];
  categories: (GenericItem & { image: string })[];
  onEditInfo: (categoryId: string) => void;
}

// Helper to check which optional fields are filled
function getFilledOptionalFields(
  contribution: ContributionItem,
  categoryName: string,
) {
  return {
    // Title is considered "filled" if it's custom and not the default category name
    title: contribution.title && contribution.title !== categoryName,
    cool: contribution.cool,
    company: !!contribution.company,
    allergens: !!contribution.allergens,
    comment: !!contribution.comment,
  };
}

export function OptionalInfoStep({
  contributions,
  categories,
  onEditInfo,
}: OptionalInfoStepProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (categoryId: string) => {
    setImageErrors((prev) => new Set(prev).add(categoryId));
  };
  return (
    <div className='overflow-y-auto'>
      <DialogHeader className='pt-6'>
        <DialogTitle>Optionale Informationen</DialogTitle>
        <DialogDescription>
          Klicke auf einen Eintrag, um Details zu ergänzen. Ausgefüllte Angaben
          leuchten in Grün auf.
        </DialogDescription>
      </DialogHeader>
      <Separator className='my-6' />
      <div className='flex flex-col gap-4 px-1'>
        {contributions.map((contribution) => {
          const category = categories.find(
            (c) => c.id === contribution.categoryId,
          );
          if (!category) return null;

          const filledFields = getFilledOptionalFields(
            contribution,
            category.name,
          );

          return (
            <button
              key={contribution.categoryId}
              type='button'
              // Adjusted flex-row properties for spacing and alignment
              className='flex w-full cursor-pointer flex-col justify-between rounded-lg border-2 p-4 text-left shadow-sm transition-colors hover:border-primary/50 hover:bg-accent sm:flex-row sm:items-stretch sm:gap-4'
              onClick={() => onEditInfo(contribution.categoryId)}
            >
              {/* Left Side: Main Info */}
              <div className='flex min-w-max flex-wrap items-center gap-3'>
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
                    onError={() => handleImageError(category.id)}
                  />
                )}
                <div className='flex flex-col justify-center'>
                  <span className='text-md font-medium md:text-lg'>
                    {contribution.title || category.name}
                  </span>
                  <div className='md:text-md flex w-max gap-3 text-sm text-muted-foreground'>
                    <span>{formatNumber(contribution.quantity)} kg</span>
                    <span>|</span>
                    <span>
                      {contribution.shelfLife
                        ? `${differenceInCalendarDays(contribution.shelfLife, startOfToday())} Tage haltbar`
                        : 'Unkritisch'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Optional Info Checklist */}
              <div className='flex-shrink-0 border-border pt-4 pl-0 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4'>
                <span className='text-xs font-medium'>Optionale Angaben</span>
                <div className='mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs'>
                  {[
                    {
                      isFilled: filledFields.title,
                      icon: Tag,
                      label: 'Eigener Name',
                    },
                    {
                      isFilled: filledFields.cool,
                      icon: Thermometer,
                      label: 'Gekühlt',
                    },
                    {
                      isFilled: filledFields.company,
                      icon: Store,
                      label: 'Betrieb',
                    },
                    {
                      isFilled: filledFields.allergens,
                      icon: Wheat,
                      label: 'Allergene',
                    },
                    {
                      isFilled: filledFields.comment,
                      icon: MessageSquareText,
                      label: 'Kommentar',
                    },
                  ].map((field) => (
                    <span
                      key={field.label}
                      className={cn(
                        'flex items-center gap-1 text-muted-foreground transition-colors',
                        field.isFilled && 'text-primary',
                      )}
                    >
                      <field.icon className='size-3' /> {field.label}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
