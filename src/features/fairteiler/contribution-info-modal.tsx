import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useIsMobile } from '@/lib/hooks/use-devices';
import { vContribution } from '@/server/db/db-types';
import { formatInTimeZone } from 'date-fns-tz';
import Image from 'next/image';
import { Dispatch, SetStateAction } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '../../components/ui/drawer';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';

interface InfoModalProps {
  item: vContribution;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function ContributionInfoModal({ item, open, setOpen }: InfoModalProps) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <Dialog open={open}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-3'>
              {item.categoryImage && (
                <Image
                  src={item.categoryImage || ''}
                  alt='category icon'
                  width={40}
                  height={40}
                  className='size-10 rounded'
                />
              )}
              {item.foodTitle}
            </DialogTitle>
          </DialogHeader>
          <InfoContent item={item} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline' onClick={() => setOpen(false)}>
                Schließen
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open}>
      <DrawerContent>
        <DrawerHeader className='text-left'>
          <DrawerTitle className='flex items-center gap-3'>
            {item.categoryImage && (
              <Image
                src={item.categoryImage || ''}
                alt='category icon'
                width={40}
                height={40}
                className='size-10 rounded'
              />
            )}
            {item.foodTitle}
          </DrawerTitle>
        </DrawerHeader>
        <InfoContent item={item} className='px-4' />
        <DrawerFooter className='pt-2'>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Schließen
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function InfoContent({
  item,
  className,
}: {
  item: vContribution;
  className?: string;
}) {
  return (
    <ScrollArea className={`my-4 max-h-[60vh] ${className}`}>
      <div className='space-y-4 pr-6'>
        <ul className='space-y-3 text-sm'>
          <InfoRow label='Menge' value={`${item.quantity} kg`} />
          <InfoRow label='Kategorie' value={item.categoryName} />
          <InfoRow label='Herkunft' value={item.originName} />
          <InfoRow
            label='Betrieb'
            value={item.foodCompany ?? item.companyName}
          />
          <InfoRow label='Kühlen' value={item.foodCool ? 'Ja' : 'Nein'} />
          <InfoRow
            label='Genießbar bis'
            value={
              item.shelfLife
                ? formatInTimeZone(item.shelfLife, 'UTC', 'dd.MM.yyyy')
                : 'Unkritisch'
            }
          />
          <InfoRow
            label='Gerettet am'
            value={formatInTimeZone(item.contributionDate, 'UTC', 'dd.MM.yyyy')}
          />
          <InfoRow label='Inhaltsstoffe' value={item.foodAllergens} />
          <InfoRow label='Kommentar' value={item.foodComment} />
        </ul>
        <Separator />
        <div className='space-y-2'>
          <h3 className='text-sm font-medium'>Geliefert von</h3>
          <ul className='space-y-3 text-sm'>
            <InfoRow label='Name' value={item.contributorName} />
            <InfoRow label='Email' value={item.contributorEmail} />
          </ul>
        </div>
      </div>
    </ScrollArea>
  );
}

// Helper component for consistent row styling
function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <li className='grid grid-cols-2 items-center gap-4'>
      <span className='text-muted-foreground'>{label}:</span>
      <span>{value ?? '-'}</span>
    </li>
  );
}
