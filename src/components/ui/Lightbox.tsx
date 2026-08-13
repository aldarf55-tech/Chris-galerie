import { useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import styles from './Lightbox.module.css';

// 1. Mettez à jour ou créez l'interface Artwork propre à la Lightbox
export interface Artwork {
  id: number | string;
  title: string;
  thematique: string;
  technique: string;
  originalPrice: number;
  copyPrice: number;
  category?: string;
  image_url: string;
  is_original_available: boolean;
  is_print_available: boolean;
}

// 2. Définition des propriétés attendues par la Lightbox
interface LightboxProps {
  artworksList: Artwork[];
  currentIndex: number;
  setCurrentIndex: Dispatch<SetStateAction<number | null>>;
  onClose: () => void;
}

export const Lightbox = ({ artworksList, currentIndex, setCurrentIndex, onClose }: LightboxProps) => {
  const artwork = artworksList[currentIndex];

  const handlePrevious = () => {
    const nextIndex = currentIndex === 0 ? artworksList.length - 1 : currentIndex - 1;
    setCurrentIndex(nextIndex);
  };

  const handleNext = () => {
    const nextIndex = currentIndex === artworksList.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(nextIndex);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, artworksList]);

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
        <img src={artwork.image_url} alt={artwork.thematique} className={styles.image} />
        <div className={styles.info}>
          <h3>{artwork.thematique}</h3>
          <h5>{artwork.technique}</h5>
        </div>
      </div>

      <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={(e) => { e.stopPropagation(); handleNext(); }}>
        &#10095;
      </button>
    </div>
  );
};