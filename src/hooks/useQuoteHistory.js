import { useCallback, useMemo, useState } from 'react';

export function useQuoteHistory() {
  const [state, setState] = useState({ items: [], index: -1 });

  const resetHistory = useCallback((quoteId) => {
    setState(quoteId
      ? { items: [quoteId], index: 0 }
      : { items: [], index: -1 });
  }, []);

  const visitQuote = useCallback((quoteId) => {
    if (!quoteId) return;
    setState((current) => {
      if (current.items[current.index] === quoteId) return current;
      const items = [...current.items.slice(0, current.index + 1), quoteId];
      return { items, index: items.length - 1 };
    });
  }, []);

  const goPrevious = useCallback(() => {
    if (state.index <= 0) return undefined;
    const index = state.index - 1;
    const quoteId = state.items[index];
    setState((current) => ({ ...current, index }));
    return quoteId;
  }, [state.index, state.items]);

  const goForward = useCallback(() => {
    if (state.index >= state.items.length - 1) return undefined;
    const index = state.index + 1;
    const quoteId = state.items[index];
    setState((current) => ({ ...current, index }));
    return quoteId;
  }, [state.index, state.items]);

  return useMemo(() => ({
    canGoPrevious: state.index > 0,
    canGoForward: state.index >= 0 && state.index < state.items.length - 1,
    goForward,
    goPrevious,
    resetHistory,
    visitQuote,
  }), [goForward, goPrevious, resetHistory, state.index, state.items.length, visitQuote]);
}
