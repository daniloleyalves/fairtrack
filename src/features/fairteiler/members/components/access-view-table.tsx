'use client';

import { MemberRolesEnum, roles } from '@/lib/auth/auth-permissions';
import { Badge } from '@components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import { Member } from '@server/db/db-types';
import { AccessViewTableActions } from './access-view-table-actions';
import { AddAccessViewModal } from './add-access-view-modal';

export function AccessViewTable({
  accessViews,
  ...props
}: React.ComponentProps<'div'> & {
  accessViews: Member[];
}) {
  const getMemberBadge = (member: Member) => {
    return {
      variant: roles.views[member.role]
        ? roles.views[member.role].variant
        : 'outline',
      title: roles.views[member.role]
        ? roles.views[member.role].title
        : 'Deaktiviert',
    };
  };

  const sortedAccessViews = [...accessViews].sort((a, b) => {
    const roleA = a.role as MemberRolesEnum;
    const roleB = b.role as MemberRolesEnum;

    // Disabled members go to the end
    if (
      roleA === MemberRolesEnum.DISABLED &&
      roleB !== MemberRolesEnum.DISABLED
    ) {
      return 1; // a (disabled) comes after b (not disabled)
    }
    if (
      roleA !== MemberRolesEnum.DISABLED &&
      roleB === MemberRolesEnum.DISABLED
    ) {
      return -1; // a (not disabled) comes before b (disabled)
    }

    // For members of the same "disabled status", sort alphabetically by name
    return a.user.name.localeCompare(b.user.name);
  });

  return (
    <Card {...props}>
      <CardHeader className='px-4 sm:px-6'>
        <CardTitle>Zugangsprofile verwalten</CardTitle>
      </CardHeader>
      <CardContent className='px-4 sm:px-6'>
        {sortedAccessViews.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className='hidden md:table-cell'>Email</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead className='w-[72px]'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAccessViews.map((member) => (
                <TableRow key={member.user.name}>
                  <TableCell>{member.user.name}</TableCell>
                  <TableCell className='hidden md:table-cell'>
                    {member.user.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getMemberBadge(member).variant}
                      className={
                        member.role === 'disabled' ? 'text-destructive' : ''
                      }
                    >
                      {getMemberBadge(member).title}
                    </Badge>
                  </TableCell>
                  <TableCell className='w-[40px]'>
                    {member.role !== 'disabled' && (
                      <AccessViewTableActions member={member} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div>Keine Zugangsprofile vorhanden</div>
        )}
        <div className='mt-4 flex w-full justify-end pr-4 md:pr-0'>
          <AddAccessViewModal />
        </div>
      </CardContent>
    </Card>
  );
}
