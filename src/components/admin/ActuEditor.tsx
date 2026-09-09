import { useState, useEffect } from 'react';
import { actuService } from '../../services/actu.service';

export function ActuEditor() {
  const [actuText, setActuText] = useState('');
  const [actuFiles, setActuFiles] = useState<{ [key: string]: File | null }>({
    actuimage1: null,
    actuimage2: null,
    actuimage3: null,
    actuimage4: null,
  });
  const [actuImageUrls, setActuImageUrls] = useState<{ [key: string]: string }>({
    actuimage1: '',
    actuimage2: '',
    actuimage3: '',
    actuimage4: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchActu();
  }, []);

  const fetchActu = async () => {
    setLoading(true);
    try {
      const data = await actuService.getLatest();
      if (data) {
        setActuText(data.value || '');
        setActuImageUrls({
          actuimage1: data.actuimage1 || '',
          actuimage2: data.actuimage2 || '',
          actuimage3: data.actuimage3 || '',
          actuimage4: data.actuimage4 || '',
        });
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
      await actuService.save(actuText, actuImageUrls, actuFiles);
      setActuText('');
      setActuImageUrls({ actuimage1: '', actuimage2: '', actuimage3: '', actuimage4: '' });
      setActuFiles({ actuimage1: null, actuimage2: null, actuimage3: null, actuimage4: null });
      alert("Nouvelle actualité publiée avec succès !");
    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveImage = (key: string) => {
    setActuImageUrls(prev => ({ ...prev, [key]: '' }));
    setActuFiles(prev => ({ ...prev, [key]: null }));
  };

  return (
    <div className="admin-actu-editor">
      <form onSubmit={handleSave} className="admin-form">
        <div className="admin-field">
          <label className="admin-label">Texte ou titre de l'actualité</label>
          {loading ? (
            <p>Chargement des données actuelles...</p>
          ) : (
            <textarea
              value={actuText}
              onChange={e => setActuText(e.target.value)}
              required
              rows={4}
              className="admin-textarea"
              placeholder="Saisissez le texte ou la description de l'actualité..."
            />
          )}
        </div>

        <div className="admin-field">
          <label className="admin-label">Images de l'actualité (jusqu'à 4)</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
            {[1, 2, 3, 4].map(num => {
              const fieldKey = `actuimage${num}`;
              const currentUrl = actuImageUrls[fieldKey];

              return (
                <div key={num} style={{ border: '1px dashed #ccc', padding: '10px', borderRadius: '6px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Image {num}</p>
                  
                  {currentUrl ? (
                    <div style={{ marginBottom: '8px' }}>
                      <img
                        src={currentUrl}
                        alt={`Actu ${num}`}
                        className="admin-artwork-thumb"
                        style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(fieldKey)}
                        className="admin-delete-btn"
                        style={{ marginTop: '5px', width: '100%' }}
                      >
                        Supprimer
                      </button>
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: '#666' }}>Aucune image sélectionnée</p>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const uploadedFile = e.target.files?.[0] || null;
                      setActuFiles(prev => ({ ...prev, [fieldKey]: uploadedFile }));
                    }}
                    className="admin-file-input"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <button type="submit" disabled={saving || loading} className="admin-button" style={{ marginTop: '1.5rem' }}>
          {saving ? "Enregistrement en cours..." : "Enregistrer l'actualité"}
        </button>
      </form>
    </div>
  );
}