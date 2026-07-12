'use client';

import { toast } from 'sonner';
import { FairteilerTags } from './fairteiler-tags';
import { Tag } from '@/server/db/db-types';
import {
  addTagToFairteilerAction,
  removeTagFromFairteilerAction,
} from '@/server/fairteiler/actions';
import { invokeAction } from '@/lib/hooks/use-form-action';
import { fairteilerKeys } from '@/server/fairteiler/query-keys';
import { getTags } from '@/server/fairteiler/queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FairteilerTagsSkeleton } from './fairteiler-tags-skeleton';

interface FairteilerTagsWrapperProps {
  className?: string;
}

const PERMISSION_ERROR_MESSAGE =
  'Fehlgeschlagen. Möglicherweise bist du nicht befug, diese Aktion auszuführen';

export function FairteilerTagsWrapper({
  className,
}: FairteilerTagsWrapperProps) {
  const queryClient = useQueryClient();
  const tagsKey = fairteilerKeys.tags().queryKey;

  const {
    data: tagsData,
    isPending,
    error,
  } = useQuery({
    ...fairteilerKeys.tags(),
    queryFn: getTags,
  });

  if (error) throw error;

  const tags = tagsData ?? [];

  const addTag = useMutation({
    mutationFn: (tag: Tag) => invokeAction(addTagToFairteilerAction, tag),
    onMutate: async (tag) => {
      await queryClient.cancelQueries({ queryKey: tagsKey });
      const previous = queryClient.getQueryData<Tag[]>(tagsKey) ?? [];
      queryClient.setQueryData<Tag[]>(tagsKey, [...previous, tag]);
      return { previous };
    },
    onError: (_err, _tag, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(tagsKey, context.previous);
      }
      toast.error(PERMISSION_ERROR_MESSAGE);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: tagsKey });
    },
  });

  const removeTag = useMutation({
    mutationFn: (tag: Tag) => invokeAction(removeTagFromFairteilerAction, tag),
    onMutate: async (tag) => {
      await queryClient.cancelQueries({ queryKey: tagsKey });
      const previous = queryClient.getQueryData<Tag[]>(tagsKey) ?? [];
      queryClient.setQueryData<Tag[]>(
        tagsKey,
        previous.filter((c) => c.id !== tag.id),
      );
      return { previous };
    },
    onError: (_err, _tag, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(tagsKey, context.previous);
      }
      toast.error(PERMISSION_ERROR_MESSAGE);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: tagsKey });
    },
  });

  if (isPending) {
    return <FairteilerTagsSkeleton className={className} />;
  }

  return (
    <FairteilerTags
      tags={tags}
      onAddTag={(newTag) => addTag.mutate(newTag)}
      onRemoveTag={(tagToRemove) => removeTag.mutate(tagToRemove)}
      className={className}
    />
  );
}
