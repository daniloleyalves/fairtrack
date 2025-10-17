import { roles } from '@/lib/auth/auth-permissions';
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
import { Member, User } from '@server/db/db-types';
import { InviteMemberModal } from './invite-member-modal';
import { MemberTableActions } from './member-table-actions';
import { UserAvatar } from '@components/user-avatar';

export function MemberTable({
  members,
  ...props
}: React.ComponentProps<'div'> & {
  members: (Member & { user: User })[];
}) {
  return (
    <>
      <Card {...props}>
        <CardHeader className='px-4 sm:px-6'>
          <CardTitle>Teammitglieder verwalten</CardTitle>
        </CardHeader>
        <CardContent className='px-4 sm:px-6'>
          {members.length ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className='hidden md:table-cell'>
                      Email
                    </TableHead>
                    <TableHead>Rolle</TableHead>
                    <TableHead className='w-[72px]'></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className='flex items-center gap-4'>
                          <UserAvatar user={member.user} />
                          <span className='truncate'>{member.user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className='hidden md:table-cell'>
                        {member.user.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            roles.team[member.role]?.variant ?? 'outline'
                          }
                        >
                          {roles.team[member.role]?.title ?? 'unbekannt'}
                        </Badge>
                      </TableCell>
                      <TableCell className='w-[40px]'>
                        <MemberTableActions member={member} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className='mt-4 flex w-full justify-end pr-4 md:pr-0'>
                <InviteMemberModal />
              </div>
            </>
          ) : (
            <div>Keine Teammitglieder vorhanden</div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
