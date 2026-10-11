import styles from './ArtworkLikeButton.module.css';

interface ArtworkLikeButtonProps {
  count: number | null;
  liked: boolean;
  disabled?: boolean;
  className?: string;
  onToggle: () => void;
}

export const ArtworkLikeButton = ({
  count,
  liked,
  disabled = false,
  className,
  onToggle,
}: ArtworkLikeButtonProps) => (
  <button
    type="button"
    className={`${styles.likeButton} ${className ?? ''}`}
    onClick={event => {
      event.stopPropagation();
      onToggle();
    }}
    disabled={disabled || count === null}
    aria-pressed={liked}
    aria-label={count === null
      ? 'Chargement du nombre de j’aime'
      : `${liked ? 'Retirer mon j’aime' : 'J’aime cette œuvre'}, ${count} j’aime`}
    title={liked ? 'Retirer mon j’aime' : 'J’aime cette œuvre'}
  >
    <span aria-hidden="true">{liked ? '♥' : '♡'}</span>
    <span>{count ?? '…'}</span>
  </button>
);
