'use client';

import { createContext, useContext, useMemo, useState } from 'react';

interface ContributionTableContextType {
  isFastView: boolean;
  editingIndex: number | null;
  setEditingIndex: (index: number | null) => void;
  showAllColumns: boolean;
}

const ContributionTableContext =
  createContext<ContributionTableContextType | null>(null);

export function ContributionTableProvider({
  children,
  isFastView,
}: {
  children: React.ReactNode;
  isFastView: boolean;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const value = useMemo<ContributionTableContextType>(
    () => ({
      isFastView,
      editingIndex,
      setEditingIndex,
      showAllColumns: isFastView || editingIndex !== null,
    }),
    [isFastView, editingIndex],
  );
  return (
    <ContributionTableContext.Provider value={value}>
      {children}
    </ContributionTableContext.Provider>
  );
}

export function useContributionTable() {
  const context = useContext(ContributionTableContext);
  if (!context) {
    throw new Error(
      'useContributionTable must be used within a ContributionTableProvider',
    );
  }
  return context;
}

export default ContributionTableContext;
