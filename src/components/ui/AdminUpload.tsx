import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import './AdminUpload.css';

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

export function AdminUpload() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [activeTab, setActiveTab] = useState<'add' | 'list' | 'actu' | 'apropos'>('add');

  // CHAMPS DU FORMULAIRE D'AJOUT
  const [title, setTitle] = useState('');
  const [thematique, setThematique] = useState('');
  const [technique, setTechnique] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [copyPrice, setCopyPrice] = useState('');
  const [isOriginalAvailable, setIsOriginalAvailable] = useState(true);
  const [isPrintAvailable, setIsPrintAvailable] = useState(true);
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

  // ÉTATS GESTION TEXTE/IMAGE APROPS
  const [aproposIntro, setAproposIntro] = useState('');
  const [aproposImageUrl, setAproposImageUrl] = useState('');
  const [aproposFile, setAproposFile] = useState<File | null>(null);
  const [loadingApropos, setLoadingApropos] = useState(false);
  const [savingApropos, setSavingApropos] = useState(false);

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
      fetchAproposData();
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

  const fetchAproposData = async () => {
    setLoadingApropos(true);
    const { data, error } = await supabase
      .from('apropos')
      .select('value, image_url')
      .eq('key', 'apropos_intro')
      .maybeSingle();

    if (error) {
      console.error("Erreur chargement texte APROPOS :", error.message);
    } else if (data) {
      setAproposIntro(data.value || '');
      setAproposImageUrl(data.image_url || '');
    }
    setLoadingApropos(false);
  };

const handleSaveApropos = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingApropos(true);

    try {
      let finalImageUrl = aproposImageUrl;

      // Si un nouveau fichier image est sélectionné, on l'uploade
      if (aproposFile) {
        const fileExt = aproposFile.name.split('.').pop();
        const fileName = `apropos-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('gallery-images')
          .upload(fileName, aproposFile);

        if (uploadError) throw uploadError;

        const { data: publicURLData } = supabase.storage
          .from('gallery-images')
          .getPublicUrl(fileName);

        finalImageUrl = publicURLData.publicUrl;
      }

      const { error } = await supabase
        .from('apropos')
        .upsert({ 
          key: 'apropos_intro', 
          value: aproposIntro, 
          image_url: finalImageUrl 
        });

      if (error) throw error;

      setAproposImageUrl(finalImageUrl);
      setAproposFile(null);
      const input = document.getElementById('apropos-file-input') as HTMLInputElement;
      if (input) input.value = '';

      alert("Page À Propos mise à jour avec succès !");
    } catch (error: any) {
      alert("Erreur lors de la sauvegarde : " + error.message);
    } finally {
      setSavingApropos(false);
    }
  };

  const handleRemoveAproposImage = async () => {
    if (!window.confirm("Voulez-vous vraiment supprimer l'image de la page À Propos ?")) return;

    setSavingApropos(true);
    try {
      const { error } = await supabase
        .from('apropos')
        .upsert({ 
          key: 'apropos_intro', 
          value: aproposIntro, 
          image_url: '' 
        });

      if (error) throw error;

      setAproposImageUrl('');
      setAproposFile(null);
      alert("Image supprimée avec succès !");
    } catch (error: any) {
      alert("Erreur de suppression d'image : " + error.message);
    } finally {
      setSavingApropos(false);
    }
  };

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
          title,
          thematique,
          technique,
          originalPrice: parseFloat(originalPrice),
          copyPrice: parseFloat(copyPrice),
          image_url: publicURLData.publicUrl,
          is_original_available: isOriginalAvailable,
          is_print_available: isPrintAvailable,
        },
      ]);

      if (dbError) throw dbError;

      alert('Œuvre ajoutée avec succès !');
      setTitle('');
      setThematique('');
      setTechnique('');
      setOriginalPrice('');
      setCopyPrice('');
      setIsOriginalAvailable(true);
      setIsPrintAvailable(true);
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

  const handleUpdateArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtwork) return;

    const { error } = await supabase
      .from('artworks')
      .update({
        title: editingArtwork.title,
        thematique: editingArtwork.thematique,
        technique: editingArtwork.technique,
        originalPrice: editingArtwork.originalPrice,
        copyPrice: editingArtwork.copyPrice,
        is_original_available: editingArtwork.is_original_available,
        is_print_available: editingArtwork.is_print_available,
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
        <button 
          onClick={() => setActiveTab('apropos')}
          className={`admin-tab-btn ${activeTab === 'apropos' ? 'active' : ''}`}
        >
          Modif À PROPOS
        </button>
      </div>

      {activeTab === 'add' && (
        <form onSubmit={handleUpload} className="admin-form">
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
            <label className="admin-label">Technique / Format</label>
            <input 
              type="text" 
              value={technique} 
              onChange={e => setTechnique(e.target.value)} 
              required 
              className="admin-input"
              placeholder="Ex: Crayon de couleur A3"
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
      )}

      {activeTab === 'list' && (
        <div className="admin-list-container">
          {editingArtwork && (
            <form onSubmit={handleUpdateArtwork} className="admin-edit-form">
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
                  onChange={e => setEditingArtwork({ ...editingArtwork, originalPrice: parseFloat(e.target.value) })} 
                  required 
                  className="admin-input"
                />
              </div>

              <div className="admin-field">
                <label className="admin-label">Prix copie (€)</label>
                <input 
                  type="number" 
                  value={editingArtwork.copyPrice} 
                  onChange={e => setEditingArtwork({ ...editingArtwork, copyPrice: parseFloat(e.target.value) })} 
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

          {loadingArtworks ? (
            <p>Chargement des œuvres...</p>
          ) : (
            <div className="admin-artworks-grid">
              {artworks.map(art => (
                <div key={art.id} className="admin-artwork-item">
                  <img src={art.image_url} alt={art.title || art.thematique} className="admin-artwork-thumb" />
                  <div className="admin-artwork-info">
                    <h4>{art.title ? `${art.title} (${art.thematique})` : art.thematique}</h4>
                    <p>{art.technique} — {art.originalPrice} €</p>
                    <p className="admin-availability-text">
                      Orig: {art.is_original_available ? 'Dispo' : 'Vendu'} | Copie: {art.is_print_available ? 'Dispo' : 'Indispo'}
                    </p>
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
                  className="admin-textarea"
                />
              )}
            </div>

            <button type="submit" disabled={savingActu || loadingActu} className="admin-button">
              {savingActu ? "Enregistrement..." : "Enregistrer le texte"}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'apropos' && (
        <div className="admin-apropos-editor">
          <form onSubmit={handleSaveApropos} className="admin-form">
            <div className="admin-field">
              <label className="admin-label">Texte de présentation (À Propos)</label>
              {loadingApropos ? (
                <p>Chargement de la section À Propos...</p>
              ) : (
                <textarea 
                  value={aproposIntro} 
                  onChange={e => setAproposIntro(e.target.value)} 
                  rows={6}
                  className="admin-textarea"
                  placeholder="Écrivez votre texte de présentation ici..."
                />
              )}
            </div>

            <div className="admin-field">
              <label className="admin-label">Image de profil / présentation</label>
              {aproposImageUrl && (
                <div>
                  <p>Image actuelle :</p>
                  <img 
                    src={aproposImageUrl} 
                    alt="À Propos" 
                    className="admin-artwork-thumb" 
                  />
                  <br />
                  <button 
                    type="button" 
                    onClick={handleRemoveAproposImage}
                    className="admin-delete-btn"
                  >
                    Supprimer l'image actuelle
                  </button>
                </div>
              )}
                
              <input 
                id="apropos-file-input"
                type="file" 
                accept="image/*" 
                onChange={e => setAproposFile(e.target.files?.[0] || null)} 
                className="admin-file-input"
              />
              <small style={{ opacity: 0.7 }}>
                {aproposImageUrl ? "Sélectionnez un fichier pour remplacer l'image existante." : "Sélectionnez une image à ajouter."}
              </small>
            </div>

              <button type="submit" disabled={savingApropos} className="admin-button">
                {savingApropos ? "Enregistrement..." : "Enregistrer les modifications À Propos"}
              </button>
            </form>
        </div>
      )}
    </div>
  );
}