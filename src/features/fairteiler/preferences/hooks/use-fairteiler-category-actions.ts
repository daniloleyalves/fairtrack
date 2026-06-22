'use client';

import { useMemo } from 'react';
import { invokeAction } from '@/lib/hooks/use-form-action';
import {
  addFairteilerCategoryAction,
  removeFairteilerCategoryAction,
  suggestNewCategoryAction,
  updateCategoryAction,
} from '@/server/fairteiler/actions';
import { GenericItem } from '@/server/db/db-types';

export function useFairteilerCategoryActions() {
  return useMemo(
    () => ({
      addToFairteiler: (item: GenericItem) =>
        invokeAction(addFairteilerCategoryAction, item),
      removeFromFairteiler: (item: GenericItem) =>
        invokeAction(removeFairteilerCategoryAction, item),
      updatePlatformItem: (item: GenericItem) =>
        invokeAction(updateCategoryAction, item),
      suggestPlatformItem: (item: GenericItem) =>
        invokeAction(suggestNewCategoryAction, item),
    }),
    [],
  );
}
