import { useMemo } from 'react';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

const specialOptions = [
  { value: 'all', label: 'All Books', detail: 'The complete library' },
  { value: 'favorites', label: 'Favorites', detail: 'Saved on this device' },
  { value: 'recent', label: 'Recently Viewed', detail: 'Up to 50 passages' },
];

export default function BookPicker({ books, value, onChange, favoriteCount, recentCount, disabled }) {
  const options = useMemo(() => {
    const specials = specialOptions.map((option) => ({
      ...option,
      count: option.value === 'favorites'
        ? favoriteCount
        : option.value === 'recent'
          ? recentCount
          : books.reduce((sum, book) => sum + book.quoteCount, 0),
    }));
    const bookOptions = books.map((book) => ({
      value: book.bookTitle,
      label: book.bookTitle,
      detail: book.author,
      count: book.quoteCount,
    }));
    return [...specials, ...bookOptions];
  }, [books, favoriteCount, recentCount]);

  return (
    <div className="book-picker">
      <label className="control-label" htmlFor="book-picker-select">Books</label>
      <div className="book-picker-field">
        <select
          id="book-picker-select"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          aria-label="Choose a book or saved view"
        >
          {options.map((option) => (
            <option key={`${option.value}-${option.detail}`} value={option.value}>
              {`${option.label} — ${option.detail} · ${option.count}`}
            </option>
          ))}
        </select>
        <KeyboardArrowDownRoundedIcon aria-hidden="true" className="book-picker-chevron" />
      </div>
    </div>
  );
}
