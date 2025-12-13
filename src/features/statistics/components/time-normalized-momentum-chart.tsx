'use client';

import { useRef, useState } from 'react';
import {
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart';
import { DownloadButton } from './chart-download-button';
import { colorClasses } from '../statistics-config';
import { useIsMobile } from '@/lib/hooks/use-devices';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  NameType,
  Payload,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';

export interface TimeNormalizedDataPoint {
  date: string; // Raw date in YYYY-MM-DD format
  delta: number; // Change from previous period
  quantity: number; // Quantity for this period (0 if no data)
  hasData: boolean; // Whether this period had actual data
}

type PeriodType = 'week' | 'month';

const chartConfig = {
  delta: {
    label: 'Veränderung',
    color: colorClasses.primary.hex,
  },
} satisfies ChartConfig;

// Get Monday of the week for a given date
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), diff);
}

// Get first day of the month for a given date
function getMonthStart(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

// Generate complete weekly date range
function generateWeeklyDateRange(startDate: Date, endDate: Date): string[] {
  const dates: string[] = [];
  const current = getWeekStart(startDate);
  const end = getWeekStart(endDate);

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setUTCDate(current.getUTCDate() + 7);
  }

  return dates;
}

// Generate complete monthly date range
function generateMonthlyDateRange(startDate: Date, endDate: Date): string[] {
  const dates: string[] = [];
  const current = getMonthStart(startDate);
  const end = getMonthStart(endDate);

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setUTCMonth(current.getUTCMonth() + 1);
  }

  return dates;
}

// Aggregate data by week
function aggregateByWeek(
  data: { date: string; quantity: number }[],
): Map<string, number> {
  const weeklyData = new Map<string, number>();

  data.forEach((point) => {
    const date = new Date(point.date);
    const weekKey = getWeekStart(date).toISOString().split('T')[0];

    const existing = weeklyData.get(weekKey) ?? 0;
    weeklyData.set(weekKey, existing + point.quantity);
  });

  return weeklyData;
}

// Aggregate data by month
function aggregateByMonth(
  data: { date: string; quantity: number }[],
): Map<string, number> {
  const monthlyData = new Map<string, number>();

  data.forEach((point) => {
    const date = new Date(point.date);
    const monthKey = getMonthStart(date).toISOString().split('T')[0];

    const existing = monthlyData.get(monthKey) ?? 0;
    monthlyData.set(monthKey, existing + point.quantity);
  });

  return monthlyData;
}

// ISO week number calculation
function getISOWeek(date: Date): number {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function TimeNormalizedMomentumChart({
  title,
  data,
  dateRange,
}: {
  title: string;
  data: { date: string; quantity: number }[];
  dateRange?: { from?: Date; to?: Date };
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [periodType, setPeriodType] = useState<PeriodType>('week');

  // Determine date range - prefer the filter's date range, fallback to data range
  let startDate: Date;
  let endDate: Date;

  if (dateRange?.from && dateRange?.to) {
    // Use the filter's date range
    startDate = dateRange.from;
    endDate = dateRange.to;

    // Ensure endDate is at least today if the filter extends to now or beyond
    const today = new Date();
    if (dateRange.to >= today) {
      endDate = today;
    }
  } else if (data.length === 0) {
    // If no data and no filter, show last 12 weeks
    endDate = new Date();
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 12 * 7);
  } else {
    // Fallback to data range
    const dates = data
      .map((d) => new Date(d.date))
      .sort((a, b) => a.getTime() - b.getTime());
    startDate = dates[0];
    endDate = dates[dates.length - 1];

    // Extend to today if last data is before today
    const today = new Date();
    if (endDate < today) {
      endDate = today;
    }
  }

  // Aggregate and generate ranges based on period type
  const aggregatedData =
    periodType === 'week' ? aggregateByWeek(data) : aggregateByMonth(data);

  const completeDateRange =
    periodType === 'week'
      ? generateWeeklyDateRange(startDate, endDate)
      : generateMonthlyDateRange(startDate, endDate);

  // Create normalized dataset with all periods
  const normalizedData = completeDateRange.map((periodDate: string) => {
    const quantity = aggregatedData.get(periodDate) ?? 0;
    return {
      date: periodDate,
      quantity,
      hasData: aggregatedData.has(periodDate),
    };
  });

  // Calculate deltas for momentum
  const momentumData: TimeNormalizedDataPoint[] = normalizedData.map(
    (curr, index) => {
      const delta =
        index === 0 ? 0 : curr.quantity - normalizedData[index - 1].quantity;
      return {
        date: curr.date,
        delta,
        quantity: curr.quantity,
        hasData: curr.hasData,
      };
    },
  );

  // Prepare data with positive and negative values for area fills
  const chartData = momentumData.map((point) => ({
    ...point,
    positiveArea: point.delta > 0 ? point.delta : 0,
    negativeArea: point.delta < 0 ? point.delta : 0,
  }));

  const getXAxisInterval = (dataLength: number, isMobile: boolean) => {
    if (dataLength <= 7) return 0; // Show all labels for a week or less

    // Show fewer labels on mobile to prevent cramping
    if (isMobile) {
      if (dataLength <= 30) return Math.ceil(dataLength / 4); // Show ~4 labels for a month
      if (dataLength <= 90) return Math.ceil(dataLength / 5); // Show ~5 labels for 3 months
      if (dataLength <= 365) return Math.ceil(dataLength / 6); // Show ~6 labels for a year
      return Math.ceil(dataLength / 8); // Show ~8 labels for longer periods
    }

    // Desktop: Show more labels
    if (dataLength <= 30) return Math.ceil(dataLength / 7); // Show ~7 labels for a month
    if (dataLength <= 90) return Math.ceil(dataLength / 10); // Show ~10 labels for 3 months
    if (dataLength <= 365) return Math.ceil(dataLength / 12); // Show ~12 labels for a year
    return Math.ceil(dataLength / 15); // Show ~15 labels for longer periods
  };

  const getTickFormatter = (dataLength: number, period: PeriodType) => {
    return (value: string) => {
      const date = new Date(value);

      if (period === 'month') {
        // For monthly view, always show month name
        const month = date.toLocaleDateString('de-DE', {
          month: 'short',
          timeZone: 'UTC',
        });

        // Add year to January or if showing multiple years
        if (date.getUTCMonth() === 0) {
          const year = date.getUTCFullYear().toString().slice(-2);
          return `${month} '${year}`;
        }

        return month;
      }

      // Weekly view
      if (dataLength <= 30) {
        // For short ranges, show day and month without year
        return date.toLocaleDateString('de-DE', {
          month: 'short',
          day: 'numeric',
          timeZone: 'UTC',
        });
      }

      // For longer ranges, show month and optionally year
      const month = date.toLocaleDateString('de-DE', {
        month: 'short',
        timeZone: 'UTC',
      });

      // Add year to January
      if (date.getUTCMonth() === 0) {
        const year = date.getUTCFullYear().toString().slice(-2);
        return `${month} '${year}`;
      }

      return month;
    };
  };

  const getTooltipLabel = (date: Date, period: PeriodType): string => {
    if (period === 'week') {
      const weekNumber = getISOWeek(date);
      const monthName = date.toLocaleDateString('de-DE', {
        month: 'long',
        timeZone: 'UTC',
      });
      return `KW${weekNumber} · ${monthName}`;
    } else {
      return date.toLocaleDateString('de-DE', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      });
    }
  };

  return (
    <Card ref={cardRef}>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span>{title}</span>
          <div className='flex items-center gap-2'>
            <ToggleGroup
              type='single'
              value={periodType}
              onValueChange={(value) => {
                if (value) setPeriodType(value as PeriodType);
              }}
              size='sm'
            >
              <ToggleGroupItem value='week' aria-label='Wöchentlich'>
                Woche
              </ToggleGroupItem>
              <ToggleGroupItem value='month' aria-label='Monatlich'>
                Monat
              </ToggleGroupItem>
            </ToggleGroup>
            <DownloadButton
              elementRef={cardRef}
              filename='time-normalized-momentum-chart'
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className='h-[300px] w-full'>
            <ComposedChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 11 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='date'
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                interval={getXAxisInterval(chartData.length, isMobile)}
                tickFormatter={getTickFormatter(chartData.length, periodType)}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? 'end' : 'middle'}
                height={isMobile ? 60 : 30}
              />
              <YAxis
                stroke='var(--color-border)'
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => `${value} kg`}
              />
              <ReferenceLine
                y={0}
                stroke='var(--color-border)'
                strokeDasharray='3 3'
              />

              <ChartTooltip
                cursor={false}
                content={(props) => {
                  const active: boolean | undefined = props.active;
                  const payload: Payload<ValueType, NameType>[] | undefined =
                    props.payload;

                  if (!active || !payload || payload.length === 0) {
                    return null;
                  }

                  // Filter to only show the delta line, not the area fills
                  const filteredPayload = payload.filter(
                    (item) => item.dataKey === 'delta',
                  );

                  if (filteredPayload.length === 0) {
                    return null;
                  }

                  const dataPoint = filteredPayload[0]
                    .payload as TimeNormalizedDataPoint;
                  const delta = dataPoint.delta;
                  const sign = delta > 0 ? '+' : '';

                  const date = new Date(dataPoint.date);
                  const tooltipLabel = getTooltipLabel(date, periodType);

                  return (
                    <div className='rounded-lg border bg-background p-2 shadow-sm'>
                      <div className='flex flex-col gap-1'>
                        <div className='flex items-center justify-between gap-4'>
                          <span className='text-muted-foreground'>
                            Veränderung
                          </span>
                          <span
                            className={`font-medium ${
                              delta > 0
                                ? 'text-primary'
                                : delta < 0
                                  ? 'text-destructive'
                                  : 'text-muted-foreground'
                            }`}
                          >
                            {sign}
                            {delta.toFixed(1)} kg
                          </span>
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          {tooltipLabel}
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              {/* Positive area fill */}
              <Area
                type='monotone'
                dataKey='positiveArea'
                stroke='none'
                fill='var(--color-primary)'
                fillOpacity={0.2}
              />
              {/* Negative area fill */}
              <Area
                type='monotone'
                dataKey='negativeArea'
                stroke='none'
                fill='var(--color-destructive)'
                fillOpacity={0.2}
              />
              {/* Main momentum line */}
              <Line
                type='monotone'
                dataKey='delta'
                stroke='var(--color-primary)'
                strokeWidth={3}
                dot={false}
              />
            </ComposedChart>
          </ChartContainer>
        ) : (
          <div className='flex h-[250px] w-full items-center justify-center text-muted-foreground'>
            Nicht genügend Datenpunkte, <br /> um das Momentum-Diagramm
            anzuzeigen.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
