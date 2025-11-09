import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@components/ui/accordion';
import { Button } from '@components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from '@components/ui/card';
import { Skeleton } from '@components/ui/skeleton';
import { siteConfig } from '@/lib/config/site-config';
import { getRecentCheckinsWithinLastMinute } from '@server/dto';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  ClipboardList,
} from 'lucide-react';
import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense, type ReactNode } from 'react';

// Define a more specific type for the checkin data for better type safety.
type RecentCheckin = NonNullable<
  Awaited<ReturnType<typeof getRecentCheckinsWithinLastMinute>>
>[number];

// --- 1. Main Page Component (Entry Point) ---
export default function ContributionSuccessPage({
  searchParams,
}: {
  searchParams: { submitAsUserId?: string };
}) {
  return (
    <Suspense fallback={<ContributionSuccessCardSkeleton />}>
      <ContributionResult searchParams={searchParams} />
    </Suspense>
  );
}

// --- 2. Data Fetching & Logic Component ---
// This component's only job is to fetch data and decide which UI to show.
async function ContributionResult({
  searchParams,
}: {
  searchParams: { submitAsUserId?: string };
}) {
  const nextHeaders = await headers();
  const recentCheckins = await getRecentCheckinsWithinLastMinute(
    nextHeaders,
    searchParams.submitAsUserId,
  );

  if (recentCheckins.length === 0) {
    return <NotFoundDisplay />;
  }

  return <SuccessDisplay checkins={recentCheckins} />;
}

// --- 3. Reusable Layout Component ---
function ResultCardLayout({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className='mt-24 flex h-max min-h-[calc(100vh-64px)] w-full justify-center p-4'>
      <Card className='h-max w-full max-w-md'>
        <CardContent className='flex flex-col items-center p-8 pb-4 text-center'>
          <div className='mb-6'>{icon}</div>
          <CardTitle className='mb-2 text-2xl font-bold'>{title}</CardTitle>
          <CardDescription className='mb-6'>{description}</CardDescription>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

// --- 4. Specific UI Components ---

function SuccessDisplay({ checkins }: { checkins: RecentCheckin[] }) {
  return (
    <ResultCardLayout
      icon={<CheckCircle className='size-16 text-primary' />}
      title='Super!'
      description='Das Retteformular wurde erfolgreich ausgefüllt.'
    >
      <div className='w-full space-y-3'>
        <Button asChild className='w-full' size='lg'>
          <Link href='/hub/fairteiler/contribution'>
            <ClipboardList className='mr-2 size-4' />
            Formular erneut ausfüllen
          </Link>
        </Button>
        <Button asChild variant='outline' className='w-full' size='lg'>
          <Link href='/hub/fairteiler/dashboard'>
            <ArrowRight className='mr-2 size-4' />
            Weiter zum Dashboard
          </Link>
        </Button>
      </div>

      <Accordion type='single' collapsible className='mt-4 w-full'>
        <AccordionItem value='item-1'>
          <AccordionTrigger className='items-center justify-around [&>svg]:hidden'>
            <span className='h-px w-full bg-secondary'></span>
            <span className='min-w-max px-4 text-sm font-medium'>
              Beiträge anzeigen
            </span>
            <span className='h-px w-full bg-secondary'></span>
          </AccordionTrigger>
          <AccordionContent>
            <div className='space-y-2 pt-2'>
              {checkins.map((checkin) => (
                <div
                  key={checkin.id}
                  className='flex items-center justify-between rounded-md border p-2 px-4'
                >
                  <div className='flex items-center gap-2'>
                    {checkin.category?.image && (
                      <Image
                        src={checkin.category.image}
                        width={36}
                        height={36}
                        alt={checkin.category.name}
                      />
                    )}
                    <span>{checkin.title || checkin.category.name}</span>
                  </div>
                  <div className='font-medium'>{checkin.quantity} kg</div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </ResultCardLayout>
  );
}

function NotFoundDisplay() {
  return (
    <ResultCardLayout
      icon={<AlertTriangle className='size-16 text-yellow-500' />}
      title='Achtung!'
      description='Wir konnten keine kürzlich abgegebenen Lebensmittelbeiträge finden.'
    >
      <div className='w-full space-y-3'>
        <Button asChild className='w-full' size='lg'>
          <Link href='/hub/fairteiler/contribution'>
            <ClipboardList className='mr-2 size-4' />
            Erneut versuchen
          </Link>
        </Button>
        <Button asChild variant='outline' className='w-full' size='lg'>
          <Link href='/hub/fairteiler/dashboard'>
            <ArrowRight className='mr-2 size-4' />
            Weiter zum Dashboard
          </Link>
        </Button>
      </div>
      <CardFooter className='mt-6 w-full justify-center gap-2 border-t px-0 pt-4 text-sm text-muted-foreground'>
        <span>Hilfe benötigt?</span>
        <Link
          href={`mailto:${siteConfig.contact}`}
          className='text-primary hover:underline'
        >
          Support kontaktieren
        </Link>
      </CardFooter>
    </ResultCardLayout>
  );
}

// --- 5. Skeleton Component ---
function ContributionSuccessCardSkeleton() {
  return (
    <div className='flex min-h-[calc(100vh-64px)] items-center justify-center bg-background p-4'>
      <Card className='w-full max-w-md'>
        <CardContent className='flex flex-col items-center p-8 pb-4 text-center'>
          <Skeleton className='mb-6 size-16 rounded-full bg-secondary' />
          <Skeleton className='mb-2 h-7 w-3/4 bg-secondary' />
          <Skeleton className='mb-6 h-5 w-2/4 bg-secondary' />
          <div className='w-full space-y-3'>
            <Skeleton className='h-12 w-full bg-secondary' />
            <Skeleton className='h-12 w-full bg-secondary' />
          </div>
          <Skeleton className='mt-6 h-4 w-1/2 bg-secondary' />
        </CardContent>
      </Card>
    </div>
  );
}
