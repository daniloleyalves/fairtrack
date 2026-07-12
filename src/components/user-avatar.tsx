import { getNameAbbreviation } from '@/lib/auth/auth-helpers';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { cn } from '@/lib/utils';
import { User } from '@/server/db/db-types';

export function UserAvatar({
  user,
  className,
  fallbackClassName,
}: {
  user: User;
  className?: string;
  fallbackClassName?: string;
}) {
  return (
    <Avatar className={cn('size-8 rounded-lg', className)}>
      <AvatarImage src={user.avatar ?? ''} alt={user.name} />
      <AvatarFallback className={fallbackClassName}>
        {getNameAbbreviation(user.name || '')}
      </AvatarFallback>
    </Avatar>
  );
}
