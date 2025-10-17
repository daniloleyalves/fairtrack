'use client';

import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@components/ui/breadcrumb';
import { getCurrentPageTitle } from '@/lib/utils';

export function Breadcrumbs() {
  const pathname = usePathname();

  const pageTitle = getCurrentPageTitle(pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>Fairteiler</BreadcrumbItem>
        {pageTitle && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem className='capitalize'>{pageTitle}</BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
