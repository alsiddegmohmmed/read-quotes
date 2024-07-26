import { connectToDatabase } from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { bookTitle } = req.body;

  if (!bookTitle) {
    return res.status(400).json({ message: 'bookTitle is required' });
  }

  try {
    const { db } = await connectToDatabase();

    const result = await db.collection('quotes').updateMany(
      {}, // Filter to update all documents
      { $set: { bookTitle } } // Update operation to set the bookTitle field
    );

    res.status(200).json({
      message: `${result.modifiedCount} documents updated with bookTitle: ${bookTitle}`
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
