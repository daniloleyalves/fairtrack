'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@components/ui/alert-dialog';
import { Button } from '@components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@components/ui/drawer';
import { useIsMobile } from '@/lib/hooks/use-devices';
import { CirclePlus } from 'lucide-react';
import { useState } from 'react';
import { InviteMemberForm } from '../forms/invite-member-form';

export function InviteMemberModal() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <CirclePlus className='size-5' />
        Mitglied einladen
      </Button>
      {isMobile ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className='mb-12'>
            <DrawerHeader className='mb-4'>
              <DrawerTitle>Mitglied einladen</DrawerTitle>
              <DrawerDescription>
                {' '}
                Lade neue Teammitglieder ein und weise ihnen eine passende Rolle
                zu, um deren Zugriffsrechte zu steuern.
              </DrawerDescription>
            </DrawerHeader>
            <div className='px-4'>
              <InviteMemberForm setOpen={setOpen} />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mitglied einladen</AlertDialogTitle>
              <AlertDialogDescription>
                Lade neue Teammitglieder ein und weise ihnen eine passende Rolle
                zu, um deren Zugriffsrechte zu steuern.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <InviteMemberForm setOpen={setOpen} />
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
