'use client';

import { AttributeDistributionChart } from '@/features/statistics/components/attribute-distribution';
import { KeyFigure } from '@/features/statistics/components/key-figure';
import { TimespanPicker } from '@/features/statistics/components/timespan-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { defaultDateRange } from '@/lib/config/site-config';
import { BlurFade } from '@components/magicui/blur-fade';
import { useState } from 'react';
import {
  getPlatformKeyFigures,
  getPlatformVolumeTrendData,
  getPlatformContributionsByCategory,
  getPlatformContributionsByOrigin,
  getPlatformContributionsByCompany,
  getPlatformContributionsByFairteiler,
} from '../converter';
import { PlatformFairteilerMap } from '../../../statistics/components/platform-fairteiler-map';
import { ChartFilter } from '@/features/statistics/components/chart-filter';
import { VolumeTrendChart } from '@/features/statistics/components/volume-trend-chart';
import { Fairteiler, vContribution } from '@/server/db/db-types';
import { ReportFilters, StringFilterKeys } from '@/features/statistics/types';
import { CumulativeTrendChart } from '@/features/statistics/components/cumulative-trend-chart';
import { ExportButton } from '@/features/statistics/components/data-export-button';
import { applyFilters } from '@/features/statistics/reporting-helpers';

interface PlatformReportingDashboardProps {
  data: vContribution[];
  fairteilers: Fairteiler[];
}

export function PlatformReportingDashboard({
  data,
  fairteilers,
}: PlatformReportingDashboardProps) {
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: defaultDateRange,
  });

  const filteredData = applyFilters(data, filters);

  // Process all data from the single filtered source
  const keyFigureData = getPlatformKeyFigures(filteredData);
  const volumeTrendData = getPlatformVolumeTrendData(filteredData);
  const originData = getPlatformContributionsByOrigin(filteredData);
  const categoryData = getPlatformContributionsByCategory(filteredData);
  const companyData = getPlatformContributionsByCompany(filteredData);
  const fairteilerContributionsData =
    getPlatformContributionsByFairteiler(filteredData);

  // Handlers to update the filter state
  const handleAttributeDistributionFilter = (
    type: StringFilterKeys,
    value: string,
  ) => {
    setFilters((prev) => {
      const currentValues = prev[type] ?? [];
      const exists = currentValues.includes(value);

      return {
        ...prev,
        [type]: exists
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value],
      };
    });
  };

  const clearFilters = () => {
    setFilters({ dateRange: filters.dateRange });
  };

  return (
    <>
      {/* Export Button */}
      <div className='flex items-center justify-center sm:justify-end'>
        <ExportButton filters={filters} scope='platform' />
      </div>
      {/* Active Filters Display */}
      <Card className='flex flex-col py-0 lg:flex-row'>
        <CardContent className='flex flex-wrap items-center justify-center gap-x-4 gap-y-2 py-4 sm:justify-start'>
          <span className='w-full text-center text-lg font-semibold sm:w-auto sm:text-start'>
            Filter:
          </span>

          <TimespanPicker
            onDateRangeChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                dateRange: { from: e.from, to: e.to },
              }))
            }
          />

          <ChartFilter
            title='Kategorie'
            filterKey='category'
            options={categoryData.map((d) => ({
              label: d.description,
              value: d.description,
            }))}
            filters={filters}
            setFilters={setFilters}
          />

          <ChartFilter
            title='Herkunft'
            filterKey='origin'
            options={originData.map((d) => ({
              label: d.description,
              value: d.description,
            }))}
            filters={filters}
            setFilters={setFilters}
          />

          <ChartFilter
            title='Betrieb'
            filterKey='company'
            options={companyData.map((d) => ({
              label: d.description,
              value: d.description,
            }))}
            filters={filters}
            setFilters={setFilters}
          />

          <ChartFilter
            title='Fairteiler'
            filterKey='fairteiler'
            options={fairteilerContributionsData.map((d) => ({
              label: d.description,
              value: d.description,
            }))}
            filters={filters}
            setFilters={setFilters}
          />
        </CardContent>

        {/* Only show reset if any filter (except dateRange) is active */}
        {Object.keys(filters).some(
          (key) =>
            key !== 'dateRange' &&
            Array.isArray(filters[key as keyof ReportFilters]) &&
            (filters[key as keyof ReportFilters] as string[]).length > 0,
        ) && (
          <div className='flex items-center justify-end border-t border-foreground/30 px-4 py-2 lg:border-t-0 lg:border-l lg:py-0 lg:pl-4'>
            <Button
              variant='outline'
              onClick={() => clearFilters()}
              className='relative'
            >
              Filter zurücksetzen
              {/* Badge for active filter count */}
              <span className='ml-2 inline-flex size-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-white'>
                {Object.keys(filters).reduce((acc, key) => {
                  if (
                    key !== 'dateRange' &&
                    Array.isArray(filters[key as keyof ReportFilters])
                  ) {
                    return (
                      acc +
                      (filters[key as keyof ReportFilters] as string[]).length
                    );
                  }
                  return acc;
                }, 0)}
              </span>
            </Button>
          </div>
        )}
      </Card>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {keyFigureData.map((fig, i) => (
          <BlurFade key={fig.description} delay={i * 0.05} duration={0.2}>
            <KeyFigure keyFigure={fig} />
          </BlurFade>
        ))}
      </div>

      {/* Variety & Sourcing Section */}
      <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
        <BlurFade delay={0.25} duration={0.2}>
          <AttributeDistributionChart
            attributeDistribution={{
              name: 'Kategorie',
              data: categoryData,
            }}
            onFilter={(value) =>
              handleAttributeDistributionFilter('category', value)
            }
            title='Kategorien'
          />
        </BlurFade>
        <BlurFade delay={0.3} duration={0.2}>
          <AttributeDistributionChart
            attributeDistribution={{
              name: 'Herkunft',
              data: originData,
            }}
            onFilter={(value) =>
              handleAttributeDistributionFilter('origin', value)
            }
            title='Herkünfte'
          />
        </BlurFade>
        <BlurFade delay={0.35} duration={0.2}>
          <AttributeDistributionChart
            attributeDistribution={{
              name: 'Betrieb',
              data: companyData,
            }}
            onFilter={(value) =>
              handleAttributeDistributionFilter('company', value)
            }
            title='Betriebe'
          />
        </BlurFade>
        <BlurFade delay={0.4} duration={0.2}>
          <AttributeDistributionChart
            attributeDistribution={{
              name: 'Fairteiler',
              data: fairteilerContributionsData,
            }}
            onFilter={(value) =>
              handleAttributeDistributionFilter('fairteiler', value)
            }
            title='Fairteiler'
          />
        </BlurFade>
      </div>

      {/* Volume Trend Section */}
      <BlurFade delay={0.1} duration={0.2}>
        <VolumeTrendChart
          title='Gerettete Lebensmittel über Zeit'
          data={volumeTrendData}
        />
      </BlurFade>

      {/* Cumulative Trend Chart */}
      <BlurFade delay={0.15} duration={0.2}>
        <CumulativeTrendChart
          title='Gerettete Lebensmittel über Zeit (Kumulativ)'
          data={volumeTrendData}
        />
      </BlurFade>

      {/* Geographic Map */}
      <BlurFade delay={0.2} duration={0.2}>
        <PlatformFairteilerMap fairteilers={fairteilers} />
      </BlurFade>
    </>
  );
}
