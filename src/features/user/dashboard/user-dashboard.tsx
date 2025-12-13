'use client';

import { AttributeDistributionChart } from '@/features/statistics/components/attribute-distribution';
import { DataCalendar } from '@/features/fairteiler/dashboard/components/contribution-calendar';
import { KeyFigure } from '@/features/statistics/components/key-figure';
import { RecentContributions } from '@/features/statistics/components/recent-contributions';
import { BlurFade } from '@components/magicui/blur-fade';
import { Card } from '@components/ui/card';
import { UserDashboardData } from './user-dashboard-wrapper';
import { Milestones } from '../gamification/milestones/milestones';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Map, MapPin } from 'lucide-react';

export function UserDashboard({
  dashboardData,
}: {
  dashboardData: UserDashboardData;
}) {
  return (
    <div className='grid grid-cols-12 gap-4'>
      {dashboardData.calendarData.length > 0 ? (
        <>
          {/* Main Statistics */}
          <div className='md:col-span1 order-1 col-span-12 flex flex-col gap-2 md:flex-row lg:col-span-4 lg:flex-col'>
            {dashboardData.keyFigures.map((kf, i) => (
              <BlurFade key={i} delay={i * 0.08} className='h-full w-full'>
                <KeyFigure keyFigure={kf} />
              </BlurFade>
            ))}
          </div>

          {/* Milestones - order 2 on mobile, order 3 on md+ */}
          <BlurFade
            delay={0.07}
            className='order-2 col-span-12 md:order-3 md:col-span-2 lg:col-span-1'
          >
            <Milestones milestoneData={dashboardData.milestoneData} />
          </BlurFade>

          {/* Distribution Charts - order 3 on mobile, order 2 on md+ */}
          <BlurFade
            delay={0.12}
            className='order-3 col-span-12 w-full md:order-2 md:col-span-10 lg:col-span-7'
          >
            <Card className='h-full flex-col gap-4 rounded-lg bg-white md:gap-0 md:py-2'>
              <AttributeDistributionChart
                attributeDistribution={dashboardData.categoryDistribution}
              />
              <div className='hidden h-px w-full bg-border md:block' />
              <div className='h-full w-px bg-border md:hidden' />
              <AttributeDistributionChart
                attributeDistribution={dashboardData.originDistribution}
              />
            </Card>
          </BlurFade>

          {/* Bottom Row Content */}
          <div className='order-4 col-span-12 flex flex-col-reverse gap-4 md:col-span-10 lg:col-span-11 lg:flex-row'>
            <BlurFade delay={0.2} className='w-full'>
              <RecentContributions
                recentContributions={dashboardData.recentContributions}
              />
            </BlurFade>
            <BlurFade delay={0.25} className='w-full'>
              <DataCalendar
                data={dashboardData.calendarData}
                unit='kg'
                enableExport={true}
                exportFilename='meine-beitraege-kalender'
                exportTitle='Meine Beiträge'
              />
            </BlurFade>
          </div>
        </>
      ) : (
        <BlurFade delay={0.1} className='col-span-12'>
          <Card>
            <div className='bg-grid-pattern absolute inset-0 opacity-5' />
            <div className='relative flex flex-col items-center justify-center gap-6 p-12 text-center'>
              {/* Icon Circle */}
              <div className='relative'>
                <div className='absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl' />
                <div className='relative flex size-20 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/10'>
                  <Map className='size-12 text-primary' />
                </div>
              </div>

              {/* Text Content */}
              <div className='max-w-md space-y-2'>
                <h3 className='font-londrina text-3xl font-semibold text-foreground'>
                  Starte jetzt!
                </h3>
                <p className='max-w-xs text-muted-foreground'>
                  Finde einen Fairteiler und beginne deine Lebensmittelabgaben
                  zu tracken. Jeder Beitrag zählt!
                </p>
              </div>

              {/* CTA Button */}
              <Button
                size='lg'
                className='group relative mt-2 overflow-hidden px-8 py-6 font-londrina text-2xl shadow-lg transition-all hover:shadow-xl'
                asChild
              >
                <Link
                  href='/hub/user/fairteiler-finder'
                  className='flex items-center gap-2'
                >
                  <MapPin className='size-5' />
                  Fairteiler Finden
                </Link>
              </Button>
            </div>
          </Card>
        </BlurFade>
      )}
    </div>
  );
}
