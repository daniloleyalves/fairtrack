import Link from 'next/link';
import { DropdownMenuItem } from '@components/ui/dropdown-menu';
import { Route } from '@/lib/config/routes';

export function UserNavButton({
  route,
  children,
}: {
  route: Route;
  children: React.ReactNode;
}) {
  const { icon: IconComponent } = route;
  return (
    <DropdownMenuItem asChild>
      <Link href={route.url}>
        {IconComponent && <IconComponent className='mr-2 size-4' />}
        {children}
      </Link>
    </DropdownMenuItem>
  );
}
