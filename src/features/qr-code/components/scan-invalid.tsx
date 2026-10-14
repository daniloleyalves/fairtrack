import Link from 'next/link';
import { QrCode } from 'lucide-react';
import { Button } from '@components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui/card';

export function ScanInvalid() {
  return (
    <Card className='text-center'>
      <CardHeader className='flex flex-col items-center gap-3'>
        <div className='flex size-16 items-center justify-center rounded-full bg-secondary'>
          <QrCode className='size-8 text-muted-foreground' />
        </div>
        <CardTitle className='font-londrina text-3xl tracking-wider'>
          QR-Code nicht gültig
        </CardTitle>
        <CardDescription>
          Der QR-Code ist ungültig oder dein Scan ist abgelaufen. Bitte scanne
          den QR-Code am Fairteiler erneut.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant='outline'>
          <Link href='/fairteiler'>Fairteiler finden</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
