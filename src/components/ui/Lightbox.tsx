import { useCallback, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Artwork } from '../../types';
import styles from './Lightbox.module.css';

interface LightboxProps {
  artworksList: Artwork[];
  currentIndex: number;
  setCurrentIndex: Dispatch<SetStateAction<number | null>>;
  onClose: () => void;
}

export const Lightbox = ({ artworksList, currentIndex, setCurrentIndex, onClose }: LightboxProps) => {
  const artwork = artworksList[currentIndex];

  const handlePrevious = useCallback(() => {
    const nextIndex = currentIndex === 0 ? artworksList.length - 1 : currentIndex - 1;
    setCurrentIndex(nextIndex);
  }, [currentIndex, artworksList, setCurrentIndex]);

  const handleNext = useCallback(() => {
    const nextIndex = currentIndex === artworksList.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(nextIndex);
  }, [currentIndex, artworksList, setCurrentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrevious, onClose]);

  if (!artwork) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer">
        &times;
      </button>

      <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={(e) => { e.stopPropagation(); handlePrevious(); }}>
        &#10094;
      </button>
      
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
          <h4>{artwork.title} {artwork.format}</h4>
        <img src={artwork.image_url} alt={artwork.thematique} className={styles.image} />
        <div className={styles.info}>
          <h3>{artwork.thematique}</h3>
          <h5>{artwork.technique}</h5>
          <p>
            {artwork.is_print_available
              ? <><strong>COPIE</strong> 250g/m² — <strong>{artwork.copyPrice} €</strong></>
              : <><strong>COPIE</strong> 250g/m² <strong>VENDUE</strong></>}
          </p>
          <p>
            {artwork.is_original_available 
              ? <><strong>ORIGINAL</strong> — <strong>{artwork.originalPrice} €</strong></> 
              : <><strong>ORIGINAL</strong> <strong>VENDU</strong></>}
          </p>
        </div>
      </div>

      <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={(e) => { e.stopPropagation(); handleNext(); }}>
        &#10095;
      </button>
    </div>
  );
};