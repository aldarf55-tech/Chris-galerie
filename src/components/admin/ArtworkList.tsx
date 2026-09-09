import { useState } from 'react';
import type { Artwork } from '../../types';
import { artworksService } from '../../services/artworks.service';

interface ArtworkListProps {
  artworks: Artwork[];
  loading: boolean;
  onRefresh: () => void;
}

export function ArtworkList({ artworks, loading, onRefresh }: ArtworkListProps) {
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getUniqueArtworksByTitle = (list: Artwork[]) => {
    const seenTitles = new Set<string>();
    return list.filter(art => {
      const rawTitle = art.title || art.thematique || String(art.id);
      const normalizedTitle = rawTitle.toLowerCase().trim();
      if (seenTitles.has(normalizedTitle)) return false;
      seenTitles.add(normalizedTitle);
      return true;
    });
  };

  const searched = artworks.filter(art => {
    const query = searchTerm.toLowerCase();
    return (
      (art.title && art.title.toLowerCase().includes(query)) ||
      (art.thematique && art.thematique.toLowerCase().includes(query)) ||
      (art.technique && art.technique.toLowerCase().includes(query))
    );
  });

  const uniqueArtworks = getUniqueArtworksByTitle(searched);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtwork) return;

    try {
      await artworksService.update(editingArtwork);
      alert("Œuvre mise à jour !");
      setEditingArtwork(null);
      onRefresh();
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  };

  const handleDelete = async (id: number | string, imageUrl: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette œuvre ?")) return;
    try {
      await artworksService.delete(id, imageUrl);
      alert("Œuvre supprimée !");
      onRefresh();
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  };

  return (
    <div className="admin-list-container">
      {editingArtwork && (
        <form onSubmit={handleUpdate} className="admin-edit-form">
          <h3>Modifier : {editingArtwork.title || editingArtwork.thematique}</h3>

          <div className="admin-field">
            <label className="admin-label">Titre</label>
            <input
              type="text"
              value={editingArtwork.title || ''}
              onChange={e => setEditingArtwork({ ...editingArtwork, title: e.target.value })}
              required
              className="admin-input"
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Thématique</label>
            <input
              type="text"
              value={editingArtwork.thematique}
              onChange={e => setEditingArtwork({ ...editingArtwork, thematique: e.target.value })}
              required
              className="admin-input"
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Technique</label>
            <input
              type="text"
              value={editingArtwork.technique}
              onChange={e => setEditingArtwork({ ...editingArtwork, technique: e.target.value })}
              required
              className="admin-input"
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Prix original (€)</label>
            <input
              type="number"
              value={editingArtwork.originalPrice}
              onChange={e => setEditingArtwork({ ...editingArtwork, originalPrice: parseFloat(e.target.value) || 0 })}
              required
              className="admin-input"
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Prix copie (€)</label>
            <input
              type="number"
              value={editingArtwork.copyPrice}
              onChange={e => setEditingArtwork({ ...editingArtwork, copyPrice: parseFloat(e.target.value) || 0 })}
              required
              className="admin-input"
            />
          </div>

          <div className="admin-checkbox-group">
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                checked={editingArtwork.is_original_available}
                onChange={e => setEditingArtwork({ ...editingArtwork, is_original_available: e.target.checked })}
              />
              Original disponible
            </label>
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                checked={editingArtwork.is_print_available}
                onChange={e => setEditingArtwork({ ...editingArtwork, is_print_available: e.target.checked })}
              />
              Copie 250g/m² disponible
            </label>
          </div>

          <div className="admin-actions">
            <button type="submit" className="admin-save-btn">Enregistrer</button>
            <button type="button" className="admin-cancel-btn" onClick={() => setEditingArtwork(null)}>Annuler</button>
          </div>
        </form>
      )}

      <div className="admin-search-bar" style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="🔍 Rechercher par titre, thématique ou technique..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="admin-input"
        />
      </div>

      {loading ? (
        <p>Chargement des œuvres...</p>
      ) : uniqueArtworks.length === 0 ? (
        <p className="admin-no-results">Aucune œuvre ne correspond à votre recherche.</p>
      ) : (
        <div className="admin-artworks-grid">
          {uniqueArtworks.map(art => (
            <div key={art.id} className="admin-artwork-item">
              <img src={art.image_url} alt={art.title || art.thematique} className="admin-artwork-thumb" />
              <div className="admin-artwork-info">
                <h4>{art.title ? `${art.title} (${art.thematique})` : art.thematique}</h4>
                <p>{art.technique}</p>
                <p className="admin-availability-text">
                  Orig: {art.is_original_available ? 'Dispo' : 'Vendu'} — {art.originalPrice} €
                </p>
                <p className="admin-availability-text">
                  Copie: {art.is_print_available ? 'Dispo' : 'Indispo'} — {art.copyPrice} €
                </p>
              </div>
              <div className="admin-item-buttons">
                <button onClick={() => setEditingArtwork(art)} className="admin-edit-btn">
                  Modifier
                </button>
                <button onClick={() => handleDelete(art.id, art.image_url)} className="admin-delete-btn">
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}