import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import styles from './Actu.module.css';

export interface ActuItem {
  key?: string;
  value: string;
  actuimage1?: string;
  actuimage2?: string;
  actuimage3?: string;
  actuimage4?: string;
  updated_at?: string;
}

export const Actu = () => {
  const [actu, setActu] = useState<ActuItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActu = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('actu')
          .select('key, value, actuimage1, actuimage2, actuimage3, actuimage4, updated_at')
          .eq('key', 'actu_intro')
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (data) {
          setActu(data as ActuItem);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération de l\'actualité :', err);
        setError('Impossible de charger l\'actualité.');
      } finally {
        setLoading(false);
      }
    };

    fetchActu();
  }, []);

  if (loading) {
    return (
      <section className={styles.actuSection}>
        <p className={styles.statusMessage}>Chargement de l'actualité...</p>
      </section>
    );
  }

  if (error || !actu) {
    return (
      <section className={styles.actuSection}>
        <p className={styles.errorMessage}>{error ?? 'Aucune actualité à afficher.'}</p>
      </section>
    );
  }

  // Filtrage des images non vides
  const images = [
    actu.actuimage1,
    actu.actuimage2,
    actu.actuimage3,
    actu.actuimage4,
  ].filter((img): img is string => Boolean(img && img.trim() !== ''));

  return (
    <section className={styles.actuSection}>
      <h2 className={styles.title}>Dernière Actualité</h2>

      <article className={styles.actuCard}>
        <div className={styles.content}>
          <p className={styles.cardText}>{actu.value}</p>
        </div>

        {images.length > 0 && (
          <div className={styles.imagesContainer} data-count={images.length}>
            {images.map((imgUrl, imgIndex) => (
              <div key={`actu-img-${imgIndex}`} className={styles.imageWrapper}>
                <img
                  src={imgUrl}
                  alt={`Visuel ${imgIndex + 1}`}
                  className={styles.image}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
};