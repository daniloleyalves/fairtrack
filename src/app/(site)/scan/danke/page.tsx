import Link from 'next/link';
import { Award, CheckCircle, Plus } from 'lucide-react';
import { Button } from '@components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import { SCAN_GUEST_PATH } from '@/server/qr-code/constants';

export default function ScanGuestSuccessPage() {
  return (
    <div className='m-2 mb-16 flex max-w-lg flex-col gap-4 sm:m-8 sm:mx-auto'>
      <Card className='text-center'>
        <CardHeader className='flex flex-col items-center gap-3'>
          <CheckCircle className='size-14 text-primary' />
          <CardTitle className='font-londrina text-3xl tracking-wider'>
            Danke fürs Retten!
          </CardTitle>
          <CardDescription>
            Dein Beitrag wurde eingetragen und dem Fairteiler gutgeschrieben.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant='outline'>
            <Link href={SCAN_GUEST_PATH}>
              <Plus className='size-4' />
              Weitere Lebensmittel eintragen
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className='border-2 border-primary'>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='flex size-10 min-w-10 items-center justify-center rounded-lg bg-primary/10'>
              <Award className='size-5 text-primary' />
            </div>
            <div>
              <CardTitle>Willst du deine Rettungen sammeln?</CardTitle>
              <CardDescription>
                Mit einem eigenen Konto siehst du, wie viel du gerettet hast,
                und sammelst Meilensteine.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button asChild className='w-full'>
            <Link href='/sign-up'>Kostenlos registrieren</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
