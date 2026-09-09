import { useState, useEffect } from 'react';
import { aproposService } from '../../services/apropos.service';

export function AproposEditor() {
  const [introText, setIntroText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchApropos();
  }, []);

  const fetchApropos = async () => {
    setLoading(true);
    try {
      const data = await aproposService.get();
      if (data) {
        setIntroText(data.value || '');
        setImageUrl(data.image_url || '');
      }
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedUrl = await aproposService.save(introText, imageUrl, file);
      setImageUrl(updatedUrl);
      setFile(null);
      const input = document.getElementById('apropos-file-input') as HTMLInputElement;
      if (input) input.value = '';
      alert("Mise à jour réussie !");
    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!window.confirm("Voulez-vous vraiment supprimer l'image ?")) return;
    setSaving(true);
    try {
      await aproposService.removeImage(introText);
      setImageUrl('');
      setFile(null);
      alert("Image supprimée avec succès !");
    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-apropos-editor">
      <form onSubmit={handleSave} className="admin-form">
        <div className="admin-field">
          <label className="admin-label">Texte de présentation (À Propos)</label>
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <textarea
              value={introText}
              onChange={e => setIntroText(e.target.value)}
              rows={6}
              className="admin-textarea"
              placeholder="Écrivez votre texte de présentation ici..."
            />
          )}
        </div>

        <div className="admin-field">
          <label className="admin-label">Image de profil / présentation</label>
          {imageUrl && (
            <div>
              <p>Image actuelle :</p>
              <img src={imageUrl} alt="À Propos" className="admin-artwork-thumb" />
              <br />
              <button type="button" onClick={handleRemoveImage} className="admin-delete-btn">
                Supprimer l'image actuelle
              </button>
            </div>
          )}

          <input
            id="apropos-file-input"
            type="file"
            accept="image/*"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="admin-file-input"
          />
        </div>

        <button type="submit" disabled={saving} className="admin-button">
          {saving ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </form>
    </div>
  );
}