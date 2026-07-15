export const MAX_SEARCH_LENGTH = 160;
export const MAX_BOOK_LENGTH = 320;

export function readSingleQueryValue(value, name, maxLength) {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') {
    throw new TypeError(`${name} must be a single string`);
  }

  const normalized = value.trim();
  if (!normalized) return undefined;
  if (normalized.length > maxLength) {
    throw new RangeError(`${name} must be ${maxLength} characters or fewer`);
  }
  if (/\p{Cc}/u.test(normalized)) {
    throw new TypeError(`${name} contains unsupported control characters`);
  }

  return normalized;
}
export function escapeLikePattern(value) {
  return value.replace(/[\\%_]/g, '\\$&');
}

export function toPublicQuote({ id, content, books }) {
  return {
    _id: String(id),
    Quote: content,
    bookTitle: books.title,
    Author: books.author,
  };
}
