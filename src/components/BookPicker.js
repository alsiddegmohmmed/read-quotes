import { useEffect, useId, useMemo, useRef, useState } from 'react';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

const specialOptions = [
  { value: 'all', label: 'All Books', detail: 'The complete library' },
  { value: 'favorites', label: 'Favorites', detail: 'Saved on this device' },
  { value: 'recent', label: 'Recently Viewed', detail: 'Up to 50 passages' },
];

export default function BookPicker({ books, value, onChange, favoriteCount, recentCount, disabled }) {
  const inputRef = useRef(null);
  const rootRef = useRef(null);
  const optionRefs = useRef([]);
  const listboxId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const selected = useMemo(() => {
    const special = specialOptions.find((option) => option.value === value);
    if (special) return special;
    const book = books.find((item) => item.bookTitle === value);
    return book ? { label: book.bookTitle, detail: book.author } : specialOptions[0];
  }, [books, value]);

  const options = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
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

    if (!normalized) return [...specials, ...bookOptions];
    return [...specials, ...bookOptions].filter((option) =>
      `${option.label} ${option.detail}`.toLocaleLowerCase().includes(normalized),
    );
  }, [books, favoriteCount, query, recentCount]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  useEffect(() => setActiveIndex(0), [query]);

  useEffect(() => {
    if (!isOpen) return;
    optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, isOpen]);

  const openPicker = () => {
    if (disabled) return;
    setQuery('');
    setIsOpen(true);
  };

  const selectOption = (option) => {
    onChange(option.value);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isOpen) openPicker();
      else setActiveIndex((current) => Math.min(current + 1, options.length - 1));
    } else if (event.key === 'ArrowUp' && isOpen) {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === 'Enter' && isOpen && options[activeIndex]) {
      event.preventDefault();
      selectOption(options[activeIndex]);
    } else if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div
      className="book-picker"
      ref={rootRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
          setQuery('');
        }
      }}
    >
      <label className="control-label" htmlFor="book-picker-input">Library</label>
      <div className="book-picker-field">
        <input
          ref={inputRef}
          id="book-picker-input"
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-controls={isOpen ? listboxId : undefined}
          aria-expanded={isOpen}
          aria-activedescendant={isOpen && options[activeIndex] ? `${listboxId}-${activeIndex}` : undefined}
          autoComplete="off"
          disabled={disabled}
          value={isOpen ? query : selected.label}
          onFocus={openPicker}
          onClick={openPicker}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          aria-label="Choose or search books and saved views"
        />
        <KeyboardArrowDownRoundedIcon aria-hidden="true" className="book-picker-chevron" />
      </div>

      {isOpen && (
        <div className="book-picker-popover">
          <div className="book-picker-hint">Type to search titles or authors</div>
          <ul id={listboxId} role="listbox" aria-label="Library options">
            {options.length ? options.map((option, index) => (
              <li
                ref={(node) => { optionRefs.current[index] = node; }}
                id={`${listboxId}-${index}`}
                key={`${option.value}-${option.detail}`}
                role="option"
                aria-selected={option.value === value}
                data-active={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectOption(option)}
              >
                <span className="book-option-copy">
                  <span className="book-option-title">{option.label}</span>
                  <span className="book-option-author">{option.detail}</span>
                </span>
                <span
                  className="book-option-count"
                  aria-label={`${option.count} ${option.count === 1 ? "quote" : "quotes"}`}
                >
                  {option.count}
                </span>
              </li>
            )) : (
              <li className="book-picker-empty">No matching books</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
