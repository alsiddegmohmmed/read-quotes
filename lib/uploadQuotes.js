import { connectToDatabase } from './mongodb';
import fs from 'fs';
import csvParser from 'csv-parser';
import path from 'path';

export async function importQuotesFromCSV() {
  const filePath = path.join(process.cwd(), 'yourfile_quoted3.csv');
  const quotes = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        quotes.push({ Quote: row.Quote });
      })
      .on('end', async () => {
        try {
          const { db } = await connectToDatabase();
          await db.collection('quotes').insertMany(quotes);
          resolve('Quotes uploaded successfully');
        } catch (error) {
          reject('Failed to upload quotes: ' + error.message);
        }
      });
  });
}
