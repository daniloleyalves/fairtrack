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

interface QueryDefinition<T> {
  queryKey: readonly unknown[];
  queryFn: () => Promise<T[] | null | undefined>;
  staleTime?: number;
}

interface UseCatalogResourceConfig<
  TAll extends CatalogItemLike,
  TChosen extends CatalogItemLike,
> {
  allQuery: QueryDefinition<TAll>;
  chosenQuery: QueryDefinition<TChosen>;
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
  allQuery,
  chosenQuery,
  addToFairteiler,
  removeFromFairteiler,
  updatePlatformItem,
  suggestPlatformItem,
  messages,
}: UseCatalogResourceConfig<TAll, TChosen>) {
  const queryClient = useQueryClient();
  const m = { ...DEFAULT_MESSAGES, ...messages };
  const allKey = allQuery.queryKey;
  const chosenKey = chosenQuery.queryKey;

  const { data: allData } = useQuery(allQuery);
  const { data: chosenData } = useQuery(chosenQuery);

  const all = allData ?? [];
  const chosen = chosenData ?? [];

  const addMutation = useMutation({
    mutationFn: addToFairteiler,
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: chosenKey });
      const previous = queryClient.getQueryData<TChosen[]>(chosenKey) ?? [];
      queryClient.setQueryData<TChosen[]>(chosenKey, [...previous, item]);
      return { previous };
    },
    onError: (_err, _item, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(chosenKey, context.previous);
      }
      toast.error(PERMISSION_ERROR);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: chosenKey });
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeFromFairteiler,
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: chosenKey });
      const previous = queryClient.getQueryData<TChosen[]>(chosenKey) ?? [];
      queryClient.setQueryData<TChosen[]>(
        chosenKey,
        previous.filter((c) => c.id !== item.id),
      );
      return { previous };
    },
    onError: (_err, _item, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(chosenKey, context.previous);
      }
      toast.error(PERMISSION_ERROR);
    },
    onSuccess: () => {
      toast.success(m.removeSuccess);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: chosenKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updatePlatformItem,
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: chosenKey });
      const previousChosen =
        queryClient.getQueryData<TChosen[]>(chosenKey) ?? [];
      queryClient.setQueryData<TChosen[]>(
        chosenKey,
        previousChosen.map((c) => (c.id === item.id ? item : c)),
      );
      return { previousChosen };
    },
    onError: (_err, _item, context) => {
      if (context?.previousChosen !== undefined) {
        queryClient.setQueryData(chosenKey, context.previousChosen);
      }
      toast.error(PERMISSION_ERROR);
    },
    onSuccess: () => {
      toast.success(m.updateSuccess);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: chosenKey });
      void queryClient.invalidateQueries({ queryKey: allKey });
    },
  });

  const suggestMutation = useMutation({
    mutationFn: suggestPlatformItem,
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: allKey });
      const previous = queryClient.getQueryData<TAll[]>(allKey) ?? [];
      queryClient.setQueryData<TAll[]>(allKey, [...previous, item]);
      return { previous };
    },
    onError: (_err, _item, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(allKey, context.previous);
      }
      toast.error(m.suggestError);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: allKey });
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
