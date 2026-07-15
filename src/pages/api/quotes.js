import { getSupabase } from '../../../lib/supabase.js';
import {
  MAX_BOOK_LENGTH,
  MAX_SEARCH_LENGTH,
  escapeLikePattern,
  readSingleQueryValue,
  toPublicQuote,
} from '../../../lib/quoteQuery.mjs';

const PAGE_SIZE = 1000;
const QUOTE_SELECT = 'id, content, books!inner(title, author)';

async function fetchQuoteRows(configureQuery) {
  const rows = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    let query = getSupabase()
      .from('quotes')
      .select(QUOTE_SELECT)
      .order('id')
      .range(from, from + PAGE_SIZE - 1);

    query = configureQuery(query);
    const { data, error } = await query;
    if (error) throw error;

    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
  }

  return rows;
}
async function findBookByTitle(title) {
  if (!title) return undefined;

  const { data, error } = await getSupabase()
    .from('books')
    .select('id')
    .eq('title', title)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function findMatchingBookIds(searchPattern) {
  const supabase = getSupabase();
  const [{ data: titleMatches, error: titleError }, { data: authorMatches, error: authorError }] =
    await Promise.all([
      supabase.from('books').select('id').ilike('title', searchPattern),
      supabase.from('books').select('id').ilike('author', searchPattern),
    ]);

  if (titleError) throw titleError;
  if (authorError) throw authorError;
  return [...new Set([...titleMatches, ...authorMatches].map(({ id }) => id))];
}

async function getQuotes(bookTitle, search) {
  const selectedBook = await findBookByTitle(bookTitle);
  if (bookTitle && !selectedBook) return [];

  if (!search) {
    const rows = await fetchQuoteRows((query) =>
      selectedBook ? query.eq('book_id', selectedBook.id) : query,
    );
    return rows.map(toPublicQuote);
  }

  const pattern = `%${escapeLikePattern(search)}%`;
  const matchingBookIds = await findMatchingBookIds(pattern);
  const allowedBookIds = selectedBook
    ? matchingBookIds.filter((id) => id === selectedBook.id)
    : matchingBookIds;

  const contentRows = await fetchQuoteRows((query) => {
    const filtered = query.ilike('content', pattern);
    return selectedBook ? filtered.eq('book_id', selectedBook.id) : filtered;
  });

  const bookRows = allowedBookIds.length
    ? await fetchQuoteRows((query) => query.in('book_id', allowedBookIds))
    : [];

  const deduplicated = new Map();
  [...contentRows, ...bookRows].forEach((row) => deduplicated.set(String(row.id), row));

  return [...deduplicated.values()]
    .sort((a, b) => Number(a.id) - Number(b.id))
    .map(toPublicQuote);
}

async function getBooks() {
  const { data, error } = await getSupabase()
    .from('books')
    .select('id, title, author, quotes(count)')
    .order('title');

  if (error) throw error;
  return data.map(({ id, title, author, quotes }) => ({
    id: String(id),
    bookTitle: title,
    author,
    quoteCount: quotes?.[0]?.count ?? 0,
  }));
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const type = readSingleQueryValue(req.query.type, 'type', 20);
    const book = readSingleQueryValue(req.query.book, 'book', MAX_BOOK_LENGTH);
    const search = readSingleQueryValue(req.query.search, 'search', MAX_SEARCH_LENGTH);

    if (type && type !== 'books') {
      return res.status(400).json({ message: 'type must be "books" when provided' });
    }
    if (type === 'books') {
      if (book || search) {
        return res.status(400).json({ message: 'type=books cannot be combined with book or search' });
      }
      return res.status(200).json(await getBooks());
    }

    return res.status(200).json(await getQuotes(book, search));
  } catch (error) {
    if (error instanceof TypeError || error instanceof RangeError) {
      return res.status(400).json({ message: error.message });
    }

    console.error('Failed to load quotes:', error);
    return res.status(500).json({ message: 'Failed to load quotes' });
  }
}
