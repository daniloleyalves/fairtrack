import { Breadcrumbs } from '@components/layout/breadcrumbs';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { Separator } from '@components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@components/ui/sidebar';
// The onboarding gate lives in `src/proxy.ts` so this layout stays static
// and can prerender its PPR shell (sidebar, header) without awaiting the
// session.
export default function FairteilerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className='flex flex-col overflow-hidden'>
        <LayoutHeader />
        <LayoutMain>{children}</LayoutMain>
      </SidebarInset>
    </SidebarProvider>
  );
}

function LayoutHeader() {
  return (
    <header className='flex h-16 shrink-0 items-center gap-2 border-b bg-sidebar transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
      <div className='flex items-center gap-2 px-4'>
        <SidebarTrigger className='-ml-1' />
        <Separator
          orientation='vertical'
          className='mr-2 data-[orientation=vertical]:h-4'
        />
        <Breadcrumbs />
      </div>
    </header>
  );
}

function LayoutMain({ children }: { children: React.ReactNode }) {
  return (
    <main className='relative flex-1 overflow-y-auto'>
      {/* Decorative background element */}
      <span className='absolute top-0 h-80 w-full rounded-b-lg bg-primary shadow-md'></span>
      {/* Content container */}
      <div className='relative z-10 mx-auto max-w-7xl'>{children}</div>
    </main>
  );
}
