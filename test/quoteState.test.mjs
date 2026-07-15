import assert from 'node:assert/strict';
import test from 'node:test';
import {
  matchesQuoteSearch,
  normalizeStoredIds,
  pickRandomQuote,
} from '../src/lib/quoteState.mjs';

const quotes = [
  { _id: '1', Quote: 'A quiet room', bookTitle: 'Stillness', Author: 'M. Reader' },
  { _id: '2', Quote: 'A second passage', bookTitle: 'Elsewhere', Author: 'N. Writer' },
];

test('pickRandomQuote avoids immediately repeating the current quote', () => {
  assert.equal(pickRandomQuote(quotes, '1', () => 0)._id, '2');
  assert.equal(pickRandomQuote([quotes[0]], '1', () => 0)._id, '1');
});

test('matchesQuoteSearch searches quote, book, and author case-insensitively', () => {
  assert.equal(matchesQuoteSearch(quotes[0], 'QUIET'), true);
  assert.equal(matchesQuoteSearch(quotes[0], 'stillness'), true);
  assert.equal(matchesQuoteSearch(quotes[0], 'reader'), true);
  assert.equal(matchesQuoteSearch(quotes[0], 'missing'), false);
});

test('normalizeStoredIds removes invalid values and duplicates while preserving order', () => {
  assert.deepEqual(normalizeStoredIds(['2', '1', '2', null, '', 3], 2), ['2', '1']);
  assert.deepEqual(normalizeStoredIds('not-an-array'), []);
});
