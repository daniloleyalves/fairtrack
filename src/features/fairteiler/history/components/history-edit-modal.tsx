'use client';

import { QuantityIncrementer } from '@/components/form/quantity-incrementer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useFormAction } from '@/lib/hooks/use-form-action';
import { useIsMobile } from '@/lib/hooks/use-devices';
import { editContributionAction } from '@/server/contribution/actions';
import { contributionKeys } from '@/server/contribution/query-keys';
import { fairteilerKeys } from '@/server/fairteiler/query-keys';
import { userKeys } from '@/server/user/query-keys';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import * as z from 'zod';
import { HistoryVersionHistory } from './history-version-history';
import { vContribution } from '@/server/db/db-types';
import { editContributionFormSchema } from '@/features/contribution/schemas/contribution-schema';
import { useHistoryData } from '../use-history-data';

export type EditContributionFormValues = z.infer<
  typeof editContributionFormSchema
>;

// ---

interface EditModalProps {
  item: vContribution;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function HistoryEditModal({ item, open, setOpen }: EditModalProps) {
  const queryClient = useQueryClient();
  const { refresh } = useHistoryData();
  const isMobile = useIsMobile();

  const form = useForm<EditContributionFormValues>({
    resolver: zodResolver(editContributionFormSchema),
    defaultValues: {
      checkinId: item.checkinId,
      quantity: item.quantity,
    },
  });

  const editContribution = useFormAction(editContributionAction, form, {
    successMessage: 'Beitrag erfolgreich bearbeitet.',
    onSuccess: () => {
      refresh();
      void queryClient.invalidateQueries({
        queryKey: contributionKeys.versionHistory(item.checkinId).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: fairteilerKeys.dashboard().queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: userKeys.dashboard().queryKey,
      });
      setOpen(false);
    },
  });

  const isSubmitting = editContribution.isPending;

  // Reset form when modal opens or item changes
  useEffect(() => {
    if (open) {
      form.reset({
        checkinId: item.checkinId,
        quantity: item.quantity,
      });
    }
  }, [open, item.checkinId, item.quantity, form]);

  function handleFormSubmit(
    values: z.infer<typeof editContributionFormSchema>,
  ) {
    if (Object.keys(form.formState.errors).length) {
      return;
    }

    editContribution.execute({
      checkinId: item.checkinId,
      prevValue: item.quantity.toString(),
      newValue: values.quantity.toString(),
      field: 'quantity',
    });
  }

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset form after animation completes
      setTimeout(() => {
        form.reset({
          checkinId: item.checkinId,
          quantity: item.quantity,
        });
      }, 200);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    // Reset form after animation completes
    setTimeout(() => {
      form.reset({
        checkinId: item.checkinId,
        quantity: item.quantity,
      });
    }, 200);
  };

  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='mx-auto flex items-center gap-3'>
              {item.categoryImage && (
                <Image
                  src={item.categoryImage}
                  alt='category icon'
                  width={40}
                  height={40}
                  className='size-10 rounded'
                />
              )}
              {item.foodTitle}
            </DialogTitle>
            <DialogDescription className='text-center'>
              Die Menge einer Lebensmittelabgabe kann nachträglich geändert
              werden. Alle Änderungen werden versioniert.
            </DialogDescription>
          </DialogHeader>
          <EditFormContent
            checkinId={item.checkinId}
            form={form}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className='mx-auto mb-4 flex items-center gap-3'>
            {item.categoryImage && (
              <Image
                src={item.categoryImage}
                alt='category icon'
                width={40}
                height={40}
                className='size-10 rounded'
              />
            )}
            {item.foodTitle}
          </DrawerTitle>
          <DrawerDescription>
            Die Menge einer Lebensmittelabgabe kann nachträglich geändert
            werden. Alle Änderungen werden versioniert.
          </DrawerDescription>
        </DrawerHeader>
        <EditFormContent
          checkinId={item.checkinId}
          form={form}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
          onCancel={handleCancel}
        />
      </DrawerContent>
    </Drawer>
  );
}

/**
 * A reusable component containing the form fields, version history,
 * and action buttons, used by both Dialog and Drawer.
 */
function EditFormContent({
  checkinId,
  form,
  onSubmit,
  isSubmitting,
  onCancel,
  className,
}: {
  checkinId: string;
  form: UseFormReturn<EditContributionFormValues>;
  onSubmit: (values: EditContributionFormValues) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  className?: string;
}) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
        <div className='space-y-6 px-4 pb-4 md:px-1 md:pb-1'>
          {/* --- Form Field --- */}
          <div className='flex flex-col items-center justify-center pt-4'>
            <FormField
              name='quantity'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='justify-center'>
                    Neue Menge (Kilogramm)
                  </FormLabel>
                  <FormControl>
                    <QuantityIncrementer
                      {...field}
                      enableSmallIncrements={true}
                      inputWidth={80}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* --- Version History Accordion --- */}
          <Accordion type='single' collapsible className='w-full'>
            <AccordionItem value='version-history'>
              <AccordionTrigger className='cursor-pointer justify-center'>
                Versionsverlauf
              </AccordionTrigger>
              <AccordionContent className='mx-auto max-w-3/5'>
                <HistoryVersionHistory checkinId={checkinId} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* --- Action Buttons --- */}
          <div className='flex w-full justify-end gap-2 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Abbrechen
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting && <Loader2 className='mr-2 size-4 animate-spin' />}
              Änderungen speichern
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
