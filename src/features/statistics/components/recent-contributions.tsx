'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatInTimeZone } from 'date-fns-tz';
import { History } from 'lucide-react';
import Image from 'next/image';

interface RecentContributionsProps {
  recentContributions: {
    id: string;
    date: Date;
    title: string | null;
    category: {
      name: string;
      image: string | null;
    };
    quantity: number;
  }[];
}

export function RecentContributions({
  recentContributions,
}: RecentContributionsProps) {
  return (
    <Card className='h-max xl:min-w-2/5'>
      <CardHeader className='px-4 xs:px-6'>
        <CardTitle className='flex items-center gap-2'>
          <History className='size-5' />
          Kürzliche Abgaben
        </CardTitle>
      </CardHeader>
      <CardContent className='px-2 xs:px-6'>
        {recentContributions.length === 0 ? (
          <div className='py-8 text-center text-muted-foreground'>
            Keine kürzlichen Abgaben gefunden.
          </div>
        ) : (
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Lebensmittel</TableHead>
                  <TableHead className='text-right'>Menge (kg)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentContributions.map((contribution) => (
                  <TableRow key={contribution.id}>
                    <TableCell>
                      {formatInTimeZone(contribution.date, 'UTC', 'dd.MM.yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        {contribution.category.image && (
                          <Image
                            src={contribution.category.image}
                            width={36}
                            height={36}
                            alt={contribution.category.name}
                            className='rounded-md'
                          />
                        )}
                        <span className='max-w-[140px] truncate font-medium sm:max-w-max'>
                          {contribution.title ??
                            contribution.category.name ??
                            '-'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='text-right'>
                      {contribution.quantity
                        ? contribution.quantity.toFixed(2)
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
