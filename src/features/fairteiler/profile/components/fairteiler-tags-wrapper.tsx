'use client';

import { toast } from 'sonner';
import { FairteilerTags } from './fairteiler-tags';
import { FAIRTEILER_TAGS_KEY } from '@/lib/config/api-routes';
import useSWRMutation from 'swr/mutation';
import { Tag } from '@/server/db/db-types';
import {
  addTagToFairteilerAction,
  removeTagFromFairteilerAction,
} from '@/server/actions';
import useSWRSuspense from '@/lib/services/swr';

interface FairteilerTagsWrapperProps {
  className?: string;
}

export function FairteilerTagsWrapper({
  className,
}: FairteilerTagsWrapperProps) {
  const { data: tags } = useSWRSuspense<Tag[]>(FAIRTEILER_TAGS_KEY);

  // --- Mutations  ---
  const { trigger: addTagTrigger } = useSWRMutation(
    FAIRTEILER_TAGS_KEY,
    (_key, { arg }: { arg: Tag }) => addTagToFairteilerAction(arg),
    {
      populateCache: (addedTag: Tag, currentTags: Tag[] = []) => {
        if (!currentTags.length) {
          return [addedTag];
        }
        return [...currentTags, addedTag];
      },
      revalidate: false,
      rollbackOnError: true,
      onError: () =>
        toast.error(
          'Fehlgeschlagen. Möglicherweise bist du nicht befug, diese Aktion auszuführen',
        ),
    },
  );

  const { trigger: removeTagTrigger } = useSWRMutation(
    FAIRTEILER_TAGS_KEY,
    (_key, { arg }: { arg: Tag }) => removeTagFromFairteilerAction(arg),
    {
      populateCache: (removedTag: Tag, currentTags: Tag[] = []) => {
        return (currentTags || []).filter((c) => c.id !== removedTag.id);
      },
      revalidate: false,
      rollbackOnError: true,
      onError: () =>
        toast.error(
          'Fehlgeschlagen. Möglicherweise bist du nicht befug, diese Aktion auszuführen',
        ),
    },
  );

  return (
    <FairteilerTags
      tags={tags}
      onAddTag={(newTag) =>
        addTagTrigger(newTag, {
          optimisticData: (currentTags: Tag[] = []) => {
            return [...currentTags, newTag];
          },
        })
      }
      onRemoveTag={(tagToRemove) =>
        removeTagTrigger(tagToRemove, {
          optimisticData: (currentTags: Tag[] = []) => {
            return currentTags.filter((c) => c.id !== tagToRemove.id);
          },
        })
      }
      className={className}
    />
  );
}
