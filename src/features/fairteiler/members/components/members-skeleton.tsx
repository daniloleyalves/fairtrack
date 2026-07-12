import { CardSkeleton } from '@/components/ui/skeleton';

export function MembersSkeleton() {
  return (
    <>
      <CardSkeleton height='h-[250px] w-full' />
      <CardSkeleton height='h-[250px] w-full' />
    </>
  );
}
