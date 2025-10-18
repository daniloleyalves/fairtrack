'use client';

import { useRef } from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { DownloadButton } from './chart-download-button';
import { colorClasses } from '../statistics-config';
import { useIsMobile } from '@/lib/hooks/use-devices';

export interface CumulativeDataPoint {
  date: string; // Raw date in YYYY-MM-DD format
  quantity: number;
}

const chartConfig = {
  quantity: {
    label: 'Cumulative (kg)',
    color: colorClasses.primary.hex,
  },
} satisfies ChartConfig;

export function CumulativeTrendChart({
  title,
  data,
}: {
  title: string;
  data: CumulativeDataPoint[];
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Convert to cumulative data for growth visualization
  const cumulativeData = data.reduce((acc, curr, index) => {
    const cumulative =
      index === 0 ? curr.quantity : acc[index - 1].quantity + curr.quantity;
    acc.push({ ...curr, quantity: cumulative });
    return acc;
  }, [] as CumulativeDataPoint[]);

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

  const getTickFormatter = (dataLength: number) => {
    return (value: string) => {
      const date = new Date(value);

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
      if (date.getMonth() === 0) {
        const year = date.getFullYear().toString().slice(-2);
        return `${month} '${year}`;
      }

      return month;
    };
  };

  return (
    <Card ref={cardRef}>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span>{title}</span>
          <DownloadButton
            elementRef={cardRef}
            filename='cumulative-trend-chart'
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cumulativeData.length > 0 ? (
          <ChartContainer config={chartConfig} className='h-[300px] w-full'>
            <LineChart
              accessibilityLayer
              data={cumulativeData}
              margin={{ top: 11 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='date'
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                interval={getXAxisInterval(cumulativeData.length, isMobile)}
                tickFormatter={getTickFormatter(cumulativeData.length)}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? 'end' : 'middle'}
                height={isMobile ? 60 : 30}
              />
              <YAxis
                stroke='#888888'
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: string) => `${value} kg`}
              />
              <ChartTooltip
                cursor={false}
                content={(props) => (
                  <ChartTooltipContent
                    {...props}
                    indicator='line'
                    labelFormatter={(label) => {
                      if (typeof label === 'string') {
                        const date = new Date(label);
                        return date.toLocaleDateString('de-DE', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          timeZone: 'UTC',
                        });
                      }
                      return String(label);
                    }}
                  />
                )}
              />
              <Line
                type='natural'
                dataKey='quantity'
                stroke='var(--color-quantity)'
                strokeWidth={4}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className='flex h-[250px] w-full items-center justify-center text-muted-foreground'>
            Nicht genügend Datenpunkte, <br /> um das Wachstumsdiagramm
            anzuzeigen.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
