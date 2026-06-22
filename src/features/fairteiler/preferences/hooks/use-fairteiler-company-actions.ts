'use client';

import { useMemo } from 'react';
import { invokeAction } from '@/lib/hooks/use-form-action';
import {
  addFairteilerCompanyAction,
  removeFairteilerCompanyAction,
  suggestNewCompanyAction,
  updateCompanyAction,
} from '@/server/fairteiler/actions';
import { CompanyWithOrigin, GenericItem } from '@/server/db/db-types';

export function useFairteilerCompanyActions() {
  return useMemo(
    () => ({
      addToFairteiler: (item: GenericItem) =>
        invokeAction(addFairteilerCompanyAction, item),
      removeFromFairteiler: (item: GenericItem) =>
        invokeAction(removeFairteilerCompanyAction, item),
      updatePlatformItem: (item: GenericItem) =>
        invokeAction(updateCompanyAction, item),
      suggestPlatformItem: async (item: CompanyWithOrigin) => {
        await invokeAction(suggestNewCompanyAction, item);
        return item;
      },
    }),
    [],
  );
}
