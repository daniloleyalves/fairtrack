'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@ui/dialog';
import { cn } from '@/lib/utils';
import { invokeAction } from '@/lib/hooks/use-form-action';
import { dismissAnnouncementAction } from '@/server/announcement/actions';
import type { AnnouncementAudience } from '@/server/announcement/dal';
import {
  Announcement,
  getVisibleAnnouncements,
} from '@/server/announcement/queries';
import { announcementKeys } from '@/server/announcement/query-keys';

export function AnnouncementBanner({
  audience,
  className,
}: {
  audience: AnnouncementAudience;
  className?: string;
}) {
  const queryClient = useQueryClient();
  const { queryKey, staleTime } = announcementKeys.visible(audience);
  const { data } = useQuery({
    queryKey,
    staleTime,
    queryFn: () => getVisibleAnnouncements(audience),
  });

  const dismiss = useMutation({
    mutationFn: (id: string) => invokeAction(dismissAnnouncementAction, { id }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData<Announcement[]>(queryKey, (current) =>
        current?.filter((item) => item.id !== id),
      );
    },
    onError: (error) => {
      toast.error(error.message);
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  const announcement = data?.[0];
  if (!announcement) return null;

  return (
    <div
      role='status'
      className={cn(
        'flex items-start gap-3 rounded-lg border bg-card p-4 text-card-foreground shadow-md',
        className,
      )}
    >
      <Sparkles className='mt-0.5 size-5 shrink-0 text-primary' />
      <div className='flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4'>
        <div className='min-w-0 flex-1'>
          <p className='font-semibold'>{announcement.title}</p>
          <p className='text-sm text-muted-foreground'>
            {announcement.message}
          </p>
        </div>
        <AnnouncementAction
          announcement={announcement}
          onAcknowledge={() => dismiss.mutate(announcement.id)}
        />
      </div>
      <Button
        variant='ghost'
        size='icon'
        className='-mt-1.5 -mr-1.5 size-8 shrink-0'
        aria-label='Hinweis ausblenden'
        onClick={() => dismiss.mutate(announcement.id)}
      >
        <X />
      </Button>
    </div>
  );
}

function AnnouncementAction({
  announcement,
  onAcknowledge,
}: {
  announcement: Announcement;
  onAcknowledge: () => void;
}) {
  if (announcement.highlights.length === 0) {
    return announcement.linkUrl ? (
      <AnnouncementLink announcement={announcement} size='sm' />
    ) : null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size='sm' className='self-start sm:self-auto'>
          Mehr erfahren
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton className='max-h-[85dvh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{announcement.title}</DialogTitle>
          <DialogDescription>{announcement.message}</DialogDescription>
        </DialogHeader>
        <ul className='flex list-disc flex-col gap-2 pl-5 text-sm'>
          {announcement.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
        <DialogFooter>
          {announcement.linkUrl && (
            <AnnouncementLink announcement={announcement} variant='outline' />
          )}
          <DialogClose asChild>
            <Button onClick={onAcknowledge}>Verstanden</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AnnouncementLink({
  announcement,
  ...buttonProps
}: {
  announcement: Announcement;
} & Pick<React.ComponentProps<typeof Button>, 'size' | 'variant'>) {
  if (!announcement.linkUrl) return null;

  return (
    <Button asChild className='self-start sm:self-auto' {...buttonProps}>
      <Link href={announcement.linkUrl}>
        {announcement.linkLabel ?? 'Ansehen'}
      </Link>
    </Button>
  );
}
