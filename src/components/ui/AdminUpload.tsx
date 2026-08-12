import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import './AdminUpload.css'; // Utilisation de votre fichier CSS existant

interface Artwork {
  id: number | string;
  thematique: string;
  technique: string;
  price: number;
  image_url: string;
}

export function AdminUpload() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [activeTab, setActiveTab] = useState<'add' | 'list' | 'actu'>('add');

  // CHAMPS DU FORMULAIRE D'AJOUT
  const [thematique, setThematique] = useState('');
  const [technique, setTechnique] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // ÉTATS GESTION ET MODIFICATION
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [loadingArtworks, setLoadingArtworks] = useState(false);

  // ÉTATS GESTION TEXTE ACTU
  const [actuIntro, setActuIntro] = useState('');
  const [loadingActu, setLoadingActu] = useState(false);
  const [savingActu, setSavingActu] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchArtworks();
      fetchActuText();
    }
  }, [session]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingLogin(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Erreur de connexion : " + error.message);
    setLoadingLogin(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // RÉCUPÉRATION DES ŒUVRES
  const fetchArtworks = async () => {
    setLoadingArtworks(true);
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('id', { ascending: false });
    if (error) console.error("Erreur chargement œuvres :", error.message);
    else if (data) setArtworks(data);
    setLoadingArtworks(false);
  };

  // RÉCUPÉRATION DU TEXTE ACTU DEPUIS SUPABASE
  const fetchActuText = async () => {
    setLoadingActu(true);
    const { data, error } = await supabase
      .from('actu')
      .select('value')
      .eq('key', 'actu_intro')
      .maybeSingle();

    if (error) {
      console.error("Erreur chargement texte ACTU :", error.message);
    } else if (data) {
      setActuIntro(data.value);
    }
    setLoadingActu(false);
  };

  // ENREGISTREMENT DU TEXTE ACTU DANS SUPABASE
  const handleSaveActuText = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingActu(true);

    const { error } = await supabase
      .from('actu')
      .upsert({ key: 'actu_intro', value: actuIntro });

    if (error) {
      alert("Erreur lors de la mise à jour du texte : " + error.message);
    } else {
      alert("Texte d'introduction ACTU mis à jour avec succès !");
    }
    setSavingActu(false);
  };

  // UPLOAD NOUVELLE ŒUVRE
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Veuillez sélectionner une image.');

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicURLData } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('artworks').insert([
        {
          thematique,
          technique,
          price: parseFloat(price),
          image_url: publicURLData.publicUrl,
        },
      ]);

      if (dbError) throw dbError;

      alert('Œuvre ajoutée avec succès !');
      setThematique('');
      setTechnique('');
      setPrice('');
      setFile(null);
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      fetchArtworks();
    } catch (error: any) {
      alert(`Erreur Supabase : ${error.message || JSON.stringify(error)}`);
    } finally {
      setUploading(false);
    }
  };

  // MODIFICATION DE L'ŒUVRE
  const handleUpdateArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtwork) return;

    const { error } = await supabase
      .from('artworks')
      .update({
        thematique: editingArtwork.thematique,
        technique: editingArtwork.technique,
        price: editingArtwork.price,
      })
      .eq('id', editingArtwork.id);

    if (error) {
      alert("Erreur de modification : " + error.message);
    } else {
      alert("Œuvre mise à jour !");
      setEditingArtwork(null);
      fetchArtworks();
    }
  };

  // SUPPRESSION DE L'ŒUVRE
  const handleDeleteArtwork = async (id: number | string, imageUrl: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette œuvre ?")) return;

    try {
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await supabase.storage.from('gallery-images').remove([fileName]);
      }

      const { error } = await supabase.from('artworks').delete().eq('id', id);
      if (error) throw error;

      alert("Œuvre supprimée avec succès !");
      fetchArtworks();
    } catch (error: any) {
      alert("Erreur lors de la suppression : " + error.message);
    }
  };

  if (!session) {
    return (
      <div className="admin-container">
        <h2 className="admin-title">Connexion Administrateur</h2>
        <form onSubmit={handleLogin} className="admin-form">
          <div className="admin-field">
            <label className="admin-label">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              className="admin-input"
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Mot de passe</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              className="admin-input"
            />
          </div>
          <button type="submit" disabled={loadingLogin} className="admin-button">
            {loadingLogin ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2 className="admin-title">Espace Administration</h2>
        <button onClick={handleLogout} className="admin-logout-btn">
          Déconnexion
        </button>
      </div>

      {/* Navigation entre Onglets */}
      <div className="admin-tabs">
        <button 
          onClick={() => setActiveTab('add')}
          className={`admin-tab-btn ${activeTab === 'add' ? 'active' : ''}`}
        >
          Ajout œuvre
        </button>
        <button 
          onClick={() => setActiveTab('list')}
          className={`admin-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
        >
          Gérer galerie ({artworks.length})
        </button>
        <button 
          onClick={() => setActiveTab('actu')}
          className={`admin-tab-btn ${activeTab === 'actu' ? 'active' : ''}`}
        >
          Modif ACTU
        </button>
      </div>

      {/* FORMULAIRE D'AJOUT */}
      {activeTab === 'add' && (
        <form onSubmit={handleUpload} className="admin-form">
          <div className="admin-field">
            <label className="admin-label">Thématique de l'œuvre</label>
            <input 
              type="text" 
              value={thematique} 
              onChange={e => setThematique(e.target.value)} 
              required 
              className="admin-input"
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Technique / Format</label>
            <input 
              type="text" 
              value={technique} 
              onChange={e => setTechnique(e.target.value)} 
              required 
              className="admin-input"
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Prix (€)</label>
            <input 
              type="number" 
              value={price} 
              onChange={e => setPrice(e.target.value)} 
              required 
              className="admin-input"
            />
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
      )}

      {/* LISTE ET ÉDITION / SUPPRESSION */}
      {activeTab === 'list' && (
        <div className="admin-list-container">
          {editingArtwork && (
            <form onSubmit={handleUpdateArtwork} className="admin-edit-form">
              <h3>Modifier : {editingArtwork.thematique}</h3>
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
                <label className="admin-label">Prix (€)</label>
                <input 
                  type="number" 
                  value={editingArtwork.price} 
                  onChange={e => setEditingArtwork({ ...editingArtwork, price: parseFloat(e.target.value) })} 
                  required 
                  className="admin-input"
                />
              </div>
              <div className="admin-actions">
                <button type="submit" className="admin-save-btn">Enregistrer</button>
                <button type="button" className="admin-cancel-btn" onClick={() => setEditingArtwork(null)}>Annuler</button>
              </div>
            </form>
          )}

          {loadingArtworks ? (
            <p>Chargement des œuvres...</p>
          ) : (
            <div className="admin-artworks-grid">
              {artworks.map(art => (
                <div key={art.id} className="admin-artwork-item">
                  <img src={art.image_url} alt={art.thematique} className="admin-artwork-thumb" />
                  <div className="admin-artwork-info">
                    <h4>{art.thematique}</h4>
                    <p>{art.technique} — {art.price} €</p>
                  </div>
                  <div className="admin-item-buttons">
                    <button onClick={() => setEditingArtwork(art)} className="admin-edit-btn">
                      Modifier
                    </button>
                    <button onClick={() => handleDeleteArtwork(art.id, art.image_url)} className="admin-delete-btn">
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    {/* ONGLET 3 : ÉDITION DU TEXTE D'INTRODUCTION ACTU */}
      {activeTab === 'actu' && (
        <div className="admin-actu-editor">
          <form onSubmit={handleSaveActuText} className="admin-form">
            <div className="admin-field">
              <label className="admin-label">Texte d'introduction de la section ACTU</label>
              {loadingActu ? (
                <p>Chargement du texte actuel...</p>
              ) : (
                <textarea 
                  value={actuIntro} 
                  onChange={e => setActuIntro(e.target.value)} 
                  required 
                  rows={5}
                  className="admin-input"
                  style={{ resize: 'vertical', minHeight: '100px' }}
                />
              )}
            </div>

            <button type="submit" disabled={savingActu || loadingActu} className="admin-button">
              {savingActu ? "Enregistrement..." : "Enregistrer le texte"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}