import Link from 'next/link';
import { CheckCircle, ClipboardList, UserPlus } from 'lucide-react';
import { Button } from '@components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from '@components/ui/card';
import { SCAN_GUEST_PATH } from '@/server/qr-code/constants';

export default function ScanGuestSuccessPage() {
  return (
    <div className='mt-24 flex h-max min-h-[calc(100vh-64px)] w-full justify-center p-4'>
      <Card className='h-max w-full max-w-md'>
        <CardContent className='flex flex-col items-center p-8 pb-4 text-center'>
          <div className='mb-6'>
            <CheckCircle className='size-16 text-primary' />
          </div>
          <CardTitle className='mb-2 text-2xl font-bold'>Super!</CardTitle>
          <CardDescription className='mb-6'>
            Das Retteformular wurde erfolgreich ausgefüllt.
          </CardDescription>
          <div className='w-full space-y-3'>
            <Button asChild className='w-full' size='lg'>
              <Link href={SCAN_GUEST_PATH}>
                <ClipboardList className='mr-2 size-4' />
                Formular erneut ausfüllen
              </Link>
            </Button>
            <Button asChild variant='outline' className='w-full' size='lg'>
              <Link href='/sign-up'>
                <UserPlus className='mr-2 size-4' />
                Kostenlos registrieren
              </Link>
            </Button>
          </div>
        </CardContent>
        <CardFooter className='justify-center border-t pt-4 text-center text-sm text-muted-foreground'>
          Mit einem eigenen Konto siehst du, wie viel du gerettet hast, und
          sammelst Meilensteine.
        </CardFooter>
      </Card>
    </div>
  );
}
