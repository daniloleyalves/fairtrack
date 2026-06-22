'use client';

import { useMemo } from 'react';
import { invokeAction } from '@/lib/hooks/use-form-action';
import {
  addFairteilerOriginAction,
  removeFairteilerOriginAction,
  suggestNewOriginAction,
  updateOriginAction,
} from '@/server/fairteiler/actions';
import { GenericItem } from '@/server/db/db-types';

export function useFairteilerOriginActions() {
  return useMemo(
    () => ({
      addToFairteiler: (item: GenericItem) =>
        invokeAction(addFairteilerOriginAction, item),
      removeFromFairteiler: (item: GenericItem) =>
        invokeAction(removeFairteilerOriginAction, item),
      updatePlatformItem: (item: GenericItem) =>
        invokeAction(updateOriginAction, item),
      suggestPlatformItem: (item: GenericItem) =>
        invokeAction(suggestNewOriginAction, item),
    }),
    [],
  );
}
