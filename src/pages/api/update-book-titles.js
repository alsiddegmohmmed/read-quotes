import { connectToDatabase } from '../../../lib/mongodb.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('quotes');

    // Get the documents from index 60 to 100 
    const documents = await collection.find().skip(1261).limit(52).toArray(); //831 -892

    // Update each document
    const updatePromises = documents.map((doc) => 
      collection.updateOne(
        { _id: doc._id },
        { $set: { bookTitle: "You Are a Badass: How to Stop Doubting Your Greatness and Start Living an Awesome Life by Jen Sincero" } }
      )
    );

    await Promise.all(updatePromises);

    res.status(200).json({ message: 'Successfully updated book titles for documents from 60 to 100' });
  } catch (error) {
    console.error('Error updating book titles:', error);
    res.status(500).json({ message: 'Error updating book titles', error: error.message });
  }
}