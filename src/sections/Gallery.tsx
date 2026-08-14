import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Lightbox } from '../components/ui/Lightbox';
import styles from './Gallery.module.css';

interface Artwork {
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

export const Gallery = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('TOUT');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      if (data) setArtworks(data);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des œuvres :", error.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['TOUT', ...new Set(artworks.map(art => art.category || art.thematique || art.title))];

  // FILTRAGE COMBINÉ : Catégorie + Recherche textuelle
  const filteredArtworks = artworks.filter(art => {
    const categoryMatch = filter === 'TOUT' || (art.category || art.thematique || art.title) === filter;
    
    const query = searchQuery.toLowerCase().trim();
    const searchMatch = query === '' || 
      art.title.toLowerCase().includes(query) ||
      art.thematique.toLowerCase().includes(query) ||
      art.technique.toLowerCase().includes(query) ||
      (art.category && art.category.toLowerCase().includes(query));

    return categoryMatch && searchMatch;
  });

  if (loading) {
    return (
      <section className={styles.gallerySection}>
        <h2 className={styles.title}>Mes Créations</h2>
        <p className={styles.statusMessage}>Chargement des œuvres...</p>
      </section>
    );
  }

  const getUniqueArtworksByTitle = (list: typeof artworks) => {
  const seenTitles = new Set<string>();

  return list.filter((art) => {
    // 1. Récupération de la valeur brute
    const rawTitle = art.title || art.thematique || art.id;

    // 2. Conversion explicite en string + passage en minuscules + nettoyage des espaces
    const normalizedTitle = String(rawTitle).toLowerCase().trim();

    if (seenTitles.has(normalizedTitle)) {
      return false; // Titre déjà présent
    }

    seenTitles.add(normalizedTitle);
    return true;
  });
};

const uniqueFilteredArtworks = getUniqueArtworksByTitle(filteredArtworks);

  return (
    <section className={styles.gallerySection}>
      <h1 className={styles.title}>GALERIE</h1>

      {artworks.length > 0 && (
        <>
          {/* BARRE DE RECHERCHE */}
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Rechercher un personnage, une technique ou un thème..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* BARRE DE FILTRES */}
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
        </>
      )}

      {/* RÉSULTATS DE LA GALERIE */}
{artworks.length === 0 ? (
  <p className={styles.statusMessage}>
    Aucune œuvre pour le moment. Connectez-vous à l'espace admin pour en ajouter !
  </p>
) : uniqueFilteredArtworks.length === 0 ? (
  <p className={styles.statusMessage}>
    Aucun dessin ne correspond à votre recherche "{searchQuery}".
  </p>
) : (
  <div className={styles.grid}>
    {uniqueFilteredArtworks.map((art, index) => (
      <div 
        key={art.id} 
        className={styles.card}
        onClick={() => setActiveIndex(index)}
      >
        <div className={styles.imageWrapper}>
          <img 
            src={art.image_url} 
            alt={`${art.title ? `${art.title} - ` : ''}${art.thematique} (${art.technique}) - Christogr@phik`} 
            className={styles.image} 
          />
        </div>
        <div className={styles.overlay}>
          <h3>{art.thematique}</h3>
          <h4>{art.title}</h4>
          <h5>{art.technique}</h5>
        </div>
      </div>
    ))}
  </div>
)}

      {/* LIGHTBOX */}
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