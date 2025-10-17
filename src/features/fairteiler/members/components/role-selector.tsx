'use client';

import { roles } from '@/lib/auth/auth-permissions';
import { Button } from '@components/ui/button';
import { Label } from '@components/ui/label';
import { RadioGroup, RadioGroupItem } from '@components/ui/radio-group';
import * as React from 'react';
import { FormLabel } from '@ui/form';

interface RoleSelectorProps {
  value: string;
  type: 'team' | 'views';
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function RoleSelector({
  value,
  onValueChange,
  type = 'team',
  disabled = false,
}: RoleSelectorProps) {
  const [openRoleInfo, setOpenRoleInfo] = React.useState(false);
  const roleSet = roles[type];

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <FormLabel>{type === 'team' ? 'Rolle' : 'Zugang'} auswählen</FormLabel>
        <RadioGroup
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
        >
          {Object.entries(roleSet).map(([key, roleData]) => (
            <div key={key} className='flex items-center space-x-2'>
              <RadioGroupItem value={key} id={key} disabled={disabled} />
              <Label htmlFor={key} className='font-normal'>
                {roleData.title}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className='flex flex-col gap-4 rounded-lg bg-secondary p-4'>
        <div>
          <h3 className='text-sm leading-none font-medium'>
            {type === 'team' ? 'Rollen' : 'Zugangs'}beschreibungen
          </h3>
          <p className='mt-1 text-xs text-muted-foreground'>
            {type === 'team'
              ? 'Durch verschiedene Rollen erhält dein Team unterschiedliche Zugriffsrechte.'
              : 'Durch unterschiedliche Zugänge werden Ansichten mit begrenzten Rechten aktiviert.'}
          </p>
          <Button
            size='sm'
            type='button'
            variant='link'
            className='h-auto p-0 text-xs'
            onClick={() => setOpenRoleInfo((prev) => !prev)}
            disabled={disabled}
          >
            {openRoleInfo ? 'Weniger' : 'Mehr'} über einzelne{' '}
            {type === 'team' ? 'Rollen' : 'Zugänge'} erfahren
          </Button>
        </div>
        {openRoleInfo &&
          Object.values(roleSet).map((roleData) => (
            <div key={roleData.title}>
              <h4 className='text-sm leading-none font-medium'>
                {roleData.title}
              </h4>
              <p className='mt-1 text-xs text-muted-foreground'>
                {roleData.description}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}
