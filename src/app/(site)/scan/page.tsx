import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { headers } from 'next/headers';
import {
  ArrowRight,
  Award,
  BarChart3,
  QrCode,
  UserRound,
  Users,
} from 'lucide-react';
import { Button } from '@components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import { Skeleton } from '@components/ui/skeleton';
import { loadScanContext } from '@/server/qr-code/scan-context';
import {
  SCAN_GUEST_PATH,
  userContributionPath,
} from '@/server/qr-code/constants';
import { getSession } from '@/server/user/queries';
import { ScanInvalid } from '@/features/qr-code/components/scan-invalid';

export default function ScanPage() {
  return (
    <div className='m-2 mb-16 flex max-w-lg flex-col gap-4 sm:m-8 sm:mx-auto'>
      <Suspense fallback={<ScanChoiceSkeleton />}>
        <ScanChoice />
      </Suspense>
    </div>
  );
}

async function ScanChoice() {
  const scan = await loadScanContext();

  if (!scan) {
    return <ScanInvalid />;
  }

  const session = await getSession(await headers());
  const contributionPath = userContributionPath(scan.fairteiler.slug);
  const signInPath = `/sign-in?callbackUrl=${encodeURIComponent(contributionPath)}`;

  return (
    <>
      <Card>
        <CardHeader className='flex flex-col items-center gap-3 text-center'>
          {scan.fairteiler.logo ? (
            <Image
              src={scan.fairteiler.logo}
              alt={`Logo ${scan.fairteiler.name}`}
              width={72}
              height={72}
              className='size-18 rounded-full object-cover'
            />
          ) : (
            <div className='flex size-16 items-center justify-center rounded-full bg-primary/10'>
              <QrCode className='size-8 text-primary' />
            </div>
          )}
          <div>
            <CardTitle className='font-londrina text-3xl tracking-wider'>
              {scan.fairteiler.name}
            </CardTitle>
            <CardDescription className='mt-1'>
              Schön, dass du Lebensmittel rettest! Wie möchtest du deinen
              Beitrag eintragen?
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card className='border-2 border-primary'>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='flex size-10 min-w-10 items-center justify-center rounded-lg bg-primary/10'>
              <UserRound className='size-5 text-primary' />
            </div>
            <CardTitle>Mit meinem Konto beitragen</CardTitle>
          </div>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <ul className='flex flex-col gap-2 text-sm'>
            <li className='flex items-center gap-2'>
              <Award className='size-4 text-primary' />
              Sammle Meilensteine für jede Rettung
            </li>
            <li className='flex items-center gap-2'>
              <BarChart3 className='size-4 text-primary' />
              Sieh, wie viel du schon gerettet hast
            </li>
          </ul>
          {session ? (
            <Button asChild size='lg'>
              <Link href={contributionPath}>
                Weiter als {session.user.firstName ?? session.user.name}
                <ArrowRight className='size-4' />
              </Link>
            </Button>
          ) : (
            <div className='flex flex-col gap-2 sm:flex-row'>
              <Button asChild size='lg' className='flex-1'>
                <Link href={signInPath}>Anmelden</Link>
              </Button>
              <Button asChild size='lg' variant='outline' className='flex-1'>
                <Link href='/sign-up'>Kostenlos registrieren</Link>
              </Button>
            </div>
          )}
          {!session && (
            <p className='text-xs text-muted-foreground'>
              Nach der Registrierung geht es direkt weiter zum Retteformular
              dieses Fairteilers.
            </p>
          )}
        </CardContent>
      </Card>

      {scan.guestAccessViewId && (
        <Card>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <div className='flex size-10 min-w-10 items-center justify-center rounded-lg bg-secondary'>
                <Users className='size-5 text-muted-foreground' />
              </div>
              <div>
                <CardTitle>Als Gast beitragen</CardTitle>
                <CardDescription>
                  Ohne Konto. Dein Beitrag wird dem Fairteiler gutgeschrieben.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild size='lg' variant='outline' className='w-full'>
              <Link href={SCAN_GUEST_PATH}>
                Als Gast fortfahren
                <ArrowRight className='size-4' />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function ScanChoiceSkeleton() {
  return (
    <>
      <Skeleton className='h-48 w-full rounded-xl bg-secondary' />
      <Skeleton className='h-56 w-full rounded-xl bg-secondary' />
    </>
  );
}
