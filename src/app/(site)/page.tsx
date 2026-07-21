import { BlurFade } from '@/components/magicui/blur-fade';
import { NumberTicker } from '@/components/magicui/number-ticker';
import { BurstField } from '@/components/site/burst-field';
import { FoodBagScatter } from '@/components/site/food-bag-scatter';
import { MorphingBlob } from '@/components/site/organic/morphing-blob';
import { ProductTour } from '@/features/product-tour/components/product-tour';
import { Illustrations } from '@/lib/assets/illustrations';
import { siteConfig } from '@/lib/config/site-config';
import { getPublicTotalQuantityKg } from '@/server/platform/queries';
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
  const totalQuantityKg = await getPublicTotalQuantityKg();

  return (
    <div className='pb-20'>
      {/* Hero + live counter */}
      <div className='relative'>
        <section className='relative mx-auto max-w-5xl px-4 pt-14 sm:pt-20'>
          <MorphingBlob
            fill='#99BB44'
            seed={11}
            className='absolute -top-8 -left-36 -z-10 hidden w-72 opacity-10 lg:block'
          />
          <Doodle
            src={Illustrations.leafPrimary}
            sway
            className='top-[18%] right-0 hidden w-5 rotate-[25deg] md:block xl:-right-12'
          />
          <h1 className='text-center font-londrina text-6xl font-extrabold lg:text-8xl'>
            <BlurFade delay={0} duration={0.2} className='inline-block'>
              <span>RETTEN.&nbsp;</span>
            </BlurFade>
            <BlurFade delay={0.06} duration={0.2} className='inline-block'>
              <span>TRACKEN.&nbsp;</span>
            </BlurFade>
            <BlurFade delay={0.12} duration={0.2} className='inline-block'>
              <span className='inline-block -rotate-2 text-tertiary'>
                TEILEN.
              </span>
            </BlurFade>
          </h1>
          <BlurFade delay={0.15} duration={0.2}>
            <p className='mx-auto mt-6 max-w-3xl text-center font-semibold sm:text-xl'>
              Jedes Gramm zählt, und FairTrack zählt mit! Für dich, deine Bilanz
              und die der ganzen Foodsharing-Community.
            </p>
          </BlurFade>
          <BlurFade delay={0.2} duration={0.2}>
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

        <section
          aria-label='Gesamtmenge fairteilter Lebensmittel'
          className='relative mt-14 flex justify-center overflow-x-clip px-4 pb-12 sm:mt-6'
        >
          <div className='relative flex aspect-[4/3] w-[min(92vw,600px)] items-center justify-center sm:aspect-[2/1] sm:w-[min(94vw,900px)]'>
            <MorphingBlob
              fill='#99BB44'
              seed={5}
              speed={1.3}
              amplitude={0.1}
              className='absolute inset-0 size-full scale-125 opacity-30 sm:scale-100'
            />
            <BurstField>
              <Doodle
                src={Illustrations.mushrooms}
                className='top-[7%] left-[9%] w-[10.5vw] -rotate-6 sm:top-[16%] sm:left-[21%] sm:w-12 lg:w-16'
                delay='-3.5s'
              />
              <Doodle
                src={Illustrations.leafPrimary}
                sway
                spin
                className='top-[4%] left-[43%] w-[5.5vw] rotate-[20deg] sm:w-7'
                delay='-1s'
              />
              <Doodle
                src={Illustrations.leaf2Primary}
                sway
                spin
                className='top-[8%] left-[57%] hidden w-5 rotate-210 sm:block'
                delay='-4s'
              />
              <Doodle
                src={Illustrations.leafSecondary}
                sway
                spin
                className='top-[33%] left-[12%] hidden w-7 -rotate-12 sm:block'
                delay='-2.5s'
              />
              <Doodle
                src={Illustrations.leafPrimary}
                sway
                spin
                className='top-[62%] left-[4%] w-[6.5vw] -rotate-[35deg] sm:w-9'
                delay='-5.5s'
              />
              <Doodle
                src={Illustrations.beetrootSecondary}
                className='bottom-[2%] left-[7%] w-[10.5vw] -rotate-6 sm:bottom-[7%] sm:left-[18%] sm:w-12 md:w-16 lg:w-20'
                delay='-1.5s'
              />
              <Doodle
                src={Illustrations.leaf2Primary}
                sway
                spin
                className='bottom-[3%] left-[35%] hidden w-5 rotate-[200deg] sm:block'
                delay='-3s'
              />
              <Doodle
                src={Illustrations.leafSecondary}
                sway
                spin
                className='bottom-[6%] left-[60%] w-[6.5vw] rotate-[210deg] sm:w-9'
                delay='-6s'
              />
              <Doodle
                src={Illustrations.carrot}
                className='top-[8%] right-[3%] w-[13vw] rotate-[15deg] sm:w-16 md:w-20 lg:w-28'
              />
              <Doodle
                src={Illustrations.pepper}
                className='top-[80%] right-[2%] w-[8.5vw] rotate-6 sm:top-[42%] sm:right-[4%] sm:w-10'
                delay='-2s'
              />
              <Doodle
                src={Illustrations.bag}
                className='right-[4%] bottom-[6%] hidden w-16 rotate-3 sm:block md:w-20 lg:w-24'
                delay='-5s'
              />
              <span
                aria-hidden
                data-spin=''
                className='absolute top-[30%] right-[21%] hidden size-3 rotate-45 border-2 border-foreground/50 sm:block'
              />
              <span
                aria-hidden
                data-spin=''
                className='absolute top-[38%] right-[19%] hidden size-2 rotate-45 border-2 border-foreground/50 sm:block'
              />
              <span
                aria-hidden
                data-spin=''
                className='absolute bottom-[26%] left-[11%] hidden size-2 rotate-45 border-2 border-foreground/50 sm:block'
              />
              <span
                aria-hidden
                data-spin=''
                className='absolute right-[27%] bottom-[20%] hidden size-2 rotate-45 border-2 border-foreground/50 sm:block'
              />
            </BurstField>
            <div className='relative z-10 text-center font-londrina text-primary'>
              <h2 className='text-[clamp(3.75rem,2.36rem+6vw,4.5rem)] sm:text-7xl lg:text-8xl'>
                <NumberTicker value={totalQuantityKg} decimalPlaces={2} />
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
          </div>
        </section>
      </div>

      <div className='relative'>
        {/* Product tour */}
        <section
          aria-labelledby='product-tour-heading'
          className='relative mx-auto mt-16 max-w-6xl px-4 md:mt-24'
        >
          <MorphingBlob
            fill='#99BB44'
            seed={17}
            className='absolute top-1/2 left-[15%] -z-10 hidden w-80 -translate-y-1/2 opacity-10 lg:block'
          />
          <Doodle
            src={Illustrations.leafSecondary}
            sway
            className='top-2 left-0 hidden w-6 lg:block xl:-left-4'
            delay='-3s'
          />
          <Doodle
            src={Illustrations.leafPrimary}
            sway
            className='right-0 -bottom-10 hidden w-5 rotate-[35deg] lg:block xl:-right-8'
            delay='-4.5s'
          />
          <BlurFade inView>
            <p className='text-center text-sm font-semibold tracking-widest text-tertiary uppercase'>
              Für Foodsaver:innen
            </p>
            <h2
              id='product-tour-heading'
              className='mt-2 text-center font-londrina text-4xl text-primary sm:text-5xl'
            >
              FairTrack in Aktion
            </h2>
            <p className='mx-auto mt-4 max-w-2xl text-center text-muted-foreground'>
              So erfasst du deine Abgabe direkt am Handy, an jedem bei FairTrack
              registrierten Fairteiler, vom Regal bis zum Foodsharing-Café.
            </p>
          </BlurFade>
          <div className='mt-10'>
            <ProductTour persona='user' />
          </div>
        </section>

        {/* Operator pitch */}
        <section
          aria-labelledby='operator-heading'
          className='relative mx-auto mt-36 max-w-5xl px-4 md:mt-40'
        >
          <MorphingBlob
            fill='#99BB44'
            seed={23}
            className='absolute -top-16 -right-24 -z-10 hidden w-72 opacity-10 lg:block'
          />
          <MorphingBlob
            fill='#99BB44'
            seed={41}
            className='absolute -bottom-8 -left-12 -z-10 hidden w-80 opacity-10 lg:block'
          />
          <Doodle
            src={Illustrations.leaf2Primary}
            sway
            className='-top-8 left-[2%] hidden w-4 rotate-[15deg] lg:block xl:-left-12'
            delay='-2s'
          />
          <BlurFade inView>
            <div className='rounded-[2.5rem] border border-primary/10 bg-white p-8 sm:p-12'>
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
                    FairTrack gibt deinem Standort verlässliche Kennzahlen. Für
                    die interne Steuerung, die Öffentlichkeitsarbeit und
                    Förderanträge. Komplett kostenfrei.
                  </p>
                  <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
                    <Button asChild size='lg' className='group'>
                      <Link href='/sign-up'>
                        Jetzt registrieren
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
                    tilt='rotate-1'
                  />
                  <OperatorFeature
                    icon={<ChartColumn className='size-5' />}
                    title='Live-Statistiken'
                    text='Mengen, Trends und Auswertungen für deinen Standort.'
                    tilt='-rotate-1'
                  />
                  <OperatorFeature
                    icon={<UsersRound className='size-5' />}
                    title='Team & Rollen'
                    text='Mitglieder einladen, Rechte flexibel vergeben.'
                    tilt='-rotate-1'
                  />
                  <OperatorFeature
                    icon={<FileSpreadsheet className='size-5' />}
                    title='Excel-Export'
                    text='Alle Daten jederzeit exportieren und weiterverwenden.'
                    tilt='rotate-1'
                  />
                </ul>
              </div>
            </div>
          </BlurFade>
          <div className='relative mt-14 md:mt-16'>
            <Doodle
              src={Illustrations.leafSecondary}
              sway
              className='-top-10 left-[10%] hidden w-6 -rotate-[20deg] md:block'
              delay='-2.5s'
            />
            <ProductTour persona='fairteiler' />
          </div>
        </section>

        {/* Closing */}
        <section className='relative mx-auto mt-36 max-w-4xl px-4 text-center md:mt-40'>
          <Doodle
            src={Illustrations.leafPrimary}
            sway
            className='top-[60%] right-[2%] hidden w-5 -rotate-[200deg] md:block lg:-right-6'
            delay='-3.5s'
          />
          <Doodle
            src={Illustrations.leafSecondary}
            sway
            className='bottom-4 -left-6 hidden w-7 rotate-[15deg] md:block lg:-left-20'
            delay='-2s'
          />
          <BlurFade inView>
            <p className='text-md font-semibold sm:text-xl md:text-2xl'>
              Durch das digitale Retteformular werden aus Schätzungen
              <span className='font-bold text-primary'> Fakten </span>
              über das Engagement der Foodsharing-Community.
            </p>
            <h2 className='mt-10 font-londrina text-3xl font-medium text-tertiary sm:text-4xl md:text-5xl'>
              Gemeinsam für mehr Lebensmittelwertschätzung
            </h2>
            <Button asChild size='lg' className='text-md group mt-8'>
              <Link href='/sign-in'>
                Jetzt mitmachen
                <ArrowRight className='ml-1 size-4 transition-transform group-hover:translate-x-0.5' />
              </Link>
            </Button>
          </BlurFade>
          <div className='relative mx-auto mt-20 hidden w-[min(88vw,420px)] sm:block'>
            <FoodBagScatter />
          </div>
        </section>
      </div>
    </div>
  );
}

function Doodle({
  src,
  className,
  delay = '0s',
  sway = false,
  spin = false,
}: {
  src: (typeof Illustrations)[string];
  className?: string;
  delay?: string;
  sway?: boolean;
  spin?: boolean;
}) {
  return (
    <Image
      src={src}
      alt=''
      aria-hidden
      data-spin={spin ? '' : undefined}
      className={`pointer-events-none absolute select-none ${sway ? 'sway-gentle' : 'float-gentle'} ${className ?? ''}`}
      style={{ animationDelay: delay }}
    />
  );
}

function OperatorFeature({
  icon,
  title,
  text,
  tilt,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  tilt: string;
}) {
  return (
    <li
      className={`rounded-2xl bg-background p-4 transition-transform duration-300 hover:rotate-0 ${tilt}`}
    >
      <div className='blob flex size-9 items-center justify-center rounded bg-primary/10 text-primary'>
        {icon}
      </div>
      <h3 className='mt-3 text-sm font-semibold'>{title}</h3>
      <p className='mt-1 text-sm text-muted-foreground'>{text}</p>
    </li>
  );
}
