import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';

function ActionButton({ label, onClick, children, active, disabled }) {
  return (
    <button
      type="button"
      className="quote-action"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active === undefined ? undefined : active}
      title={label}
    >
      {children}
      <span className="action-label">{label}</span>
    </button>
  );
}
export default function QuoteActions({ favorite, copied, onFavorite, onCopy, onShare, onShareImage, disabled }) {
  return (
    <div className="quote-actions" aria-label="Quote actions">
      <ActionButton label={favorite ? 'Remove favorite' : 'Save favorite'} onClick={onFavorite} active={favorite} disabled={disabled}>
        {favorite ? <BookmarkRoundedIcon aria-hidden="true" /> : <BookmarkBorderRoundedIcon aria-hidden="true" />}
      </ActionButton>
      <ActionButton label={copied ? 'Copied' : 'Copy quote'} onClick={onCopy} disabled={disabled}>
        {copied ? <CheckRoundedIcon aria-hidden="true" /> : <ContentCopyRoundedIcon aria-hidden="true" />}
      </ActionButton>
      <ActionButton label="Share quote" onClick={onShare} disabled={disabled}>
        <ShareRoundedIcon aria-hidden="true" />
      </ActionButton>
      <ActionButton label="Share as image" onClick={onShareImage} disabled={disabled}>
        <ImageRoundedIcon aria-hidden="true" />
      </ActionButton>
    </div>
  );
}
