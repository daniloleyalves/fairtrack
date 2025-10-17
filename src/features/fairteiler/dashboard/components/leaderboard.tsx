import { ArrowUpDown, Crown, Search, Users } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useState } from 'react';

interface FoodsaverLeaderboardProps {
  leaderboardEntries: LeaderboardEntry[];
}

interface LeaderboardEntry {
  id: string;
  name: string;
  email: string;
  totalQuantity: number;
}

export function FoodsaverLeaderboard({
  leaderboardEntries = [],
}: FoodsaverLeaderboardProps) {
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<LeaderboardEntry>();

  const fairteilerMembersEntry = leaderboardEntries.find(
    (entry) => entry.id === 'members of fairteiler',
  );
  const individualFoodsavers = leaderboardEntries.filter(
    (entry) => entry.id !== 'members of fairteiler',
  );

  const topPerformer =
    individualFoodsavers.length > 0
      ? individualFoodsavers.reduce((max, current) =>
          current.totalQuantity > max.totalQuantity ? current : max,
        )
      : null;

  const filteredLeaderboard = individualFoodsavers
    .filter((entry) =>
      entry.name?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) =>
      sortOrder === 'desc'
        ? b.totalQuantity - a.totalQuantity
        : a.totalQuantity - b.totalQuantity,
    )
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  return (
    <Card className='flex h-full flex-col'>
      <CardHeader>
        <CardTitle className='flex items-center justify-between space-x-2'>
          <span>Foodsaver:innen</span>
          <div className='flex gap-2'>
            <div className='relative'>
              <Search className='absolute top-1.5 left-2 size-4 text-foreground/70' />
              <Input
                className='h-7 pl-7'
                placeholder='Suchen...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              size='icon'
              variant='ghost'
              className='h-7 w-10 rounded-full border border-input bg-input/40'
              onClick={() =>
                setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
              }
            >
              <ArrowUpDown className='size-4 text-foreground/60' />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className='flex-1 space-y-2 overflow-y-auto'>
        {fairteilerMembersEntry?.totalQuantity &&
          fairteilerMembersEntry.totalQuantity > 0 && (
            <>
              <div className='grid h-10 grid-cols-12 items-center justify-between rounded-lg border border-border p-1 px-4 text-sm font-medium text-accent-foreground'>
                <Users className='col-span-1 size-4' />
                <h3 className='col-span-5 truncate'>
                  {fairteilerMembersEntry.name}
                </h3>
                <span className='col-span-6 text-end font-londrina text-xl font-bold text-primary'>
                  {formatNumber(fairteilerMembersEntry.totalQuantity)} kg
                </span>
              </div>
              <Separator />
            </>
          )}

        {filteredLeaderboard && filteredLeaderboard.length > 0 ? (
          <ol className='list-decimal space-y-2 overflow-y-auto'>
            {filteredLeaderboard.map((foodsaver) => (
              <Popover key={foodsaver.id}>
                <PopoverTrigger
                  onClick={() => setSelectedUser(foodsaver)}
                  className={cn(
                    buttonVariants({ variant: 'ghost' }),
                    'grid h-10 w-full grid-cols-12 justify-between rounded-lg border border-input px-4 py-1 text-start',
                  )}
                >
                  {/* 4. Check against the top performer's ID, not the rank! */}
                  {topPerformer && foodsaver.id === topPerformer.id ? (
                    <Crown
                      className='col-span-1 size-4'
                      style={{ color: '#FFC60A' }}
                    />
                  ) : (
                    <span className='col-span-1 text-sm font-semibold'>
                      {foodsaver.rank}
                    </span>
                  )}
                  <h3
                    className={`col-span-7 truncate ${
                      (foodsaver.rank ?? 0) >= 99 ? 'pl-2' : ''
                    }`}
                  >
                    {foodsaver.name}
                  </h3>
                  <span className='col-span-4 text-end font-londrina text-xl font-bold text-primary'>
                    {formatNumber(foodsaver.totalQuantity)} kg
                  </span>
                </PopoverTrigger>
                <PopoverContent>
                  <div className='flex flex-col space-y-2'>
                    <div className='text-sm'>
                      <span className='font-medium'>Name: </span>
                      <span className='text-primary'>{selectedUser?.name}</span>
                    </div>
                    <div className='text-sm'>
                      <span className='font-medium'>E-Mail: </span>
                      {selectedUser?.email ?? '-'}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            ))}
          </ol>
        ) : (
          <p>Keine Daten vorhanden</p>
        )}
      </CardContent>
    </Card>
  );
}
