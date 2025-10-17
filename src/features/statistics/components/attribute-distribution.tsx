'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  CustomTooltipProps,
} from '@components/ui/chart';
import { useRef } from 'react';
import { Cell, Label, Pie, PieChart } from 'recharts';
import { DownloadButton } from './chart-download-button';
import { colorMapping } from '../statistics-config';

export interface AttributeDataPoint {
  position: number;
  value: number;
  description: string;
  [key: string]: string | number;
}

// --- Type Definitions ---
interface ChartData {
  position: number;
  value: number;
  description: string;
  [key: string]: string | number;
}

interface AttributeDistributionChartProps {
  attributeDistribution: {
    name: string;
    data: ChartData[];
  };
  onFilter?: (value: string) => void;
  title?: string;
}

const defaultColor = '#E0E0E0';

// --- The Chart Component ---
export function AttributeDistributionChart({
  attributeDistribution,
  onFilter,
  title,
}: AttributeDistributionChartProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!title) {
    return (
      <AttributeDistributionChartContent
        attributeDistribution={attributeDistribution}
        onFilter={onFilter}
      />
    );
  }

  return (
    <Card ref={cardRef}>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span>{title}</span>
          <DownloadButton
            elementRef={cardRef}
            filename={`${title.toLocaleLowerCase()}-distribution`}
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AttributeDistributionChartContent
          attributeDistribution={attributeDistribution}
          onFilter={onFilter}
        />
      </CardContent>
    </Card>
  );
}

interface AttributeDistributionChartContentProps {
  attributeDistribution: {
    name: string;
    data: ChartData[];
  };
  onFilter?: (value: string) => void;
}

function AttributeDistributionChartContent({
  attributeDistribution,
  onFilter,
}: AttributeDistributionChartContentProps) {
  const chartData = attributeDistribution.data;

  const chartConfig: Record<string, { label: string; color: string }> = {};
  chartData.forEach((item) => {
    chartConfig[item.description] = {
      label: item.description,
      color: colorMapping[item.position] || defaultColor,
    };
  });
  return (
    <div className='grid w-full grid-cols-12 items-center gap-6 md:gap-2'>
      {chartData.length > 0 ? (
        <div className='col-span-12 xs:col-span-4'>
          <ChartContainer config={chartConfig} className='h-[135px] w-full'>
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={(props: CustomTooltipProps) => (
                  <ChartTooltipContent {...props} hideLabel />
                )}
              />
              <Pie
                data={chartData}
                dataKey='value'
                nameKey='description'
                innerRadius={45}
                outerRadius={60}
                paddingAngle={0}
                cornerRadius={0}
                onClick={(data: { name: string }) => onFilter?.(data.name)}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.position}`}
                    fill={colorMapping[entry.position] || defaultColor}
                    className='focus:outline-none'
                  />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor='middle'
                          dominantBaseline='middle'
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className='fill-foreground font-bold'
                          >
                            {attributeDistribution.name}
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
      ) : (
        <div className='col-span-12 flex h-[250px] w-full items-center justify-center text-center text-muted-foreground'>
          Nicht genügend Datenpunkte, <br /> um das Diagramm für den gewählten
          Zeitraum anzuzeigen.
        </div>
      )}

      <ul className='col-span-12 grid w-full grid-flow-col grid-rows-4 justify-center gap-x-4 gap-y-2 xs:col-span-8 xs:justify-start'>
        {chartData.map((item) => (
          <button
            type='button'
            onClick={() => onFilter?.(item.description)}
            key={item.position}
            className='flex cursor-pointer items-center gap-2'
          >
            <span
              className='h-4 w-2 shrink-0 rounded-lg'
              style={{
                backgroundColor: colorMapping[item.position] || defaultColor,
              }}
            />
            <span className='truncate text-sm text-muted-foreground'>
              {item.description}
            </span>
          </button>
        ))}
      </ul>
    </div>
  );
}
