import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import './AdminUpload.css';

export function AdminUpload() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  // Vérifier si l'admin est déjà connecté au chargement
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Écouter les changements de connexion (connexion/déconnexion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fonction de connexion via Supabase Auth
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingLogin(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Erreur de connexion : " + error.message);
    }
    setLoadingLogin(false);
  };

  // Fonction de déconnexion
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- CHAMPS DU FORMULAIRE D'UPLOAD ---
  const [thematique, setThematique] = useState('');
  const [technique, setTechnique] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Veuillez sélectionner une image.');
      return;
    }

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

      const imageUrl = publicURLData.publicUrl;

      const { error: dbError } = await supabase.from('artworks').insert([
        {
          thematique,
          technique,
          price: parseFloat(price),
          image_url: imageUrl,
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

   } catch (error: any) {
  console.error("Erreur complète :", error);
  // Affiche l'erreur exacte renvoyée par Supabase
  alert(`Erreur Supabase : ${error.message || error.error_description || JSON.stringify(error)}`);
} finally {
      setUploading(false);
    }
  };

  // 1. SI NON CONNECTÉ : Afficher le formulaire de login sécurisé
  if (!session) {
    return (
      <div className="admin-container">
        <h2 className="admin-title">Connexion Administrateur</h2>
        <form onSubmit={handleLogin} className="admin-form">
          <div className="admin-field">
            <label className="admin-label">Email</label>
            <input 
              type="email" 
              placeholder="admin@example.com" 
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
              placeholder="••••••••" 
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

  // 2. SI CONNECTÉ : Afficher le formulaire d'upload
  return (
    <div className="admin-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="admin-title" style={{ margin: 0 }}>Ajouter une œuvre</h2>
        <button 
          onClick={handleLogout} 
          style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
        >
          Déconnexion
        </button>
      </div>
      
      <form onSubmit={handleUpload} className="admin-form">
        <div className="admin-field">
          <label className="admin-label">Thematique de l'œuvre</label>
          <input 
            type="text" 
            placeholder="Ex: Dc comics" 
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
            placeholder="Ex: Huile sur toile, 60x80cm" 
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
            placeholder="Ex: 450" 
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

        <button 
          type="submit" 
          disabled={uploading}
          className="admin-button"
        >
          {uploading ? "Envoi en cours..." : "Publier l'œuvre"}
        </button>
      </form>
    </div>
  );
}