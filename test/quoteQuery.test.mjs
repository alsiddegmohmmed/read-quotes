import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MAX_SEARCH_LENGTH,
  escapeLikePattern,
  readSingleQueryValue,
  toPublicQuote,
} from '../lib/quoteQuery.mjs';

test('readSingleQueryValue trims and validates input', () => {
  assert.equal(readSingleQueryValue('  stillness  ', 'search', MAX_SEARCH_LENGTH), 'stillness');
  assert.equal(readSingleQueryValue('', 'search', MAX_SEARCH_LENGTH), undefined);
  assert.throws(() => readSingleQueryValue(['a', 'b'], 'search', MAX_SEARCH_LENGTH), /single string/);
  assert.throws(() => readSingleQueryValue('a\u0000b', 'search', MAX_SEARCH_LENGTH), /control/);
});
test('escapeLikePattern treats wildcard characters as text', () => {
  assert.equal(escapeLikePattern('100%_sure\\'), '100\\%\\_sure\\\\');
});

test('toPublicQuote preserves the existing API contract and Unicode', () => {
  assert.deepEqual(
    toPublicQuote({ id: 42, content: 'اقرأ — quietly', books: { title: 'كتاب', author: 'كاتب' } }),
    { _id: '42', Quote: 'اقرأ — quietly', bookTitle: 'كتاب', Author: 'كاتب' },
  );
});
