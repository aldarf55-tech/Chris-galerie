import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Ajustez le chemin vers votre client Supabase si besoin
import { Lightbox } from '../components/ui/Lightbox';
import styles from './Actu.module.css';

// Interface représentant la structure d'une œuvre dans Supabase
interface Artwork {
  id: number | string;
  thematique: string;
  technique: string;
  price: number;
  image_url: string;
  category?: string;
}

export const Actu = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [introText, setIntroText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Charger le texte et les 2 dernières œuvres depuis Supabase
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Exécution en parallèle de la récupération du texte et des œuvres
      await Promise.all([
        fetchIntroText(),
        fetchLatestArtworks()
      ]);

    } catch (error: any) {
      console.error("Erreur globale lors du chargement :", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Récupère le texte depuis la table actu (clé: 'actu_intro')
  const fetchIntroText = async () => {
    const { data, error } = await supabase
      .from('actu')
      .select('value')
      .eq('key', 'actu_intro')
      .maybeSingle();

    if (error) {
      console.error("Erreur lors de la récupération du texte ACTU :", error.message);
    } else if (data) {
      setIntroText(data.value);
    }
  };

  // Récupère les 2 dernières œuvres
  const fetchLatestArtworks = async () => {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('id', { ascending: false })
      .limit(2);

    if (error) throw error;
    if (data) setArtworks(data);
  };

  return (
    <section className={styles.actuSection}>
      <h2>ACTU</h2>
      
      {/* Affichage du texte dynamique de Supabase */}
      {introText && <p className={styles.introText}>{introText}</p>}

      {/* Affichage pendant le chargement */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px' }}>Chargement des 2 dernières œuvres...</p>
      ) : artworks.length === 0 ? (
        /* Message si aucune œuvre n'est présente */
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
          Aucune œuvre pour le moment.
        </p>
      ) : (
        /* Grille des 2 dernières images */
        <div className={styles.grid}>
          {artworks.map((art, index) => (
            <div 
              key={art.id} 
              className={styles.card}
              onClick={() => setActiveIndex(index)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.imageWrapper}>
                <img src={art.image_url} alt={art.thematique} className={styles.image} />
              </div>
              <div className={styles.overlay}>
                <h3>{art.thematique}</h3>
                <h5>{art.technique}</h5>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox pour agrandir les images au clic */}
      {activeIndex !== null && (
        <Lightbox 
          artworksList={artworks}
          currentIndex={activeIndex}
          setCurrentIndex={setActiveIndex}
          onClose={() => setActiveIndex(null)} 
        />
      )}
    </section>
  );
};