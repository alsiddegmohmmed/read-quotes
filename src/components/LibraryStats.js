export default function LibraryStats({ bookCount, quoteCount }) {
  return (
    <p className="library-stats" aria-label={`${bookCount} books and ${quoteCount} quotes`}>
      <span>{bookCount} books</span>
      <span aria-hidden="true">·</span>
      <span>{quoteCount} passages</span>
    </p>
  );
}
