import { BlurFade } from '@/components/magicui/blur-fade';
import { NumberTicker } from '@/components/magicui/number-ticker';
import { HeroCurves } from '@/components/site/hero-curves';
import { ImpactSection } from '@/components/site/impact-section';
import { Illustrations } from '@/lib/assets/illustrations';
import { siteConfig } from '@/lib/config/site-config';
import { getPublicImpactStats } from '@/server/platform/queries';
import { Button } from '@components/ui/button';
import {
  ArrowRight,
  ChartColumn,
  ClipboardPen,
  FileSpreadsheet,
  UsersRound,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default async function Home() {
  const stats = await getPublicImpactStats();

  return (
    <div className='overflow-x-clip px-4 pb-24 sm:px-0'>
      <HeroCurves />

      {/* Hero */}
      <section className='mx-auto max-w-5xl pt-16 sm:pt-20 md:pt-16'>
        <h1 className='text-center font-londrina text-6xl font-extrabold lg:text-7xl'>
          <BlurFade delay={0} className='inline-block'>
            <span>RETTEN.&nbsp;</span>
          </BlurFade>
          <BlurFade delay={0.12} className='inline-block'>
            <span>TRACKEN.&nbsp;</span>
          </BlurFade>
          <BlurFade delay={0.24} className='inline-block'>
            <span className='text-tertiary'>TEILEN.</span>
          </BlurFade>
        </h1>
        <BlurFade delay={0.3}>
          <p className='mx-auto mt-4 max-w-3xl text-center font-semibold sm:text-xl'>
            FairTrack macht sichtbar, was die Foodsharing-Community leistet:
            Jede Lebensmittelabgabe an einem Fairteiler wird erfasst – und aus
            Schätzungen werden Fakten.
          </p>
        </BlurFade>
        <BlurFade delay={0.4}>
          <div className='sm:max-w-auto mx-auto mt-8 flex max-w-[220px] flex-col justify-center gap-4 sm:flex-row'>
            <Button asChild size='lg' className='text-md group'>
              <Link href='/sign-in'>
                Jetzt mitmachen
                <ArrowRight className='ml-1 size-4 transition-transform group-hover:translate-x-0.5' />
              </Link>
            </Button>
            <Button asChild size='lg' variant='secondary' className='text-md'>
              <Link href='/info-and-faq'>Erfahre mehr</Link>
            </Button>
          </div>
        </BlurFade>
      </section>

      {/* Live counter */}
      <section
        aria-label='Gesamtmenge fairteilter Lebensmittel'
        className='relative mt-10 flex justify-center md:mt-16'
      >
        <div className='absolute top-1/2 z-10 -translate-y-1/3 text-center font-londrina text-primary'>
          <h2 className='text-5xl sm:text-8xl'>
            <NumberTicker value={stats.totalQuantityKg} decimalPlaces={2} />
          </h2>
          <p className='mt-1 text-lg md:text-xl'>
            Kilogramm Lebensmittel fairteilt
          </p>
          <p className='font-sans text-xs text-muted-foreground'>
            live aus allen{' '}
            <Link
              href='/fairteiler'
              className='font-medium text-primary underline-offset-2 hover:underline'
            >
              Fairteilern
            </Link>
            , die FairTrack nutzen
          </p>
        </div>
        <Image
          src={Illustrations.valueBackground}
          className='sm:w-[700px]'
          alt=''
          loading='eager'
          decoding='sync'
          priority
        />
      </section>

      {/* Impact */}
      <div className='mt-24 md:mt-32'>
        <ImpactSection stats={stats} />
      </div>

      {/* How it works */}
      <section
        aria-labelledby='how-it-works-heading'
        className='mx-auto mt-24 max-w-6xl md:mt-32'
      >
        <BlurFade inView>
          <h2
            id='how-it-works-heading'
            className='text-center font-londrina text-4xl text-tertiary sm:text-5xl'
          >
            Und so funktionierts…
          </h2>
        </BlurFade>
        <div className='mt-14 grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12'>
          <HowItWorksStep
            step={1}
            title='Fairteiler finden'
            image={Illustrations.walkingIllustration}
            imageAlt='Illustration: Zu einem Fairteiler laufen'
            delay={0}
          >
            Bei FairTrack registrierte{' '}
            <Link
              href='/fairteiler'
              className='font-semibold text-primary underline-offset-2 hover:underline'
            >
              Fairteiler
            </Link>{' '}
            in deiner Nähe finden und aufsuchen.
          </HowItWorksStep>
          <HowItWorksStep
            step={2}
            title='Abgeben & erfassen'
            image={Illustrations.arrivingIllustration}
            imageAlt='Illustration: Ankunft am Fairteiler'
            delay={0.12}
          >
            Lebensmittel abgeben und in unter einer Minute das digitale
            Retteformular ausfüllen.
          </HowItWorksStep>
          <HowItWorksStep
            step={3}
            title='Wirkung verfolgen'
            image={Illustrations.statisticsIllustration}
            imageAlt='Illustration: Statistiken zum Foodsharing'
            delay={0.24}
            className='sm:col-span-2 lg:col-span-1'
          >
            Deinen Beitrag im persönlichen Dashboard verfolgen – vom ersten Kilo
            bis zum nächsten Meilenstein.
          </HowItWorksStep>
        </div>
      </section>

      {/* Operator pitch */}
      <section
        aria-labelledby='operator-heading'
        className='mx-auto mt-24 max-w-5xl md:mt-32'
      >
        <BlurFade inView>
          <div className='rounded-3xl border border-primary/10 bg-white p-8 sm:p-12'>
            <div className='grid grid-cols-1 items-center gap-10 lg:grid-cols-2'>
              <div>
                <p className='text-sm font-semibold tracking-widest text-tertiary uppercase'>
                  Für Betreiber:innen
                </p>
                <h2
                  id='operator-heading'
                  className='mt-2 font-londrina text-4xl text-primary'
                >
                  Du betreibst einen Fairteiler?
                </h2>
                <p className='mt-4 text-muted-foreground'>
                  FairTrack gibt deinem Standort verlässliche Kennzahlen – für
                  die interne Steuerung, die Öffentlichkeitsarbeit und
                  Förderanträge. Kostenlos und Open Source.
                </p>
                <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
                  <Button asChild size='lg' className='group'>
                    <Link href='/sign-up'>
                      Fairteiler registrieren
                      <ArrowRight className='ml-1 size-4 transition-transform group-hover:translate-x-0.5' />
                    </Link>
                  </Button>
                  <Button asChild size='lg' variant='secondary'>
                    <Link href={`mailto:${siteConfig.contact}`}>
                      Kontakt aufnehmen
                    </Link>
                  </Button>
                </div>
              </div>
              <ul className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <OperatorFeature
                  icon={<ClipboardPen className='size-5' />}
                  title='Eigenes Retteformular'
                  text='Kategorien, Herkünfte und Betriebe individuell konfigurierbar.'
                />
                <OperatorFeature
                  icon={<ChartColumn className='size-5' />}
                  title='Live-Statistiken'
                  text='Mengen, Trends und Auswertungen für deinen Standort.'
                />
                <OperatorFeature
                  icon={<UsersRound className='size-5' />}
                  title='Team & Rollen'
                  text='Mitglieder einladen, Rechte flexibel vergeben.'
                />
                <OperatorFeature
                  icon={<FileSpreadsheet className='size-5' />}
                  title='Excel-Export'
                  text='Alle Daten jederzeit exportieren und weiterverwenden.'
                />
              </ul>
            </div>
          </div>
        </BlurFade>
      </section>

      {/* Closing */}
      <section className='mx-auto mt-24 max-w-4xl text-center md:mt-32'>
        <BlurFade inView>
          <p className='text-md font-semibold sm:text-xl md:text-2xl'>
            Durch das digitale Retteformular werden aus Schätzungen
            <span className='font-bold text-tertiary'> Fakten </span>
            über das Engagement der Foodsharing-Community.
          </p>
          <h2 className='mt-6 font-londrina text-3xl font-medium text-tertiary sm:text-4xl md:text-5xl'>
            Gemeinsam für mehr Lebensmittelwertschätzung
          </h2>
          <Button asChild size='lg' className='text-md group mt-8'>
            <Link href='/sign-in'>
              Jetzt mitmachen
              <ArrowRight className='ml-1 size-4 transition-transform group-hover:translate-x-0.5' />
            </Link>
          </Button>
        </BlurFade>
        <Image
          src={Illustrations.foodBag}
          className='mx-auto mt-20 hidden sm:block'
          alt=''
        />
      </section>
    </div>
  );
}

function HowItWorksStep({
  step,
  title,
  image,
  imageAlt,
  delay,
  className,
  children,
}: {
  step: number;
  title: string;
  image: (typeof Illustrations)[string];
  imageAlt: string;
  delay: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <BlurFade inView delay={delay} className={className}>
      <div className='flex h-full flex-col items-center text-center'>
        <Image
          src={image}
          alt={imageAlt}
          className='mx-auto w-3/5 sm:w-full lg:w-4/5'
          loading='lazy'
        />
        <div className='mt-6 flex items-center gap-3'>
          <span className='flex size-8 items-center justify-center rounded-full bg-primary font-londrina text-lg text-primary-foreground'>
            {step}
          </span>
          <h3 className='font-londrina text-2xl text-foreground'>{title}</h3>
        </div>
        <p className='mt-3 max-w-xs text-muted-foreground'>{children}</p>
      </div>
    </BlurFade>
  );
}

function OperatorFeature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <li className='rounded-2xl bg-background p-4'>
      <div className='flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary'>
        {icon}
      </div>
      <h3 className='mt-3 text-sm font-semibold'>{title}</h3>
      <p className='mt-1 text-sm text-muted-foreground'>{text}</p>
    </li>
  );
}
