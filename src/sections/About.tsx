import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import styles from './About.module.css';

export const About = () => {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAproposData = async () => {
      try {
        const { data, error } = await supabase
          .from('apropos')
          .select('value, image_url')
          .eq('key', 'apropos_intro')
          .maybeSingle();

        if (error) {
          console.error("Erreur de chargement de la section À Propos :", error.message);
        } else if (data) {
          setContent(data.value || '');
          setImageUrl(data.image_url || '');
        }
      } catch (err) {
        console.error("Erreur imprévue :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAproposData();
  }, []);

  if (loading) {
    return (
      <section className={styles.section}>
        <h2>À PROPOS</h2>
        <p>Chargement...</p>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <h2>À PROPOS</h2>

      {/* Affichage de l'image si elle existe */}
      {imageUrl && (
        <div className={styles.imageContainer}>
          <img 
            src={imageUrl} 
            alt="À propos" 
            className={styles.aboutImage} 
          />
        </div>
      )}

      {/* Affichage du texte si présent */}
      {content && (
        <p className={styles.content}>
          {content}
        </p>
      )}
    </section>
  );
};