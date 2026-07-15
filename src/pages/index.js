import Head from 'next/head';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import BookPicker from '@/components/BookPicker';
import LibraryStats from '@/components/LibraryStats';
import QuoteActions from '@/components/QuoteActions';
import QuoteNavigation from '@/components/QuoteNavigation';
import QuoteReader from '@/components/QuoteReader';
import SearchInput from '@/components/SearchInput';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useFavorites, useRecentlyViewed } from '@/hooks/useLocalQuoteIds';
import { useQuoteHistory } from '@/hooks/useQuoteHistory';
import { matchesQuoteSearch, pickRandomQuote } from '@/lib/quoteState.mjs';

function EmptyState({ view, hasSearch }) {
  const content = hasSearch
    ? ['No passages found', 'Try another word, title, or author.']
    : view === 'favorites'
      ? ['No favorites yet', 'Save a passage with the bookmark button and it will appear here.']
      : view === 'recent'
        ? ['No recent passages', 'Passages you read will quietly collect here.']
        : ['No passages here', 'This part of the library is currently empty.'];

  return (
    <div className="empty-state" role="status">
      <h2>{content[0]}</h2>
      <p>{content[1]}</p>
    </div>
  );
}

export default function Home() {
  const shareCardRef = useRef(null);
  const requestRef = useRef(0);
  const [books, setBooks] = useState([]);
  const [allQuotes, setAllQuotes] = useState([]);
  const [serverQuotes, setServerQuotes] = useState([]);
  const [view, setView] = useState('all');
  const [search, setSearch] = useState('');
  const [currentId, setCurrentId] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const debouncedSearch = useDebouncedValue(search);
  const { favoriteIds, isFavorite, toggleFavorite } = useFavorites();
  const { recentIds, rememberQuote } = useRecentlyViewed();
  const history = useQuoteHistory();

  const quoteCount = useMemo(
    () => books.reduce((sum, book) => sum + Number(book.quoteCount || 0), 0),
    [books],
  );

  const quoteById = useMemo(
    () => new Map(allQuotes.map((quote) => [quote._id, quote])),
    [allQuotes],
  );

  const displayedQuotes = useMemo(() => {
    if (view === 'favorites') {
      return favoriteIds.map((id) => quoteById.get(id)).filter(Boolean).filter((quote) => matchesQuoteSearch(quote, debouncedSearch));
    }
    if (view === 'recent') {
      return recentIds.map((id) => quoteById.get(id)).filter(Boolean).filter((quote) => matchesQuoteSearch(quote, debouncedSearch));
    }
    return serverQuotes;
  }, [debouncedSearch, favoriteIds, quoteById, recentIds, serverQuotes, view]);

  const currentQuote = displayedQuotes.find((quote) => quote._id === currentId);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/quotes?type=books')
      .then(async (response) => {
        if (!response.ok) throw new Error((await response.json()).message || 'Failed to load library');
        return response.json();
      })
      .then((data) => { if (!cancelled) setBooks(data); })
      .catch(() => { if (!cancelled) setError('The library details could not be loaded.'); });
    return () => { cancelled = true; };
  }, [retryKey]);

  useEffect(() => {
    const requestId = ++requestRef.current;
    const isLocalView = view === 'favorites' || view === 'recent';
    const controller = new AbortController();

    if (isLocalView) {
      setLoading(true);
      setError('');
      const quotesRequest = allQuotes.length
        ? Promise.resolve(allQuotes)
        : fetch('/api/quotes', { signal: controller.signal }).then(async (response) => {
          if (!response.ok) throw new Error((await response.json()).message || 'Failed to load passages');
          return response.json();
        });

      quotesRequest
        .then((quotes) => {
          if (requestId !== requestRef.current) return;
          if (!allQuotes.length) setAllQuotes(quotes);
          const map = new Map(quotes.map((quote) => [quote._id, quote]));
          const ids = view === 'favorites' ? favoriteIds : recentIds;
          const localQuotes = ids
            .map((id) => map.get(id))
            .filter(Boolean)
            .filter((quote) => matchesQuoteSearch(quote, debouncedSearch));
          const next = pickRandomQuote(localQuotes, currentId);
          setCurrentId(next?._id);
          history.resetHistory(next?._id);
        })
        .catch((fetchError) => {
          if (fetchError.name !== 'AbortError' && requestId === requestRef.current) {
            setCurrentId(undefined);
            setError('The passages could not be loaded.');
          }
        })
        .finally(() => {
          if (requestId === requestRef.current) setLoading(false);
        });

      return () => controller.abort();
    }

    const params = new URLSearchParams();
    if (view !== 'all') params.set('book', view);
    if (debouncedSearch) params.set('search', debouncedSearch);
    const url = `/api/quotes${params.size ? `?${params}` : ''}`;

    setLoading(true);
    setError('');
    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error((await response.json()).message || 'Failed to load passages');
        return response.json();
      })
      .then((data) => {
        if (requestId !== requestRef.current) return;
        setServerQuotes(data);
        if (view === 'all' && !debouncedSearch) setAllQuotes(data);
        const next = pickRandomQuote(data, currentId);
        setCurrentId(next?._id);
        history.resetHistory(next?._id);
      })
      .catch((fetchError) => {
        if (fetchError.name !== 'AbortError' && requestId === requestRef.current) {
          setServerQuotes([]);
          setCurrentId(undefined);
          setError('The passages could not be loaded.');
        }
      })
      .finally(() => {
        if (requestId === requestRef.current) setLoading(false);
      });

    return () => controller.abort();
    // The selected saved IDs are read when a local view is entered; subsequent
    // changes are handled by the missing-current guard below without resetting history.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, retryKey, view]);

  useEffect(() => {
    if (currentQuote?._id) rememberQuote(currentQuote._id);
  }, [currentQuote?._id, rememberQuote]);

  useEffect(() => {
    if (loading || currentQuote) return;
    const next = displayedQuotes[0];
    if (next?._id !== currentId) {
      setCurrentId(next?._id);
      history.resetHistory(next?._id);
    }
  }, [currentId, currentQuote, displayedQuotes, history, loading]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 2400);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const showRandom = useCallback(() => {
    const next = pickRandomQuote(displayedQuotes, currentId);
    if (!next) return;
    setCurrentId(next._id);
    history.visitQuote(next._id);
  }, [currentId, displayedQuotes, history]);

  const showPrevious = useCallback(() => {
    const previousId = history.goPrevious();
    if (previousId) setCurrentId(previousId);
  }, [history]);

  const showNext = useCallback(() => {
    const forwardId = history.goForward();
    if (forwardId) setCurrentId(forwardId);
    else showRandom();
  }, [history, showRandom]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || loading || !currentQuote) return;
      if (event.key === 'ArrowLeft' && history.canGoPrevious) {
        event.preventDefault();
        showPrevious();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        showNext();
      } else if (event.key.toLocaleLowerCase() === 'r') {
        event.preventDefault();
        showRandom();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuote, history.canGoPrevious, loading, showNext, showPrevious, showRandom]);

  const quoteText = currentQuote
    ? `“${currentQuote.Quote}” — ${currentQuote.bookTitle}, ${currentQuote.Author}`
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(quoteText);
      setCopied(true);
      setNotice('Copied to clipboard');
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setNotice('Could not copy this passage');
    }
  };

  const handleShare = async () => {
    if (!navigator.share) {
      try {
        await navigator.clipboard.writeText(`${quoteText}\n${window.location.href}`);
        setNotice('Copied for sharing');
      } catch {
        setNotice('Sharing is not available in this browser');
      }
      return;
    }
    try {
      await navigator.share({ title: currentQuote.bookTitle, text: quoteText, url: window.location.href });
    } catch (shareError) {
      if (shareError.name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(`${quoteText}\n${window.location.href}`);
        setNotice('Copied for sharing');
      } catch {
        setNotice('Could not share this passage');
      }
    }
  };

  const handleShareImage = async () => {
    if (!shareCardRef.current || !currentQuote) return;
    try {
      await document.fonts?.ready;
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: '#11110f',
        scale: 2,
        useCORS: true,
      });
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Image generation failed');
      const file = new File([blob], 'passage.png', { type: 'image/png' });
      const saveImage = () => {
        const link = document.createElement('a');
        link.download = 'passage.png';
        link.href = URL.createObjectURL(blob);
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        setNotice('Image saved');
      };

      const isMobilePlatform = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const canShareFile = isMobilePlatform && navigator.canShare?.({ files: [file] });
      if (canShareFile) {
        try {
          await navigator.share({ files: [file], title: currentQuote.bookTitle });
        } catch (shareError) {
          if (shareError.name === 'AbortError') return;
          saveImage();
        }
      } else {
        saveImage();
      }
    } catch (shareError) {
      if (shareError.name !== 'AbortError') setNotice('Could not create the image');
    }
  };

  const handleViewChange = (nextView) => {
    setView(nextView);
    setSearch('');
  };

  const handleFavorite = () => {
    if (!currentQuote) return;
    const wasFavorite = isFavorite(currentQuote._id);
    toggleFavorite(currentQuote._id);
    setNotice(wasFavorite ? 'Removed from favorites' : 'Saved to favorites');
  };

  const retry = () => setRetryKey((key) => key + 1);
  const controlsDisabled = loading || Boolean(error) || !currentQuote;

  return (
    <>
      <Head>
        <title>Reading Room</title>
        <meta name="description" content="A private library of meaningful passages." />
      </Head>
      <main className="reading-room">
        <header className="site-header">
          <div>
            <p className="eyebrow">Private library</p>
            <h1>Reading Room</h1>
          </div>
          <LibraryStats bookCount={books.length} quoteCount={quoteCount} />
        </header>

        <section className="library-controls" aria-label="Library filters">
          <BookPicker
            books={books}
            value={view}
            onChange={handleViewChange}
            favoriteCount={favoriteIds.length}
            recentCount={recentIds.filter((id) => quoteById.has(id)).length}
            disabled={!books.length}
          />
          <SearchInput
            value={search}
            onChange={setSearch}
            disabled={!books.length}
            busy={search !== debouncedSearch || (loading && Boolean(search))}
            scope={view === 'all'
              ? 'Searching the complete library'
              : view === 'favorites'
                ? 'Searching saved favorites'
                : view === 'recent'
                  ? 'Searching recent passages'
                  : `Searching within ${view}`}
          />
        </section>

        <section className="reading-area" aria-label="Current passage">
          {error ? (
            <div className="error-state" role="alert">
              <h2>The room is quiet for a moment.</h2>
              <p>{error}</p>
              <button type="button" onClick={retry}>Try again</button>
            </div>
          ) : currentQuote ? (
            <>
              <QuoteReader quote={currentQuote} loading={loading} />
              <div className="reader-controls">
                <QuoteActions
                  favorite={isFavorite(currentQuote._id)}
                  copied={copied}
                  onFavorite={handleFavorite}
                  onCopy={handleCopy}
                  onShare={handleShare}
                  onShareImage={handleShareImage}
                  disabled={controlsDisabled}
                />
                <QuoteNavigation
                  onPrevious={showPrevious}
                  onNext={showNext}
                  onRandom={showRandom}
                  canPrevious={history.canGoPrevious}
                  disabled={controlsDisabled}
                />
              </div>
            </>
          ) : loading ? (
            <div className="initial-loading" role="status">
              <span className="loading-mark" aria-hidden="true" />
              <p>Opening the library…</p>
            </div>
          ) : (
            <EmptyState view={view} hasSearch={Boolean(debouncedSearch)} />
          )}
        </section>

        <footer className="site-footer">
          <span>← Previous</span>
          <span>R Random</span>
          <span>Next →</span>
        </footer>

        <div className="share-image-card" ref={shareCardRef} aria-hidden="true">
          {currentQuote && (
            <>
              <p>{currentQuote.Quote}</p>
              <div>
                <strong>{currentQuote.bookTitle}</strong>
                <span>{currentQuote.Author}</span>
              </div>
            </>
          )}
        </div>

        <div className="notice" role="status" aria-live="polite" data-visible={Boolean(notice)}>
          {notice}
        </div>
      </main>
    </>
  );
}
