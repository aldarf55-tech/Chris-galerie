import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Ajustez le chemin vers votre client Supabase si besoin
import { Lightbox } from '../components/ui/Lightbox';
import styles from './Gallery.module.css';

// Interface représentant la structure d'une œuvre dans Supabase
interface Artwork {
  id: number | string;
  thematique: string;
  technique: string;
  price: number;
  image_url: string;
  category?: string; // Optionnel si vous gérez des catégories
}

export const Gallery = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('TOUT');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

 // Charger les œuvres depuis Supabase au chargement du composant
  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .order('id', { ascending: false }); // Optionnel : affiche les plus récentes en premier

      if (error) throw error;
      if (data) setArtworks(data);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des œuvres :", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Gestion des catégories basée sur 'thematique'
  
  const categories = ['TOUT', ...new Set(artworks.map(art => art.category || art.thematique))];

  const filteredArtworks = filter === 'TOUT' 
    ? artworks 
    : artworks.filter(art => (art.category || art.thematique) === filter);

  if (loading) {
    return (
      <section className={styles.gallerySection}>
        <h2 className={styles.title}>Mes Créations</h2>
        <p style={{ textAlign: 'center', padding: '40px' }}>Chargement des œuvres...</p>
      </section>
    );
  }

  return (
    <section className={styles.gallerySection}>
      <h1 className={styles.title}>GALERIE</h1>

      {/* Barre de filtres (affichée s'il y a des éléments) */}
      {artworks.length > 0 && (
        <div className={styles.filters}>
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`${styles.filterBtn} ${filter === cat ? styles.active : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Message si la galerie est vide */}
      {artworks.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
          Aucune œuvre pour le moment. Connectez-vous à l'espace admin pour en ajouter !
        </p>
      ) : (
        /* Grille d'images */
        <div className={styles.grid}>
          {filteredArtworks.map((art, index) => (
            <div 
              key={art.id} 
              className={styles.card}
              onClick={() => setActiveIndex(index)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.imageWrapper}>
                {/* On utilise art.image_url comme enregistré par le formulaire d'upload */}
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

      {/* Affichage conditionnel de la Lightbox */}
      {activeIndex !== null && (
        <Lightbox 
          artworksList={filteredArtworks}
          currentIndex={activeIndex}
          setCurrentIndex={setActiveIndex}
          onClose={() => setActiveIndex(null)} 
        />
      )}
    </section>
  );
};
