import { useState } from 'react';
import { artworksService } from '../../services/artworks.service';

interface ArtworkAddFormProps {
  onSuccess: () => void;
}

export function ArtworkAddForm({ onSuccess }: ArtworkAddFormProps) {
  const [title, setTitle] = useState('');
  const [thematique, setThematique] = useState('');
  const [technique, setTechnique] = useState('');
  const [format, setFormat] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [copyPrice, setCopyPrice] = useState('');
  const [isOriginalAvailable, setIsOriginalAvailable] = useState(true);
  const [isPrintAvailable, setIsPrintAvailable] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Veuillez sélectionner une image.');

    setUploading(true);
    try {
      await artworksService.create(
        {
          title,
          thematique,
          technique,
          format,
          originalPrice: parseFloat(originalPrice),
          copyPrice: parseFloat(copyPrice),
          is_original_available: isOriginalAvailable,
          is_print_available: isPrintAvailable,
        },
        file
      );

      alert('Œuvre ajoutée avec succès !');
      setTitle('');
      setThematique('');
      setTechnique('');
      setFormat('');
      setOriginalPrice('');
      setCopyPrice('');
      setIsOriginalAvailable(true);
      setIsPrintAvailable(true);
      setFile(null);
      
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      onSuccess();
    } catch (error: any) {
      alert(`Erreur : ${error.message || JSON.stringify(error)}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="admin-field">
        <label className="admin-label">Titre de l'œuvre</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="admin-input"
          placeholder="Ex: Sangoku Super Saiyan"
        />
      </div>

      <div className="admin-field">
        <label className="admin-label">Thématique de l'œuvre</label>
        <input
          type="text"
          value={thematique}
          onChange={e => setThematique(e.target.value)}
          required
          className="admin-input"
          placeholder="Ex: Dragon Ball"
        />
      </div>

      <div className="admin-field">
        <label className="admin-label">Technique</label>
        <input
          type="text"
          value={technique}
          onChange={e => setTechnique(e.target.value)}
          required
          className="admin-input"
          placeholder="Ex: Crayon de couleur"
        />
      </div>

      <div className="admin-field">
        <label className="admin-label">Format</label>
        <input
          type="text"
          value={format}
          onChange={e => setFormat(e.target.value)}
          required
          className="admin-input"
          placeholder="Ex: A3"
        />
      </div>

      <div className="admin-field">
        <label className="admin-label">Prix original (€)</label>
        <input
          type="number"
          value={originalPrice}
          onChange={e => setOriginalPrice(e.target.value)}
          required
          className="admin-input"
        />
      </div>

      <div className="admin-field">
        <label className="admin-label">Prix copie (€)</label>
        <input
          type="number"
          value={copyPrice}
          onChange={e => setCopyPrice(e.target.value)}
          required
          className="admin-input"
        />
      </div>

      <div className="admin-checkbox-group">
        <label className="admin-checkbox-label">
          <input
            type="checkbox"
            checked={isOriginalAvailable}
            onChange={e => setIsOriginalAvailable(e.target.checked)}
          />
          Original disponible à la vente
        </label>
        <label className="admin-checkbox-label">
          <input
            type="checkbox"
            checked={isPrintAvailable}
            onChange={e => setIsPrintAvailable(e.target.checked)}
          />
          Copie papier 250g/m² disponible
        </label>
      </div>

      <div className="admin-field">
        <label className="admin-label">Fichier image</label>
        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={e => setFile(e.target.files?.[0] || null)}
          required
          className="admin-file-input"
        />
      </div>

      <button type="submit" disabled={uploading} className="admin-button">
        {uploading ? "Envoi en cours..." : "Publier l'œuvre"}
      </button>
    </form>
  );
}