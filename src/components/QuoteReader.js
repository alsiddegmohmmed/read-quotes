export default function QuoteReader({ quote, loading }) {
  const paragraphs = quote?.Quote.split(/\n\s*\n/).filter(Boolean) ?? [];

  return (
    <article
      className="quote-reader"
      data-long={quote?.Quote.length > 500 || undefined}
      aria-busy={loading}
      aria-live="polite"
    >
      {loading && <p className="reader-status">Finding a passage…</p>}
      {quote && (
        <>
          <blockquote>
            {paragraphs.map((paragraph, index) => <p key={`${quote._id}-${index}`}>{paragraph}</p>)}
          </blockquote>
          <footer className="quote-attribution">
            <cite>{quote.bookTitle}</cite>
            <span>{quote.Author}</span>
          </footer>
        </>
      )}
    </article>
  );
}
