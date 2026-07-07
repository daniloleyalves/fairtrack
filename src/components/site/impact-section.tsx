'use client';

import { NumberTicker } from '@/components/magicui/number-ticker';
import { BlurFade } from '@/components/magicui/blur-fade';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type {
  DistributionShare,
  PublicImpactStats,
} from '@/server/platform/queries';
import { formatNumber } from '@/lib/utils';
import { motion, useReducedMotion } from 'motion/react';
import {
  ClipboardList,
  Cloud,
  MapPin,
  UsersRound,
  Utensils,
} from 'lucide-react';

const KG_PER_MEAL = 0.5;
const CO2_PER_KG = 2.5;

export function ImpactSection({ stats }: { stats: PublicImpactStats }) {
  const meals = Math.round(stats.totalQuantityKg / KG_PER_MEAL);
  const co2Tonnes = (stats.totalQuantityKg * CO2_PER_KG) / 1000;

  return (
    <section aria-labelledby='impact-heading' className='mx-auto max-w-5xl'>
      <BlurFade inView>
        <p className='text-center text-sm font-semibold tracking-widest text-tertiary uppercase'>
          Gemeinsam gerettet
        </p>
        <h2
          id='impact-heading'
          className='mt-2 text-center font-londrina text-4xl text-primary sm:text-5xl'
        >
          Wirkung, die man messen kann
        </h2>
        <p className='mx-auto mt-4 max-w-2xl text-center text-muted-foreground'>
          Jede Abgabe an einem Fairteiler wird mit FairTrack digital erfasst.
          Diese Zahlen sind keine Hochrechnung – sie kommen direkt aus den
          Retteformularen der Community.
        </p>
      </BlurFade>

      <div className='mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <StatTile
          icon={<ClipboardList className='size-5' />}
          value={stats.totalContributions}
          label='Abgaben digital erfasst'
          delay={0}
        />
        <StatTile
          icon={<UsersRound className='size-5' />}
          value={stats.activeContributors}
          label='Aktive Foodsaver:innen'
          delay={0.1}
        />
        <StatTile
          icon={<MapPin className='size-5' />}
          value={stats.totalFairteilers}
          label='Fairteiler-Stationen'
          delay={0.2}
        />
      </div>

      <BlurFade inView delay={0.15}>
        <div className='mt-4 grid grid-cols-1 gap-4 rounded-2xl bg-primary p-6 text-primary-foreground sm:grid-cols-2 sm:p-8'>
          <div className='flex items-center gap-4'>
            <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/15'>
              <Utensils className='size-6' />
            </div>
            <div>
              <p className='text-3xl font-semibold'>
                <NumberTicker
                  value={meals}
                  className='text-primary-foreground'
                />
              </p>
              <p className='text-sm text-primary-foreground/80'>
                gerettete Mahlzeiten*
              </p>
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/15'>
              <Cloud className='size-6' />
            </div>
            <div>
              <p className='text-3xl font-semibold'>
                <NumberTicker
                  value={co2Tonnes}
                  decimalPlaces={1}
                  className='text-primary-foreground'
                />{' '}
                t
              </p>
              <p className='text-sm text-primary-foreground/80'>
                CO₂-Äquivalente vermieden*
              </p>
            </div>
          </div>
        </div>
      </BlurFade>

      {(stats.categoryShares.length > 0 || stats.originShares.length > 0) && (
        <div className='mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {stats.categoryShares.length > 0 && (
            <DistributionCard
              title='Was gerettet wird'
              subtitle='Erfasste Menge nach Kategorie'
              shares={stats.categoryShares}
              delay={0.1}
            />
          )}
          {stats.originShares.length > 0 && (
            <DistributionCard
              title='Woher es kommt'
              subtitle='Erfasste Menge nach Herkunft'
              shares={stats.originShares}
              delay={0.2}
            />
          )}
        </div>
      )}

      <p className='mt-6 text-center text-xs text-muted-foreground'>
        *Umrechnung mit Durchschnittswerten: 1&nbsp;kg ≈ 2 Mahlzeiten ·
        1&nbsp;kg gerettete Lebensmittel ≈ 2,5&nbsp;kg CO₂e. Gesamtmenge inkl.
        rund 70.000&nbsp;kg, die vor der digitalen Erfassung dokumentiert
        wurden.
      </p>
    </section>
  );
}

function StatTile({
  icon,
  value,
  label,
  delay,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  delay: number;
}) {
  return (
    <BlurFade inView delay={delay}>
      <div className='flex h-full flex-col gap-3 rounded-2xl border border-primary/10 bg-white p-6'>
        <div className='flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
          {icon}
        </div>
        <p className='text-4xl font-semibold text-foreground'>
          <NumberTicker value={value} />
        </p>
        <p className='text-sm text-muted-foreground'>{label}</p>
      </div>
    </BlurFade>
  );
}

function DistributionCard({
  title,
  subtitle,
  shares,
  delay,
}: {
  title: string;
  subtitle: string;
  shares: DistributionShare[];
  delay: number;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <BlurFade inView delay={delay} className='h-full'>
      <div className='h-full rounded-2xl border border-primary/10 bg-white p-6'>
        <h3 className='font-londrina text-2xl text-primary'>{title}</h3>
        <p className='mt-1 text-sm text-muted-foreground'>{subtitle}</p>
        <ul className='mt-5 space-y-4'>
          {shares.map((share, index) => (
            <li key={share.name}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className='cursor-default'>
                    <div className='mb-1.5 flex items-baseline justify-between gap-2'>
                      <span className='truncate text-sm font-medium text-foreground'>
                        {share.name}
                      </span>
                      <span className='shrink-0 text-sm text-muted-foreground'>
                        {formatNumber(share.kg, 0)}&nbsp;kg
                      </span>
                    </div>
                    <div className='h-2.5 w-full overflow-hidden rounded-full bg-primary/10'>
                      <motion.div
                        className='h-full rounded-full bg-primary'
                        initial={reducedMotion ? false : { width: 0 }}
                        whileInView={{ width: `${share.share * 100}%` }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{
                          duration: 0.9,
                          delay: 0.1 + index * 0.07,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        style={
                          reducedMotion
                            ? { width: `${share.share * 100}%` }
                            : undefined
                        }
                      />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side='top'>
                  {share.name}: {formatNumber(share.kg, 1)}&nbsp;kg (
                  {formatNumber(share.share * 100, 1)}&nbsp;%)
                </TooltipContent>
              </Tooltip>
            </li>
          ))}
        </ul>
      </div>
    </BlurFade>
  );
}
