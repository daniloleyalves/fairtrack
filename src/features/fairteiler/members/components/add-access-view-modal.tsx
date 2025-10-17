'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@components/ui/alert-dialog';
import { Button } from '@components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@components/ui/drawer';
import { useIsMobile } from '@/lib/hooks/use-devices';
import { CirclePlus } from 'lucide-react';
import { useState } from 'react';
import { AddAccessViewForm } from '../forms/add-access-view-form';

export function AddAccessViewModal() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <CirclePlus className='size-5' />
        Zugangsprofil anlegen
      </Button>
      {isMobile ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className='mb-12'>
            <DrawerHeader className='mb-4'>
              <DrawerTitle>Neues Zugangsprofil</DrawerTitle>
            </DrawerHeader>
            <AddAccessViewForm setOpen={setOpen} />
          </DrawerContent>
        </Drawer>
      ) : (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Neues Zugangsprofil</AlertDialogTitle>
            </AlertDialogHeader>
            <AddAccessViewForm setOpen={setOpen} />
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
