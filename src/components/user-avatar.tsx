import { getNameAbbreviation } from '@/lib/auth/auth-helpers';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { cn } from '@/lib/utils';
import { User } from '@/server/db/db-types';

export function UserAvatar({
  user,
  className,
}: {
  user: User;
  className?: string;
}) {
  return (
    <Avatar
      className={cn('size-8 rounded-lg bg-primary text-white', className)}
    >
      <AvatarImage src={user.avatar ?? ''} alt={user.name} />
      <AvatarFallback>{getNameAbbreviation(user.name || '')}</AvatarFallback>
    </Avatar>
  );
}
