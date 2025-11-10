'use client';

import { Button } from '@components/ui/button';
import { Checkbox } from '@components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@components/ui/popover';
import { ScrollArea } from '@components/ui/scroll-area';
import { Textarea } from '@components/ui/textarea';
import { useWindowDimensions } from '@/lib/hooks/use-window-dimensions';
import {
  HelpCircle,
  MessageSquareText,
  Store,
  Tag,
  Thermometer,
  Wheat,
} from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import { useFormContext } from 'react-hook-form';
import { ContributionFormValues } from '@features/contribution/schemas/contribution-schema';

export function OptionalFieldsModal({
  index,
  open,
  setOpen,
  ...props
}: React.ComponentProps<'div'> & {
  index: number;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const windowDimensions = useWindowDimensions();
  const contributionForm = useFormContext<ContributionFormValues>();
  return (
    <Dialog {...props} open={open} onOpenChange={setOpen}>
      <DialogContent
        className='w-[calc(100vw-16px)] max-w-lg'
        style={{
          height:
            windowDimensions.height > 677
              ? 'auto'
              : windowDimensions.height - 5,
        }}
      >
        <DialogHeader className='w-full text-center'>
          <DialogTitle className='text-center text-2xl'>
            Optionale Informationen
          </DialogTitle>
          <DialogDescription className='text-center'>
            Hier können weitere Informationen zur Abgabe vermerkt werden
          </DialogDescription>
        </DialogHeader>
        <ScrollArea
          style={{
            height:
              windowDimensions.height > 677
                ? 'auto'
                : windowDimensions.height - 150,
          }}
        >
          <div className='my-8 flex w-full flex-col gap-8 px-2'>
            <FormField
              name={`contributions.${index}.title`}
              control={contributionForm.control}
              render={({ field }) => (
                <FormItem className='flex w-full flex-col gap-2'>
                  <div className='flex items-center gap-2'>
                    <Tag className='size-3' />
                    <FormLabel className='relative'>
                      Lebensmittelname
                      <Popover>
                        <PopoverTrigger>
                          <HelpCircle className='absolute top-1/2 ml-2 size-5 -translate-y-1/2 fill-tertiary text-white' />
                        </PopoverTrigger>
                        <PopoverContent>
                          Möchtest du das Lebensmittel spezifizieren?
                        </PopoverContent>
                      </Popover>
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name={`contributions.${index}.cool`}
              control={contributionForm.control}
              render={({ field }) => (
                <FormItem className='flex w-full flex-col justify-center gap-2'>
                  <div className='flex items-center gap-2'>
                    <Thermometer className='size-3' />
                    <FormLabel>In den Kühlschrank?</FormLabel>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value ?? false}
                      onCheckedChange={(checked) => field.onChange(checked)}
                      size='36px'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name={`contributions.${index}.company`}
              control={contributionForm.control}
              render={({ field }) => (
                <FormItem className='flex w-full flex-col gap-2'>
                  <div className='flex items-center gap-2'>
                    <Store className='size-3' />
                    <FormLabel className='relative'>
                      Betrieb
                      <Popover>
                        <PopoverTrigger>
                          <HelpCircle className='absolute top-1/2 ml-2 size-5 -translate-y-1/2 fill-tertiary text-white' />
                        </PopoverTrigger>
                        <PopoverContent>
                          Stammt das Lebensmittel aus einem bestimmten Betrieb?
                        </PopoverContent>
                      </Popover>
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name={`contributions.${index}.allergens`}
              control={contributionForm.control}
              render={({ field }) => (
                <FormItem className='flex w-full flex-col gap-2'>
                  <div className='flex items-center gap-2'>
                    <Wheat className='size-3' />
                    <FormLabel>Allergene und Inhaltsstoffe</FormLabel>
                  </div>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name={`contributions.${index}.comment`}
              control={contributionForm.control}
              render={({ field }) => (
                <FormItem className='flex w-full flex-col gap-2'>
                  <div className='flex items-center gap-2'>
                    <MessageSquareText className='size-3' />
                    <Label>Kommentar</Label>
                  </div>
                  <FormControl>
                    <Textarea rows={6} {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='mt-4 flex w-full justify-center'>
            <Button className='w-1/2' onClick={() => setOpen(false)}>
              Speichern
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
