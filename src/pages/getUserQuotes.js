import { connectToDatabase } from '../../../lib/mongodb.js';

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();

    if (req.method === 'GET') {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ message: 'Missing userId' });
      }

      const userQuotes = await db.collection('userQuotes').find({ userId }).toArray();

      res.status(200).json(userQuotes);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
