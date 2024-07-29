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
        if (row.Quote && row.Quote.trim()) {
          quotes.push({ Quote: row.Quote.trim(), bookTitle: row.bookTitle || 'test' });
        } else {
          console.error('Invalid quote:', row); // Log invalid quotes
        }
      })
      .on('end', async () => {
        try {
          const { db } = await connectToDatabase();
          if (quotes.length > 0) {
            await db.collection('quotes').insertMany(quotes);
            resolve('Quotes uploaded successfully');
          } else {
            reject('No valid quotes to upload');
          }
        } catch (error) {
          console.error('Error inserting quotes:', error); // Log insertion errors
          reject('Failed to upload quotes: ' + error.message);
        }
      })
      .on('error', (error) => {
        console.error('Error reading the CSV file:', error); // Log CSV reading errors
        reject('Error reading the CSV file: ' + error.message);
      });
  });
}
