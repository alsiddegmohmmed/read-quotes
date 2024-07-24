import { connectToDatabase } from '../../../lib/mongodb.js';
import { importQuotesFromCSV } from '../../../lib/uploadQuotes.js';

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();

    if (req.method === 'GET') {
      // Fetch quotes from the 'quotes' collection within 'books' database
      const quotes = await db.collection('quotes').find({}).toArray();
      
      // Check if quotes array is empty
      if (quotes.length === 0) {
        return res.status(404).json({ message: 'No quotes found' });
      }

      res.status(200).json(quotes);
    } else if (req.method === 'POST') {
      try {
        const message = await importQuotesFromCSV();
        res.status(200).json({ message });
      } catch (error) {
        res.status(500).json({ message: error });
      }
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
