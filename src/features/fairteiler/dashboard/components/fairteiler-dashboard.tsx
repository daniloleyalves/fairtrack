'use client';

import { AttributeDistributionChart } from '@/features/statistics/components/attribute-distribution';
import { DataCalendar } from '@/features/fairteiler/dashboard/components/contribution-calendar';
import { KeyFigure } from '@/features/statistics/components/key-figure';
import { FoodsaverLeaderboard } from '@/features/fairteiler/dashboard/components/leaderboard';
import { RecentContributions } from '@/features/statistics/components/recent-contributions';
import { Card } from '@components/ui/card';
import { DashboardData } from './fairteiler-dashboard-wrapper';

export function FairteilerDashboard({ data }: { data: DashboardData }) {
  return (
    <div className='grid grid-cols-12 gap-4'>
      {/* Left Column Content */}
      <div className='col-span-12 flex flex-col gap-4 lg:col-span-7'>
        <div className='flex flex-col gap-2 sm:flex-row'>
          {data.keyFigures.map((kf, i) => (
            <div key={i} className='w-full'>
              <KeyFigure keyFigure={kf} />
            </div>
          ))}
        </div>
        <div className='w-full'>
          <Card className='h-full flex-col gap-4 rounded-lg bg-white md:gap-0 md:py-2'>
            <AttributeDistributionChart
              attributeDistribution={data.categoryDistribution}
            />
            <div className='hidden h-px w-full bg-border md:block' />
            <div className='h-full w-px bg-border md:hidden' />
            <AttributeDistributionChart
              attributeDistribution={data.originDistribution}
            />
          </Card>
        </div>
      </div>

      {/* Right Column Content (Leaderboard) */}
      <div className='relative col-span-12 lg:col-span-5'>
        <div className='absolute inset-0 overflow-y-auto'>
          <div className='h-full'>
            <FoodsaverLeaderboard
              leaderboardEntries={data.leaderboardEntries}
            />
          </div>
        </div>
      </div>

      {/* Bottom Row Content */}
      <div className='col-span-12 flex flex-col-reverse gap-4 lg:flex-row'>
        <div className='w-full'>
          <RecentContributions recentContributions={data.recentContributions} />
        </div>
        <div className='w-full'>
          <DataCalendar
            data={data.calendarData}
            unit='kg'
            enableExport={true}
            exportFilename='fairteiler-kalender'
          />
        </div>
      </div>
    </div>
  );
}
