import { useEffect, useState } from 'react';
import { storage } from '@/lib/services/local-storage-service';

const STORAGE_KEY_PREFIX = 'fairtrack:contribution-submit-as';

/**
 * Hook to manage the selected access view ID for contribution submission.
 * Persists selection to localStorage per fairteiler.
 */
export function useSubmissionSelection(fairteilerId: string) {
  const storageKey = `${STORAGE_KEY_PREFIX}:${fairteilerId}`;

  const [selectedAccessViewId, setSelectedAccessViewId] = useState<
    string | null
  >(() => {
    // Initialize from localStorage
    return storage.getItem(storageKey);
  });

  useEffect(() => {
    // Sync to localStorage whenever selection changes
    if (selectedAccessViewId) {
      storage.setItem(storageKey, selectedAccessViewId);
    } else {
      // Remove from storage if set to null (submitting as self)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(storageKey);
      }
    }
  }, [selectedAccessViewId, storageKey]);

  return [selectedAccessViewId, setSelectedAccessViewId] as const;
}
