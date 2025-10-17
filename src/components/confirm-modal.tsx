'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@components/ui/alert-dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@components/ui/drawer';
import { Button, buttonVariants } from '@components/ui/button';
import type { VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { useIsMobile } from '@/lib/hooks/use-devices';

interface ConfirmModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description: React.ReactNode;
  useTrigger?: boolean;
  triggerVariant?: VariantProps<typeof buttonVariants>['variant'];
  triggerSize?: VariantProps<typeof buttonVariants>['size'];
  disabled?: boolean;
  isPending?: boolean;
  actionTitle?: string;
  actionVariant?: VariantProps<typeof buttonVariants>['variant'];
  onConfirm: () => void;
  children?: React.ReactNode;
}

export function ConfirmModal({
  open,
  onOpenChange,
  title = 'Bist du sicher?',
  description,
  useTrigger = true,
  triggerVariant = 'ghost',
  triggerSize = 'default',
  disabled = false,
  isPending = false,
  actionTitle = 'Weiter',
  actionVariant = 'default',
  onConfirm,
  children,
}: ConfirmModalProps) {
  const isMobile = useIsMobile();

  const triggerButton = useTrigger ? (
    <Button
      variant={triggerVariant}
      size={triggerSize}
      disabled={disabled || isPending}
      className='p-2'
    >
      {children}
    </Button>
  ) : null;

  const actionButton = (
    <Button
      variant={actionVariant}
      onClick={() => {
        onConfirm();
      }}
      disabled={isPending}
    >
      {isPending && <Loader2 className='mr-2 size-4 animate-spin' />}
      {actionTitle}
    </Button>
  );

  if (!isMobile) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        {useTrigger && (
          <AlertDialogTrigger asChild>{triggerButton}</AlertDialogTrigger>
        )}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            {actionButton}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {useTrigger && <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>}
      <DrawerContent>
        <DrawerHeader className='text-left'>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className='pt-2'>
          {actionButton}
          <DrawerClose asChild>
            <Button
              variant='outline'
              onClick={() => {
                if (!onOpenChange) {
                  open = false;
                }
              }}
            >
              Abbrechen
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
