import { useState } from 'react';
import { supabase } from '../../supabaseClient';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Erreur de connexion : " + error.message);
    setLoading(false);
  };

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
        <button type="submit" disabled={loading} className="admin-button">
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}