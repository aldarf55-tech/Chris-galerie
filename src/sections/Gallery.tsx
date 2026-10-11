import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Lightbox } from '../components/ui/Lightbox';
import { ArtworkLikeButton } from '../components/ui/ArtworkLikeButton';
import { artworkLikesService, type ArtworkLikeState } from '../services/artworkLikes.service';
import type { Artwork } from '../types';
import { getErrorMessage } from '../utils/error';
import styles from './Gallery.module.css';


export const Gallery = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('TOUT');
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [likes, setLikes] = useState<Map<string, ArtworkLikeState>>(new Map());
  const [pendingLikes, setPendingLikes] = useState<Set<string>>(new Set());
  const [likesLoading, setLikesLoading] = useState(true);
  const [likesError, setLikesError] = useState<string | null>(null);

  useEffect(() => {
    fetchArtworks();
  }, []);

  useEffect(() => {
    if (artworks.length === 0) {
      setLikesLoading(false);
      return;
    }

    let cancelled = false;

    const fetchLikes = async () => {
      try {
        const id = artworkLikesService.getVisitorId();
        const likeStates = await artworkLikesService.getForArtworks(
          artworks.map(artwork => artwork.id),
          id,
        );
        if (cancelled) return;

        setVisitorId(id);
        setLikes(likeStates);
        setLikesError(null);
      } catch (error: unknown) {
        if (cancelled) return;
        console.error('Erreur lors du chargement des mentions J’aime :', getErrorMessage(error));
        setLikesError('Impossible de charger les cœurs. Veuillez réessayer plus tard.');
      } finally {
        if (!cancelled) setLikesLoading(false);
      }
    };

    setLikesLoading(true);
    fetchLikes();
    return () => {
      cancelled = true;
    };
  }, [artworks]);

  const handleToggleLike = async (artworkId: number | string) => {
    if (!visitorId || pendingLikes.has(String(artworkId))) return;

    const id = String(artworkId);
    setPendingLikes(current => new Set(current).add(id));
    try {
      const likeState = await artworkLikesService.toggle(artworkId, visitorId);
      setLikes(current => new Map(current).set(id, likeState));
      setLikesError(null);
    } catch (error: unknown) {
      console.error('Erreur lors de la mise à jour du cœur :', getErrorMessage(error));
      setLikesError('Le cœur n’a pas pu être mis à jour. Veuillez réessayer.');
    } finally {
      setPendingLikes(current => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  };

  const fetchArtworks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      if (data) setArtworks(data);
    } catch (error: unknown) {
      console.error('Erreur lors de la récupération des œuvres :', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

// FILTRAGE ALPHABETIQUE DES CATÉGORIES
  // 1. On extrait toutes les catégories uniques (sans 'TOUT')
const rawCategories = Array.from(
  new Set(artworks.map(art => art.category || art.thematique || art.title))
).filter(Boolean); // 'filter(Boolean)' retire les valeurs nulles ou vides au cas où

// 2. On trie par ordre alphabétique (prise en compte des accents)
rawCategories.sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));

// 3. On place 'TOUT' en premier
const categories = ['TOUT', ...rawCategories];

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

      {likesError && <p className={styles.likesError} role="alert">{likesError}</p>}

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

        </>
      )}

      {artworks.length > 0 && (
        <aside
          className={`${styles.categoryDrawer} ${isCategoryMenuOpen ? styles.categoryDrawerOpen : ''}`}
          aria-label="Filtrer par thématique"
        >
          <button
            type="button"
            className={styles.categoryToggle}
            onClick={() => setIsCategoryMenuOpen(open => !open)}
            aria-expanded={isCategoryMenuOpen}
            aria-controls="gallery-category-list"
            aria-label={isCategoryMenuOpen ? 'Fermer les thématiques' : 'Ouvrir les thématiques'}
          >
            <span className={styles.categoryToggleIcon} aria-hidden="true">
              {isCategoryMenuOpen ? '›' : '‹'}
            </span>
            <span className={styles.categoryToggleLabel}>Thèmes</span>
          </button>
          <div className={styles.categoryPanel}>
            <h2 className={styles.categoryTitle}>Thématiques</h2>
            <div id="gallery-category-list" className={styles.categoryList}>
              {categories.map(cat => (
                <button
                  type="button"
                  key={cat}
                  className={`${styles.filterBtn} ${filter === cat ? styles.active : ''}`}
                  onClick={() => {
                    setFilter(cat);
                    setIsCategoryMenuOpen(false);
                  }}
                  aria-pressed={filter === cat}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>
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
    <article
        key={art.id} 
        className={styles.card}
      itemScope
      itemType="https://schema.org/VisualArtwork"
      onClick={() => setActiveIndex(index)}
    >
      <meta itemProp="creator" content="Christographik" />
      <meta itemProp="artform" content="Dessin et illustration" />
      <div className={styles.imageWrapper}>
        <img 
          src={art.image_url} 
          alt={`${art.title ? `${art.title}, ` : ''}dessin ${art.thematique}, technique ${art.technique} - Christographik`}
          className={styles.image} 
          itemProp="image"
          loading="lazy"
        />
      <div className={styles.overlay}>
        <h3 itemProp="genre">{art.thematique}</h3>
        <h4 itemProp="name">{art.title || `Dessin ${art.thematique}`}</h4>
        <h5 itemProp="artMedium">{art.technique}</h5>
        <meta itemProp="artworkSurface" content={art.format} />
      </div>
      </div>
      <div className={styles.likeFooter}>
        <ArtworkLikeButton
          className={styles.galleryLikeButton}
          count={likes.get(String(art.id))?.count ?? (likesLoading || !visitorId ? null : 0)}
          liked={likes.get(String(art.id))?.liked ?? false}
          disabled={likesLoading || !visitorId || pendingLikes.has(String(art.id))}
          onToggle={() => handleToggleLike(art.id)}
        />
      </div>
    </article>
  ))}
</div>
)}

    {/* LIGHTBOX */}
    {activeIndex !== null && (
      <Lightbox 
        artworksList={uniqueFilteredArtworks}
        currentIndex={activeIndex}
        setCurrentIndex={setActiveIndex}
        onClose={() => setActiveIndex(null)} 
        likeStates={likes}
        likesLoading={likesLoading || !visitorId}
        pendingLikes={pendingLikes}
        onToggleLike={handleToggleLike}
      />
    )}
    
  </section>
  );
};