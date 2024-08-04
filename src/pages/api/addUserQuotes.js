import { connectToDatabase } from '../../../lib/mongodb.js';

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();

    if (req.method === 'POST') {
      const { userId, quote, bookTitle,  Author } = req.body;

      if (!userId || !quote || !bookTitle) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const userQuote = {
        userId,
        quote,
        bookTitle,
        Author
      };

      await db.collection('userQuotes').insertOne(userQuote);

      res.status(200).json({ message: 'Quote added successfully' });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
