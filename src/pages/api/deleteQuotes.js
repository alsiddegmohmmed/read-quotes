import { connectToDatabase } from '../../../lib/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { startId, endId } = req.body;

    if (!startId || !endId) {
      return res.status(400).json({ message: 'startId and endId are required' });
    }

    try {
      const { db } = await connectToDatabase();
      const result = await db.collection('quotes').deleteMany({
        _id: {
          $gte: new ObjectId(startId),
          $lte: new ObjectId(endId)
        }
      });

      res.status(200).json({ message: `Deleted ${result.deletedCount} quotes` });
    } catch (error) {
      console.error('Error deleting quotes:', error);
      res.status(500).json({ message: 'Error deleting quotes', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
