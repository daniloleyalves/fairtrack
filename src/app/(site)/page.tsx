import { NumberTicker } from '@/components/magicui/number-ticker';
import { Illustrations } from '@/lib/assets/illustrations';
import { initialContributionQuantity } from '@/lib/config/site-config';
import { getKeyFigures } from '@/server/dto';
import { Button } from '@components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@components/ui/popover';
import { Info } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default async function Home() {
  const contributionData = await getKeyFigures();
  const totalContributionQuantity =
    (contributionData?.totalQuantity ?? 0) + initialContributionQuantity;
  return (
    <div className='px-4 sm:px-0'>
      <div className='mx-auto max-w-5xl pt-16 sm:pt-20 md:pt-16'>
        <h1 className='text-center font-londrina text-6xl font-extrabold lg:text-7xl'>
          RETTEN, TRACKEN, TEILEN
        </h1>
        <p className='mx-auto mt-3 max-w-3xl text-center font-semibold sm:text-xl'>
          Behalte den Überblick über deinen Foodsharing-Beitrag und trage aktiv
          zu einer Wirkungsmessung der Foodsharing-Bewegung bei!
        </p>
        <div className='sm:max-w-auto mx-auto mt-6 flex max-w-[200px] flex-col justify-center gap-4 sm:flex-row'>
          <Button asChild size='lg' className='text-md'>
            <Link href='/sign-in'>Jetzt mitmachen</Link>
          </Button>
          <Button asChild size='lg' variant='secondary' className='text-md'>
            <Link href='/info-and-faq'>
              <Info className='mr-2 size-4' />
              Erfahre mehr
            </Link>
          </Button>
        </div>
      </div>

      <div className='relative mt-10 flex justify-center md:mt-16'>
        <div className='absolute top-1/2 z-10 -translate-y-1/3 text-center font-londrina text-primary'>
          <h2 className='text-5xl sm:text-8xl'>
            <NumberTicker value={totalContributionQuantity} decimalPlaces={2} />
          </h2>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='link' className='text-lg md:text-xl'>
                fairteilt
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <p>
                Gesamte fairteilte Menge an Lebensmitteln aller
                <Button asChild variant='link' className='text-md p-1'>
                  <Link href='/fairteiler'>Fairteiler</Link>
                </Button>
                , die FairTrack nutzen.
              </p>
            </PopoverContent>
          </Popover>
        </div>
        <Image
          src={Illustrations.valueBackground}
          className='sm:w-[700px]'
          alt='value background'
          loading='eager'
          decoding='sync'
          priority
        />
      </div>

      <div className='hidden lg:block'>
        <svg
          viewBox='0 0 85 151'
          fill='none'
          className='absolute top-24 right-0 h-36'
        >
          <path
            // transition:draw={{ duration: 5000, easing: quintOut }}
            d='M184.5 30.5L85.948 7.79981C45.2974 -1.56353 6.5 29.3132 6.5 71.0282V71.0282C6.5 118.016 54.892 149.423 97.8068 130.288L200.5 84.5'
            stroke='#446622'
            strokeWidth='12'
          />
        </svg>
        <svg
          viewBox='0 0 120 270'
          fill='none'
          id='bubble'
          className='absolute top-20 right-0 h-60'
        >
          <path
            // transition:draw={{ duration: 3000, easing: quintOut }}
            d='M216.113 38.3471L121.573 10.294C63.8989 -6.81963 6 36.3941 6 96.5535V96.5535C6 165.729 80.8082 209.03 140.793 174.575L235 120.463'
            stroke='#99BB44'
            strokeWidth='8'
          />
        </svg>

        <svg
          viewBox='0 0 463 715'
          fill='none'
          id='curve'
          className='absolute top-[500px] -left-40 h-[350px]'
        >
          <path
            // transition:draw={{ duration: 3000, easing: quintOut }}
            d='M191.302 6L250.033 26.8248C364.536 67.4258 444.754 171.187 455.215 292.224V292.224C466.966 428.195 388.382 555.848 261.688 606.592L6 709'
            stroke='#446622'
            strokeWidth='14'
            strokeLinecap='round'
          />
        </svg>

        <svg
          viewBox='0 0 423 569'
          fill='none'
          id='curve'
          className='absolute top-[480px] -left-48 h-[400px]'
        >
          <path
            // transition:draw={{ duration: 5000, easing: quintOut }}
            d='M175.547 10L249.26 32.8475C338.176 60.4072 401.934 138.547 411.093 231.184V231.184C421.601 337.473 358.027 437.154 257.219 472.447L10 559'
            stroke='#99BB44'
            strokeWidth='20'
            strokeLinecap='round'
          />
        </svg>
      </div>

      <div className='mt-24'>
        <div>
          <h3 className='mb-12 text-center font-londrina text-3xl text-tertiary sm:text-4xl'>
            Und so funktionierts...
          </h3>
        </div>
        <div className='grid grid-cols-1 gap-24 sm:grid-cols-2 lg:grid-cols-3'>
          <div className='col-span-1'>
            <Image
              // in:scale={{ easing: backOut, duration: 200, start: 0.9 }}
              src={Illustrations.walkingIllustration}
              alt='walking to fairteiler illustration'
              className='mx-auto w-3/5 sm:w-full'
              loading='eager'
            />
            <h4
              className='mt-8 text-center font-londrina text-2xl text-muted-foreground'
              // in:fly={{ y: 20, easing: backOut, duration: 300, delay: 200 }}
            >
              Bei FairTrack registrierte <br /> Fairteiler
              <Button
                asChild
                variant='link'
                className='p-1 text-2xl text-primary'
              >
                <Link href='/fairteiler'>finden</Link>
              </Button>
              und aufsuchen
            </h4>
          </div>
          <div className='col-span-1'>
            <Image
              // in:scale={{ easing: backOut, duration: 200, start: 0.9 }}
              src={Illustrations.arrivingIllustration}
              alt='arriving at fairteiler illustration'
              className='mx-auto w-3/5 sm:w-full'
              loading='eager'
            />
            <h4
              className='mt-8 text-center font-londrina text-2xl text-muted-foreground'
              // in:fly={{ y: 20, easing: backOut, duration: 300, delay: 200 }}
            >
              Lebensmittel abgeben und <br /> digitales Retteformular ausfüllen
            </h4>
          </div>
          <div className='place-self-center sm:col-span-2 lg:col-span-1 lg:place-self-start'>
            <Image
              // in:scale={{ easing: backOut, duration: 200, start: 0.9 }}
              src={Illustrations.statisticsIllustration}
              alt='statistics about food sharing illustration'
              className='mx-auto w-3/5 sm:w-2/3 lg:w-full'
              loading='eager'
            />
            <h4
              className='mt-8 text-center font-londrina text-2xl text-muted-foreground'
              // in:fly={{ y: 20, easing: backOut, duration: 300, delay: 200 }}
            >
              Lebensmittelabgaben im Dashboard verfolgen
            </h4>
          </div>
        </div>
      </div>

      <h5 className='text-md mt-24 mb-6 text-center font-semibold sm:text-xl md:mt-32 md:text-2xl'>
        Durch das digitale Retteformular werden aus Schätzungen
        <span className='font-bold text-tertiary'> Fakten </span> <br />
        über das Engagement der Foodsharing-Community.
      </h5>
      <h5 className='mb-20 text-center font-londrina text-2xl font-medium text-tertiary sm:mb-0 sm:text-3xl md:text-4xl'>
        Gemeinsam für mehr Lebensmittelwertschätzung
      </h5>

      <Image
        src={Illustrations.foodBag}
        className='mx-auto mt-28 hidden sm:block'
        alt='food bag'
      />
    </div>
  );
}
