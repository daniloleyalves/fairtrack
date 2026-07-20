import { BlurFade } from '@/components/magicui/blur-fade';
import { NumberTicker } from '@/components/magicui/number-ticker';
import { ImpactSection } from '@/components/site/impact-section';
import { MorphingBlob } from '@/components/site/organic/morphing-blob';
import { ProductTour } from '@/features/product-tour/components/product-tour';
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
    <div className='overflow-x-clip pb-24'>
      {/* Hero + live counter */}
      <div className='relative'>
        <section className='relative mx-auto max-w-5xl px-4 pt-16 sm:pt-24'>
          <h1 className='text-center font-londrina text-6xl font-extrabold lg:text-8xl'>
            <BlurFade delay={0} className='inline-block'>
              <span>RETTEN.&nbsp;</span>
            </BlurFade>
            <BlurFade delay={0.12} className='inline-block'>
              <span>TRACKEN.&nbsp;</span>
            </BlurFade>
            <BlurFade delay={0.24} className='inline-block'>
              <span className='inline-block -rotate-2 text-tertiary'>
                TEILEN.
              </span>
            </BlurFade>
          </h1>
          <BlurFade delay={0.3}>
            <p className='mx-auto mt-6 max-w-3xl text-center font-semibold sm:text-xl'>
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

        <section
          aria-label='Gesamtmenge fairteilter Lebensmittel'
          className='relative mt-8 flex justify-center px-4 pb-16 sm:mt-12'
        >
          <div className='relative flex aspect-[5/4] w-[min(92vw,560px)] items-center justify-center'>
            <MorphingBlob
              fill='#99BB44'
              seed={5}
              speed={1.3}
              amplitude={0.22}
              className='absolute inset-0 size-full opacity-30'
            />
            <MorphingBlob
              fill='#446622'
              seed={11}
              amplitude={0.11}
              className='absolute inset-[6%] size-[88%] opacity-15'
            />
            <FloatingLeaf className='top-[8%] left-[14%] w-7 -rotate-45' />
            <FloatingLeaf
              className='top-[16%] right-[10%] w-5 rotate-[30deg]'
              delay='-2.5s'
            />
            <FloatingLeaf
              className='bottom-[12%] left-[10%] w-5 rotate-12'
              delay='-4s'
            />
            <FloatingLeaf
              className='right-[14%] bottom-[8%] w-8 rotate-45'
              delay='-5.5s'
            />
            <div className='relative z-10 text-center font-londrina text-primary'>
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
          </div>
        </section>
      </div>

      <div className='relative'>
        <div className='mt-16 px-4 md:mt-24'>
          <ImpactSection stats={stats} />
        </div>

        {/* Product tour */}
        <section
          aria-labelledby='product-tour-heading'
          className='relative mx-auto mt-24 max-w-6xl px-4 md:mt-32'
        >
          <BlurFade inView>
            <h2
              id='product-tour-heading'
              className='text-center font-londrina text-4xl text-tertiary sm:text-5xl'
            >
              FairTrack in Aktion
            </h2>
          </BlurFade>
          <div className='mt-14'>
            <ProductTour />
          </div>
        </section>

        {/* Operator pitch */}
        <section
          aria-labelledby='operator-heading'
          className='relative mx-auto mt-24 max-w-5xl px-4 md:mt-32'
        >
          <MorphingBlob
            fill='#99BB44'
            seed={23}
            className='absolute -top-16 -right-24 -z-10 w-72 opacity-10'
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
        </section>

        {/* Closing */}
        <section className='mx-auto mt-24 max-w-4xl px-4 text-center md:mt-32'>
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
          <div className='relative mx-auto mt-16 hidden w-fit sm:block'>
            <MorphingBlob
              fill='#99BB44'
              seed={31}
              className='absolute -inset-10 -z-10 opacity-20'
            />
            <Image
              src={Illustrations.foodBag}
              className='float-gentle mx-auto'
              alt=''
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function FloatingLeaf({
  className,
  delay = '0s',
}: {
  className?: string;
  delay?: string;
}) {
  return (
    <svg
      viewBox='0 0 24 24'
      aria-hidden='true'
      className={`float-gentle absolute ${className ?? ''}`}
      style={{ animationDelay: delay }}
    >
      <path
        d='M12 22 C 4 14, 5 5, 12 2 C 19 5, 20 14, 12 22 Z'
        fill='#446622'
        opacity={0.55}
      />
    </svg>
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
      <div className='blob flex size-9 items-center justify-center bg-primary/10 text-primary'>
        {icon}
      </div>
      <h3 className='mt-3 text-sm font-semibold'>{title}</h3>
      <p className='mt-1 text-sm text-muted-foreground'>{text}</p>
    </li>
  );
}
