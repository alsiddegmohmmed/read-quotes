import { useCallback, useEffect, useState } from 'react';
import { normalizeStoredIds } from '@/lib/quoteState.mjs';

export function useLocalQuoteIds(storageKey, maxItems = Infinity) {
  const [ids, setIds] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(storageKey) || '[]');
      setIds(normalizeStoredIds(stored, maxItems));
    } catch {
      setIds([]);
    } finally {
      setIsReady(true);
    }
  }, [maxItems, storageKey]);

  useEffect(() => {
    if (!isReady) return;
    window.localStorage.setItem(storageKey, JSON.stringify(ids));
  }, [ids, isReady, storageKey]);

  return { ids, setIds, isReady };
}

export function useFavorites() {
  const { ids, setIds, isReady } = useLocalQuoteIds('read-quotes:favorites');

  const toggleFavorite = useCallback((quoteId) => {
    setIds((current) =>
      current.includes(quoteId)
        ? current.filter((id) => id !== quoteId)
        : [quoteId, ...current],
    );
  }, [setIds]);

  const isFavorite = useCallback((quoteId) => ids.includes(quoteId), [ids]);

  return { favoriteIds: ids, isFavorite, toggleFavorite, isReady };
}

export function useRecentlyViewed() {
  const { ids, setIds, isReady } = useLocalQuoteIds('read-quotes:recently-viewed', 50);

  const rememberQuote = useCallback((quoteId) => {
    if (!quoteId) return;
    setIds((current) => [quoteId, ...current.filter((id) => id !== quoteId)].slice(0, 50));
  }, [setIds]);

  return { recentIds: ids, rememberQuote, isReady };
}
