'use client';

import { useMutation } from '@tanstack/react-query';
import { ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@ui/button';
import { invokeAction } from '@/lib/hooks/use-form-action';
import { startQrGuestSessionAction } from '@/server/qr-code/actions';

export function QrGuestButton() {
  const start = useMutation({
    mutationFn: () => invokeAction(startQrGuestSessionAction, undefined),
    onSuccess: ({ redirectTo }) => window.location.assign(redirectTo),
    onError: (error) => toast.error(error.message),
  });

  return (
    <Button
      variant='outline'
      className='w-full'
      onClick={() => start.mutate()}
      disabled={start.isPending || start.isSuccess}
    >
      Als Gast fortfahren
      {start.isPending || start.isSuccess ? (
        <Loader2 className='size-4 animate-spin' />
      ) : (
        <ArrowRight className='size-4' />
      )}
    </Button>
  );
}
