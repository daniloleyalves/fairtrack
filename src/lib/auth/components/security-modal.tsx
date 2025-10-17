'use client';

import { Button } from '@components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export function SecurityModal({
  isOpen,
  onClose,
  userEmail,
}: SecurityModalProps) {
  const router = useRouter();

  const handlePasswordReset = () => {
    onClose();
    router.push(`/reset-password?email=${encodeURIComponent(userEmail)}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <div className='flex items-center gap-3'>
            <AlertTriangle className='h-6 w-6 text-amber-500' />
            <DialogTitle>Passwort erforderlich</DialogTitle>
          </div>
          <DialogDescription className='text-left'>
            Seit November 2025 sind alle Konten verpflichtet, ein Passwort zu
            haben. Ihr Konto benötigt ein neues Passwort, um wieder Zugang zu
            erhalten.
          </DialogDescription>
        </DialogHeader>

        <div className='rounded-md bg-amber-50 p-4 text-sm text-amber-800'>
          <p className='mb-2 font-medium'>Was passiert als nächstes?</p>
          <ul className='space-y-1 text-sm'>
            <li>• Sie werden zum Passwort-Reset weitergeleitet</li>
            <li>• Sie erhalten eine E-Mail mit Anweisungen</li>
            <li>
              • Nach dem Setzen eines neuen Passworts können Sie sich anmelden
            </li>
          </ul>
        </div>

        <DialogFooter className='flex-col gap-2 sm:flex-row'>
          <Button
            variant='outline'
            onClick={onClose}
            className='w-full sm:w-auto'
          >
            Abbrechen
          </Button>
          <Button onClick={handlePasswordReset} className='w-full sm:w-auto'>
            Passwort zurücksetzen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
