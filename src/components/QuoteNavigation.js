import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';

export default function QuoteNavigation({ onPrevious, onNext, onRandom, canPrevious, disabled }) {
  return (
    <nav className="quote-navigation" aria-label="Quote navigation">
      <button type="button" onClick={onPrevious} disabled={disabled || !canPrevious} aria-label="Previous quote">
        <ArrowBackRoundedIcon aria-hidden="true" />
        <span>Previous</span>
      </button>
      <button type="button" onClick={onRandom} disabled={disabled} aria-label="Show a random quote">
        <ShuffleRoundedIcon aria-hidden="true" />
        <span>Random</span>
      </button>
      <button type="button" onClick={onNext} disabled={disabled} aria-label="Next quote">
        <span>Next</span>
        <ArrowForwardRoundedIcon aria-hidden="true" />
      </button>
    </nav>
  );
}
