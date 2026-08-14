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
  created_at?: string;
}

export const Actu = () => {
  const [actuList, setActuList] = useState<ActuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActu = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('actu')
          .select('key, value, actuimage1, actuimage2, actuimage3, actuimage4, created_at')
          .order('created_at', { ascending: false })
          .limit(4);

        if (error) {
          throw error;
        }

        if (data) {
          setActuList(data as ActuItem[]);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des actualités :', err);
        setError('Impossible de charger les actualités.');
      } finally {
        setLoading(false);
      }
    };

    fetchActu();
  }, []);

  if (loading) {
    return (
      <section className={styles.actuSection}>
        <p className={styles.statusMessage}>Chargement des actualités...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.actuSection}>
        <p className={styles.errorMessage}>{error}</p>
      </section>
    );
  }

  return (
    <section className={styles.actuSection}>
      <h2 className={styles.title}>Dernières Actualités</h2>

      <div className={styles.actuGrid}>
        {actuList.map((item, index) => {
          // Extraction et filtrage des images valides
          const images = [
            item.actuimage1,
            item.actuimage2,
            item.actuimage3,
            item.actuimage4,
          ].filter((img): img is string => Boolean(img && img.trim() !== ''));

          // Clé unique pour le composant React
          const cardKey = item.key || item.created_at || `actu-${index}`;

          return (
            <article key={cardKey} className={styles.actuCard}>
              <div className={styles.content}>
                <p className={styles.cardText}>{item.value}</p>
              </div>

              {images.length > 0 && (
                <div
                  className={styles.imagesContainer}
                  data-count={images.length}
                >
                  {images.map((imgUrl, imgIndex) => (
                    <div key={`${cardKey}-img-${imgIndex}`} className={styles.imageWrapper}>
                      <img
                        src={imgUrl}
                        alt={`Actualité ${item.key ?? index + 1} - Visuel ${imgIndex + 1}`}
                        className={styles.image}
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};