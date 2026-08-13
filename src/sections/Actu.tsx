import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Ajustez le chemin vers votre client Supabase si besoin
import styles from './Actu.module.css';

// 1. Types pour la structure des données Supabase
export interface ActuItem {
  key: string | number;
  value: string;
  image_url: string;
  created_at?: string;
}

export const Actu = () => {
  const [actu, setActu] = useState<ActuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActu = async () => {
      try {
        setLoading(true);

        // 2. Requête Supabase : Sélection de 4 éléments triés par date décroissante
        const { data, error } = await supabase
          .from('actu') // Remplace 'actus' par le nom exact de ta table Supabase
          .select('key, value, image_url, created_at')
          .order('created_at', { ascending: false })
          .limit(4);

        if (error) {
          throw error;
        }

        if (data) {
          setActu(data);
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

  // Gestion des états pendant le chargement
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
        {actu.map((item) => (
          <article key={item.key} className={styles.actuCard}>
            <div className={styles.imageWrapper}>
              <img
                src={item.image_url}
                alt={item.value}
                className={styles.image}
                loading="lazy"
              />
            </div>
            <div className={styles.content}>
              <h3 className={styles.cardTitle}>{item.value}</h3>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};