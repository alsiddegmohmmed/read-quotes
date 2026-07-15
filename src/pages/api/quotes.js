import { getSupabase } from '../../../lib/supabase.js';

const PAGE_SIZE = 1000;

async function getAllQuotes(bookTitle) {
  const supabase = getSupabase();
  const quotes = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    let query = supabase
      .from('quotes')
      .select('id, content, books!inner(title, author)')
      .order('id')
      .range(from, from + PAGE_SIZE - 1);

    if (bookTitle) {
      query = query.eq('books.title', bookTitle);
    }

    const { data, error } = await query;
    if (error) throw error;

    quotes.push(...data);
    if (data.length < PAGE_SIZE) break;
  }

  return quotes.map(({ id, content, books }) => ({
    _id: String(id),
    Quote: content,
    bookTitle: books.title,
    Author: books.author,
  }));
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { type, book } = req.query;

      if (type === 'books') {
        const { data, error } = await getSupabase()
          .from('books')
          .select('title')
          .order('title');

        if (error) throw error;
        return res.status(200).json(data.map(({ title }) => ({ bookTitle: title })));
      }

      const quotes = await getAllQuotes(typeof book === 'string' ? book : undefined);

      if (quotes.length === 0) {
        return res.status(404).json({ message: 'No quotes found' });
      }

      return res.status(200).json(quotes);
    } else {
      res.setHeader('Allow', 'GET');
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Failed to load quotes:', error);
    res.status(500).json({ message: 'Failed to load quotes' });
  }
}
