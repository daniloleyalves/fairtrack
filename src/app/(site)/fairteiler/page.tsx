'use cache';

import { getFairteilers } from '@server/dto';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import { generateBlurDataUrlFromImage } from '@/lib/services/plaiceholder';
import { Globe, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { type Fairteiler as FairteilerType } from '@server/db/db-types';
import { cn } from '@/lib/utils';

// --- 1. Main Page Component (Layout) ---
// eslint-disable-next-line
export default async function FairteilerPage() {
  return (
    <div className='mb-8 px-4 pt-6 sm:px-0 2xl:mb-60'>
      <div className='flex flex-col items-start gap-2'>
        <h1 className='font-londrina text-4xl font-semibold tracking-wider'>
          Fairteiler
        </h1>
        <p className='text-md font-medium text-muted-foreground'>
          Folgende Fairteilerstationen nutzen FairTrack, um ihre
          Lebensmittelabggaben zu tracken. <br />
          Bei diesen Fairteilern kannst du über die FairTrack-App Lebensmittel
          abgeben und abholen.
        </p>
      </div>

      <div className='mt-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <Suspense fallback={<FairteilerGridSkeleton />}>
          <FairteilerGrid />
        </Suspense>
      </div>
    </div>
  );
}

// --- 2. Data Fetching Component ---
async function FairteilerGrid() {
  const fairteilers = await getFairteilers();

  if (fairteilers.length === 0) {
    return (
      <p className='text-muted-foreground'>
        Aktuell sind keine Fairteiler verfügbar.
      </p>
    );
  }

  return (
    <>
      {fairteilers.map((fairteiler) => (
        <FairteilerCard key={fairteiler.slug} fairteiler={fairteiler} />
      ))}
    </>
  );
}

// --- 3. Individual Card Component ---
async function FairteilerCard({ fairteiler }: { fairteiler: FairteilerType }) {
  const blurDataURL = fairteiler.thumbnail
    ? (await generateBlurDataUrlFromImage(fairteiler.thumbnail)).base64
    : undefined;

  return (
    <Card
      className={cn(
        'flex h-full flex-col',
        fairteiler.thumbnail ? 'pt-0' : 'sm:pt-0',
      )}
    >
      <div
        className={cn(
          'relative h-[180px] w-full rounded-t-lg bg-muted',
          fairteiler.thumbnail ? 'relative' : 'hidden sm:block',
        )}
      >
        {fairteiler.thumbnail && (
          <Image
            fill
            sizes='(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw'
            src={fairteiler.thumbnail}
            loading='eager'
            placeholder='blur'
            blurDataURL={blurDataURL}
            alt={`Bild von ${fairteiler.name}`}
            className='rounded-t-lg bg-secondary object-cover'
          />
        )}
      </div>
      <CardHeader>
        <CardTitle className='mb-2 truncate text-xl md:text-2xl'>
          {fairteiler.name}
        </CardTitle>
        {fairteiler.tags?.length > 0 && (
          <CardDescription className='flex flex-wrap gap-2'>
            {fairteiler.tags.map((tag) => (
              <Badge key={tag.name} variant='secondary' className='font-medium'>
                {tag.name}
              </Badge>
            ))}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className='mt-auto flex flex-col items-start'>
        <div className='flex w-full items-center'>
          <MapPin className='mr-2 size-3.5' />
          {fairteiler.geoLink ? (
            <Button asChild className='h-8 p-0' variant='link'>
              <Link
                href={fairteiler.geoLink}
                target='_blank'
                className='truncate'
              >
                {fairteiler.address}
              </Link>
            </Button>
          ) : (
            <span className='truncate text-sm'>{fairteiler.address}</span>
          )}
        </div>
        {fairteiler.website && (
          <div className='flex w-full items-center'>
            <Globe className='mr-2 size-3' />
            <Button asChild className='h-8 p-0' variant='link'>
              <Link
                href={fairteiler.website}
                target='_blank'
                className='truncate'
              >
                {fairteiler.website}
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --- 4. Skeleton Component ---
function FairteilerGridSkeleton() {
  return Array.from({ length: 4 }).map((_, i) => (
    <Card key={i} className='flex h-full flex-col pt-0'>
      <div className='h-[180px] w-full animate-pulse rounded-t-lg bg-muted' />
      <CardHeader>
        <div className='h-7 w-3/4 animate-pulse rounded bg-muted' />
        <div className='mt-2 flex gap-2'>
          <div className='h-5 w-16 animate-pulse rounded-full bg-muted' />
          <div className='h-5 w-20 animate-pulse rounded-full bg-muted' />
        </div>
      </CardHeader>
      <CardContent className='mt-auto flex flex-col gap-2'>
        <div className='h-5 w-full animate-pulse rounded bg-muted' />
        <div className='h-5 w-1/2 animate-pulse rounded bg-muted' />
      </CardContent>
    </Card>
  ));
}
