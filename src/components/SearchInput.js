import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

export default function SearchInput({ value, onChange, disabled, scope, busy }) {
  return (
    <div className="search-control">
      <label className="control-label" htmlFor="quote-search">Search passages</label>
      <div className="search-field" aria-busy={busy}>
        <SearchRoundedIcon aria-hidden="true" />
        <input
          id="quote-search"
          type="search"
          value={value}
          maxLength={160}
          disabled={disabled}
          placeholder="Words, title, or author"
          onChange={(event) => onChange(event.target.value)}
          aria-describedby="search-description"
        />
        {value && (
          <button type="button" className="clear-search" onClick={() => onChange('')} aria-label="Clear search">
            <CloseRoundedIcon aria-hidden="true" />
          </button>
        )}
      </div>
      <span id="search-description" className="sr-only">Searches quote text, book titles, and authors.</span>
      <span className="search-scope" aria-live="polite">{busy ? 'Searching…' : scope}</span>
    </div>
  );
}
