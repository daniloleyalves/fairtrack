'use client';

import { useState } from 'react';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card';
import { Alert, AlertDescription } from '@ui/alert';
import { Switch } from '@ui/switch';
import { ConfirmModal } from '@/components/confirm-modal'; // Adjust import path as needed

interface FairteilerDisableToggleProps {
  isDisabled: boolean;
  onToggleDisabled: (disabled: boolean) => void;
  className?: string;
}

export function FairteilerDisableToggle({
  isDisabled,
  onToggleDisabled,
  className,
}: FairteilerDisableToggleProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleToggle = (checked: boolean) => {
    if (checked && !isDisabled) {
      // Disabling fairteiler - show confirmation modal
      setShowConfirmModal(true);
    } else {
      // Enabling fairteiler - no confirmation needed
      onToggleDisabled(checked);
    }
  };

  const confirmDisable = () => {
    setShowConfirmModal(false);
    onToggleDisabled(true);
  };

  return (
    <>
      <Card className={className}>
        <CardHeader className='flex justify-between'>
          <div className='flex flex-col gap-3 xs:flex-row'>
            <div className='flex size-10 min-w-10 items-center justify-center rounded-lg bg-tertiary/10'>
              {isDisabled ? (
                <EyeOff className='size-5 text-muted-foreground' />
              ) : (
                <Eye className='size-5 text-tertiary' />
              )}
            </div>
            <div>
              <CardTitle> Fairteiler-Status</CardTitle>
              <CardDescription>
                Steuere die Sichtbarkeit deines Fairteilers auf der Karte und in
                Listen.
              </CardDescription>
            </div>
          </div>
          <Switch
            id='fairteiler-enabled'
            checked={!isDisabled}
            onCheckedChange={(checked) => handleToggle(!checked)}
          />
        </CardHeader>
        {isDisabled && (
          <CardContent>
            <Alert variant='destructive'>
              <AlertTriangle className='size-4' />
              <AlertDescription>
                <strong>Fairteiler ist deaktiviert:</strong> Er erscheint nicht
                auf der Karte und ist für andere Nutzer nicht sichtbar. Du
                kannst ihn jederzeit wieder aktivieren.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>
      <ConfirmModal
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        title='Fairteiler deaktivieren?'
        description='Möchtest du den Fairteiler wirklich deaktivieren? Er wird dann nicht mehr auf der Karte angezeigt und ist für andere Nutzer nicht sichtbar.'
        actionTitle='Ja, deaktivieren'
        actionVariant='destructive'
        onConfirm={confirmDisable}
        useTrigger={false}
      />
    </>
  );
}
