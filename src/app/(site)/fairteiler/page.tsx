import { getFairteilers } from '@server/fairteiler/queries';
import { getFairteilerQuantities } from '@server/platform/queries';
import { BlurFade } from '@/components/magicui/blur-fade';
import { MorphingBlob } from '@/components/site/organic/morphing-blob';
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
import { Logo } from '@/lib/assets/logo';
import { siteConfig } from '@/lib/config/site-config';
import { formatNumber } from '@/lib/utils';
import { Globe, Mail, MapPin, Scale } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { type Fairteiler as FairteilerType } from '@server/db/db-types';
import { cn } from '@/lib/utils';

export default function FairteilerPage() {
  return (
    <div className='mb-8 px-4 pt-10 sm:px-0 2xl:mb-60'>
      <div className='relative mx-auto flex max-w-2xl flex-col items-center gap-3 text-center'>
        <MorphingBlob
          fill='#99BB44'
          seed={17}
          className='absolute -top-14 left-1/2 -z-10 w-48 -translate-x-1/2 opacity-15'
        />
        <h1 className='font-londrina text-5xl font-semibold tracking-wider text-primary'>
          Fairteiler
        </h1>
        <p className='text-md font-medium text-muted-foreground'>
          Diese Fairteiler-Stationen erfassen ihre Lebensmittelabgaben mit
          FairTrack. Bei diesen Stationen kannst du Lebensmittel abgeben und
          abholen :)
        </p>
      </div>

      <div className='mx-auto mt-10 grid w-full max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <Suspense fallback={<FairteilerGridSkeleton />}>
          <FairteilerGrid />
        </Suspense>
      </div>
    </div>
  );
}

async function FairteilerGrid() {
  'use cache';
  const [fairteilers, quantities] = await Promise.all([
    getFairteilers(),
    getFairteilerQuantities(),
  ]);

  return (
    <>
      {fairteilers.map((fairteiler, index) => (
        <BlurFade
          key={fairteiler.slug}
          inView
          delay={Math.min(index, 7) * 0.06}
          className='h-full'
        >
          <FairteilerCard
            fairteiler={fairteiler}
            trackedKg={quantities[fairteiler.id] ?? 0}
          />
        </BlurFade>
      ))}
      <BlurFade
        inView
        delay={Math.min(fairteilers.length, 7) * 0.06}
        className='h-full'
      >
        <FairteilerPlaceholderCard />
      </BlurFade>
    </>
  );
}

function FairteilerPlaceholderCard() {
  return (
    <Card className='flex h-full flex-col border-dashed pt-0'>
      <div className='flex h-[180px] w-full items-center justify-center overflow-hidden rounded-t-lg bg-muted'>
        <Logo aria-hidden className='h-auto opacity-70' />
      </div>
      <CardHeader>
        <CardTitle className='mb-2 text-xl md:text-2xl'>
          Hier könnte dein Fairteiler stehen
        </CardTitle>
        <CardDescription>
          Du betreibst einen Fairteiler und möchtest deine Abgaben mit FairTrack
          erfassen? Melde dich bei uns!
        </CardDescription>
      </CardHeader>
      <CardContent className='mt-auto flex flex-col items-start'>
        <div className='flex w-full items-center'>
          <Mail className='mr-2 size-3.5' />
          <Button asChild className='h-8 p-0' variant='link'>
            <Link href={`mailto:${siteConfig.contact}`} className='truncate'>
              {siteConfig.contact}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

async function FairteilerCard({
  fairteiler,
  trackedKg,
}: {
  fairteiler: FairteilerType;
  trackedKg: number;
}) {
  'use cache';
  const blurDataURL = fairteiler.thumbnail
    ? (await generateBlurDataUrlFromImage(fairteiler.thumbnail)).base64
    : undefined;

  return (
    <Card
      className={cn(
        'group flex h-full flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
        fairteiler.thumbnail ? 'pt-0' : 'sm:pt-0',
      )}
    >
      <div
        className={cn(
          'relative h-[180px] w-full overflow-hidden rounded-t-lg bg-muted',
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
            className='bg-secondary object-cover transition-transform duration-500 group-hover:scale-105'
          />
        )}
        {fairteiler.thumbnail && trackedKg > 0 && (
          <div className='absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-sm'>
            <Scale className='size-3.5' />
            {formatNumber(trackedKg, 0)} kg fairteilt
          </div>
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
        {(fairteiler.geoLink ?? fairteiler.address) && (
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
        )}
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
