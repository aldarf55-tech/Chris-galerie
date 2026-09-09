import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { Artwork } from '../types';
import { artworksService } from '../services/artworks.service';

import { AdminLogin } from './admin/AdminLogin';
import { AdminTabs } from './admin/AdminTabs';
import { ArtworkAddForm } from './admin/ArtworkAddForm';
import { ArtworkList } from './admin/ArtworkList';
import { ActuEditor } from './admin/ActuEditor';
import { AproposEditor } from './admin/AproposEditor';

import './AdminUpload.css';

export function AdminUpload() {
  const { session, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'add' | 'list' | 'actu' | 'apropos'>('add');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loadingArtworks, setLoadingArtworks] = useState(false);

  const fetchArtworks = async () => {
    setLoadingArtworks(true);
    try {
      const data = await artworksService.getAll();
      setArtworks(data);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoadingArtworks(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchArtworks();
    }
  }, [session]);

  if (!session) {
    return <AdminLogin />;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2 className="admin-title">Espace Administration</h2>
        <button onClick={logout} className="admin-logout-btn">
          Déconnexion
        </button>
      </div>

      <AdminTabs
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        artworksCount={artworks.length}
      />

      {activeTab === 'add' && (
        <ArtworkAddForm onSuccess={() => {
          fetchArtworks();
          setActiveTab('list');
        }} />
      )}

      {activeTab === 'list' && (
        <ArtworkList
          artworks={artworks}
          loading={loadingArtworks}
          onRefresh={fetchArtworks}
        />
      )}

      {activeTab === 'actu' && <ActuEditor />}

      {activeTab === 'apropos' && <AproposEditor />}
    </div>
  );
}