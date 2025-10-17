'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  KeyRound,
  User as UserIcon,
  TriangleAlert,
  EyeOff,
  Eye,
} from 'lucide-react';
import UserProfileForm from '../forms/user-profile-form';
import { User } from '@/server/db/db-types';
import Link from 'next/link';
import { handleClientOperation } from '@/lib/client-error-handling';
import { authClient } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from '@/components/confirm-modal';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function UserAccountCard({
  user,
  onUpdateUser,
}: {
  user: User;
  onUpdateUser: (formData: FormData, isAnonymous: boolean) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleUserDeletion = () => {
    handleClientOperation(
      async () => {
        const result = await authClient.deleteUser();

        if (result.data?.success) {
          router.push('/sign-in');
        }
      },
      setIsDeleting,
      (error) => {
        console.error('Error deleting user:', error);
        setIsDeleting(false);
      },
    );
  };

  const handleUpdateAnonymity = (isAnonymous: boolean) => {
    const updatedUser: User = { ...user, isAnonymous };
    const formData = new FormData();
    for (const key in updatedUser) {
      const value = updatedUser[key as keyof User];
      if (value != null) {
        formData.append(key, String(value));
      }
    }

    onUpdateUser(formData, isAnonymous);
  };

  return (
    <Card className='w-full'>
      <CardHeader>
        <div className='flex flex-col gap-3 xs:flex-row'>
          <div className='flex size-10 min-w-10 items-center justify-center rounded-lg bg-primary/10'>
            <UserIcon className='size-5 text-primary' />
          </div>
          <div>
            <CardTitle>Benutzerkonto</CardTitle>
            <CardDescription>
              Verwalte deine Kontoinformationen und Sicherheitseinstellungen
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* User Form Section */}
        <div className='space-y-4'>
          <h3 className='font-semibold'>Profil bearbeiten</h3>
          <UserProfileForm user={user} />
        </div>

        <Separator />

        {/* Password Reset Section */}
        <div className='space-y-4'>
          <h3 className='font-semibold'>Sicherheit</h3>
          <IsUserAnonymousSetting
            isAnonymous={user.isAnonymous}
            onCheckedChange={(e) => handleUpdateAnonymity(e)}
          />
          <div className='flex flex-col items-end justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center'>
            <div className='flex w-full gap-2'>
              <KeyRound className='mt-0.5 size-4' />
              <div className='w-full space-y-1'>
                <p className='text-sm font-semibold'>Passwort ändern</p>
                <p className='max-w-11/12 text-sm text-muted-foreground md:max-w-3/4'>
                  Du kannst jederzeit dein Passwort ändern.
                </p>
              </div>
            </div>
            <Button
              variant='outline'
              className='flex items-center gap-2'
              asChild
            >
              <Link href='/reset-password'>Passwort ändern</Link>
            </Button>
          </div>
        </div>

        <Separator />

        {/* Additional Account Actions */}
        <div className='space-y-4'>
          <h3 className='h-5 font-semibold text-destructive'>Gefahren-Zone</h3>
          <div className='flex flex-col items-end justify-between gap-4 rounded-lg border border-destructive/20 p-3 sm:flex-row sm:items-center'>
            <div className='flex w-full gap-2'>
              <TriangleAlert className='mt-0.5 size-4 text-destructive' />
              <div className='w-full space-y-1'>
                <p className='text-sm font-medium text-destructive'>
                  Konto löschen
                </p>
                <p className='max-w-11/12 text-sm text-muted-foreground md:w-3/4'>
                  Permanente Löschung aller Account-Daten und -Verknüpfungen
                </p>
              </div>
            </div>
            <ConfirmModal
              title='Konto wirklich löschen?'
              description='Diese Aktion kann nicht rückgängig gemacht werden. Alle deine User-Daten werden permanent gelöscht.'
              actionTitle='Konto löschen'
              actionVariant='destructive'
              triggerVariant='destructive'
              onConfirm={handleUserDeletion}
              isPending={isDeleting}
            >
              Löschen
            </ConfirmModal>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function IsUserAnonymousSetting({
  isAnonymous,
  onCheckedChange,
}: {
  isAnonymous: boolean;
  onCheckedChange: (e: boolean) => void;
}) {
  return (
    <div className='flex justify-between'>
      <div className='flex w-full items-start gap-3 space-y-1'>
        {isAnonymous ? (
          <EyeOff className='size-5 text-muted-foreground' />
        ) : (
          <Eye className='size-5 text-tertiary' />
        )}
        <div className='w-full space-y-1'>
          <Label htmlFor='anonymity-switch'>Anonymität</Label>
          <p className='max-w-11/12 text-sm text-muted-foreground md:max-w-3/4'>
            Bei Anonymität wird dein Name bei der Darstellung deiner Aktivität
            anonymisiert.
          </p>
        </div>
      </div>
      <Switch
        id='anonymity-switch'
        checked={isAnonymous}
        onCheckedChange={(e) => onCheckedChange(e)}
      />
    </div>
  );
}
