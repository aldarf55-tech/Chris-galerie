import { useCallback, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import styles from './Lightbox.module.css';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  setCurrentIndex: Dispatch<SetStateAction<number | null>>;
  onClose: () => void;
}

export const ImageLightbox = ({
  images,
  currentIndex,
  setCurrentIndex,
  onClose,
}: ImageLightboxProps) => {
  const image = images[currentIndex];

  const handlePrevious = useCallback(() => {
    setCurrentIndex(index => index === null ? index : (index === 0 ? images.length - 1 : index - 1));
  }, [images.length, setCurrentIndex]);

  const handleNext = useCallback(() => {
    setCurrentIndex(index => index === null ? index : (index === images.length - 1 ? 0 : index + 1));
  }, [images.length, setCurrentIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') handlePrevious();
      if (event.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrevious, onClose]);

  if (!image) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer la visionneuse">
        &times;
      </button>

      {images.length > 1 && (
        <button
          className={`${styles.navBtn} ${styles.prevBtn}`}
          onClick={event => {
            event.stopPropagation();
            handlePrevious();
          }}
          aria-label="Image précédente"
        >
          &#10094;
        </button>
      )}

      <div className={styles.content} onClick={event => event.stopPropagation()}>
        <img src={image} alt={`Visuel ${currentIndex + 1}`} className={styles.image} />
      </div>

      {images.length > 1 && (
        <button
          className={`${styles.navBtn} ${styles.nextBtn}`}
          onClick={event => {
            event.stopPropagation();
            handleNext();
          }}
          aria-label="Image suivante"
        >
          &#10095;
        </button>
      )}
    </div>
  );
};
