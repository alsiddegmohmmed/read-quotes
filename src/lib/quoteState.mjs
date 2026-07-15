export function pickRandomQuote(quotes, currentId, random = Math.random) {
  if (!quotes.length) return undefined;
  const choices = quotes.length > 1
    ? quotes.filter((quote) => quote._id !== currentId)
    : quotes;
  return choices[Math.floor(random() * choices.length)];
}

export function matchesQuoteSearch(quote, search) {
  const normalized = search.trim().toLocaleLowerCase();
  if (!normalized) return true;
  return `${quote.Quote} ${quote.bookTitle} ${quote.Author}`
    .toLocaleLowerCase()
    .includes(normalized);
}

export function normalizeStoredIds(value, maxItems = Infinity) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id) => typeof id === 'string' && id))].slice(0, maxItems);
}
