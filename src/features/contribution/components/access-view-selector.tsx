'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, User } from 'lucide-react';
import { Member } from '@/server/db/db-types';
import {
  ACCESS_VIEW_ROLES,
  MemberRolesEnum,
  roles,
} from '@/lib/auth/auth-permissions';
import { cn } from '@/lib/utils';

interface AccessViewSelectorProps {
  accessViews: Member[];
  selectedAccessViewId: string | null;
  onSelectionChange: (accessViewId: string | null) => void;
}

export function AccessViewSelector({
  accessViews,
  selectedAccessViewId,
  onSelectionChange,
}: AccessViewSelectorProps) {
  // Filter only active access views (not disabled)
  const activeAccessViews = accessViews.filter(
    (member) =>
      ACCESS_VIEW_ROLES.has(member.role as MemberRolesEnum) &&
      member.role !== 'disabled',
  );

  // Get selected view details
  const selectedView = activeAccessViews.find(
    (view) => view.user.id === selectedAccessViewId,
  );

  const getDisplayLabel = () => {
    if (!selectedAccessViewId) {
      return 'Für mich selbst';
    }
    if (selectedView) {
      return selectedView.user.name;
    }
    return 'Auswählen';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' className='gap-2 border-none'>
          <User className='size-5' />
          <span className='hidden md:inline'>{getDisplayLabel()}</span>
          <ChevronDown className='size-4 opacity-50' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Beitrag einreichen als</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Access Views */}
        {activeAccessViews.map((accessView) => {
          const roleInfo = roles.views[accessView.role as MemberRolesEnum];
          const isSelected = selectedAccessViewId === accessView.user.id;

          return (
            <DropdownMenuItem
              key={accessView.id}
              onClick={() => onSelectionChange(accessView.user.id)}
              className={cn(
                'flex cursor-pointer items-center justify-between gap-6',
                isSelected && 'bg-accent',
              )}
            >
              <span className='truncate'>{accessView.user.name}</span>
              {roleInfo && (
                <Badge variant={roleInfo.variant} className='shrink-0'>
                  {roleInfo.title}
                </Badge>
              )}
            </DropdownMenuItem>
          );
        })}

        {/* Separator before "For myself" option */}
        {activeAccessViews.length > 0 && <DropdownMenuSeparator />}

        {/* Self option */}
        <DropdownMenuItem
          onClick={() => onSelectionChange(null)}
          className={cn(
            'cursor-pointer font-medium',
            !selectedAccessViewId && 'bg-accent',
          )}
        >
          Für mich selbst
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
