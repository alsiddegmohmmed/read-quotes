// pages/api/fetchQuotes.js
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

export default function handler(req, res) {
  const filePath = path.resolve('.', 'quotes.csv');
  const file = fs.readFileSync(filePath, 'utf8');

  Papa.parse(file, {
    header: true,
    complete: (results) => {
      res.status(200).json(results.data);
    },
  });
}
