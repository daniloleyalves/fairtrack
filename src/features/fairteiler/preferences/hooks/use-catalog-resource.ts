'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const PERMISSION_ERROR =
  'Fehlgeschlagen. Möglicherweise bist du nicht befugt diese Aktion auszuführen';

interface CatalogMessages {
  removeSuccess?: string;
  updateSuccess?: string;
  suggestError?: string;
}

const DEFAULT_MESSAGES = {
  removeSuccess: 'Änderung erfolgreich gespeichert.',
  updateSuccess: 'Änderung erfolgreich gespeichert.',
  suggestError: 'Fehlgeschlagen, Vorschlag konnte nicht gespeichert werden.',
} satisfies Required<CatalogMessages>;

interface CatalogItemLike {
  id?: string;
  name: string;
}

interface QueryConfig {
  queryKey: readonly unknown[];
  staleTime?: number;
}

interface UseCatalogResourceConfig<
  TAll extends CatalogItemLike,
  TChosen extends CatalogItemLike,
> {
  allKey: QueryConfig;
  allQueryFn: () => Promise<TAll[] | null | undefined>;
  chosenKey: QueryConfig;
  chosenQueryFn: () => Promise<TChosen[] | null | undefined>;
  addToFairteiler: (item: TChosen) => Promise<TChosen>;
  removeFromFairteiler: (item: TChosen) => Promise<TChosen>;
  updatePlatformItem: (item: TChosen) => Promise<TChosen>;
  suggestPlatformItem: (item: TAll) => Promise<TAll>;
  messages?: CatalogMessages;
}

export function useCatalogResource<
  TAll extends CatalogItemLike,
  TChosen extends CatalogItemLike,
>({
  allKey,
  allQueryFn,
  chosenKey,
  chosenQueryFn,
  addToFairteiler,
  removeFromFairteiler,
  updatePlatformItem,
  suggestPlatformItem,
  messages,
}: UseCatalogResourceConfig<TAll, TChosen>) {
  const queryClient = useQueryClient();
  const m = { ...DEFAULT_MESSAGES, ...messages };

  const { data: allData } = useQuery({ ...allKey, queryFn: allQueryFn });
  const { data: chosenData } = useQuery({
    ...chosenKey,
    queryFn: chosenQueryFn,
  });

  const all = allData ?? [];
  const chosen = chosenData ?? [];

  const addMutation = useMutation({
    mutationFn: addToFairteiler,
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: chosenKey.queryKey });
      const previous =
        queryClient.getQueryData<TChosen[]>(chosenKey.queryKey) ?? [];
      queryClient.setQueryData<TChosen[]>(chosenKey.queryKey, [
        ...previous,
        item,
      ]);
      return { previous };
    },
    onError: (_err, _item, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(chosenKey.queryKey, context.previous);
      }
      toast.error(PERMISSION_ERROR);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: chosenKey.queryKey });
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeFromFairteiler,
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: chosenKey.queryKey });
      const previous =
        queryClient.getQueryData<TChosen[]>(chosenKey.queryKey) ?? [];
      queryClient.setQueryData<TChosen[]>(
        chosenKey.queryKey,
        previous.filter((c) => c.id !== item.id),
      );
      return { previous };
    },
    onError: (_err, _item, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(chosenKey.queryKey, context.previous);
      }
      toast.error(PERMISSION_ERROR);
    },
    onSuccess: () => {
      toast.success(m.removeSuccess);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: chosenKey.queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updatePlatformItem,
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: chosenKey.queryKey });
      const previousChosen =
        queryClient.getQueryData<TChosen[]>(chosenKey.queryKey) ?? [];
      queryClient.setQueryData<TChosen[]>(
        chosenKey.queryKey,
        previousChosen.map((c) => (c.id === item.id ? item : c)),
      );
      return { previousChosen };
    },
    onError: (_err, _item, context) => {
      if (context?.previousChosen !== undefined) {
        queryClient.setQueryData(chosenKey.queryKey, context.previousChosen);
      }
      toast.error(PERMISSION_ERROR);
    },
    onSuccess: () => {
      toast.success(m.updateSuccess);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: chosenKey.queryKey });
      void queryClient.invalidateQueries({ queryKey: allKey.queryKey });
    },
  });

  const suggestMutation = useMutation({
    mutationFn: suggestPlatformItem,
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: allKey.queryKey });
      const previous = queryClient.getQueryData<TAll[]>(allKey.queryKey) ?? [];
      queryClient.setQueryData<TAll[]>(allKey.queryKey, [...previous, item]);
      return { previous };
    },
    onError: (_err, _item, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(allKey.queryKey, context.previous);
      }
      toast.error(m.suggestError);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: allKey.queryKey });
    },
  });

  return {
    all,
    chosen,
    addToFairteiler: addMutation.mutate,
    removeFromFairteiler: removeMutation.mutate,
    updatePlatformItem: updateMutation.mutate,
    suggestPlatformItem: suggestMutation.mutate,
    flags: {
      isAdding: addMutation.isPending,
      isRemoving: removeMutation.isPending,
      isUpdating: updateMutation.isPending,
      isSuggesting: suggestMutation.isPending,
    },
  };
}
