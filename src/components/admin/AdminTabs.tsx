type TabType = 'add' | 'list' | 'actu' | 'apropos';

interface AdminTabsProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  artworksCount: number;
}

export function AdminTabs({ activeTab, onSelectTab, artworksCount }: AdminTabsProps) {
  return (
    <div className="admin-tabs">
      <button
        onClick={() => onSelectTab('add')}
        className={`admin-tab-btn ${activeTab === 'add' ? 'active' : ''}`}
      >
        Ajout œuvre
      </button>
      <button
        onClick={() => onSelectTab('list')}
        className={`admin-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
      >
        Gérer galerie ({artworksCount})
      </button>
      <button
        onClick={() => onSelectTab('actu')}
        className={`admin-tab-btn ${activeTab === 'actu' ? 'active' : ''}`}
      >
        Modif ACTU
      </button>
      <button
        onClick={() => onSelectTab('apropos')}
        className={`admin-tab-btn ${activeTab === 'apropos' ? 'active' : ''}`}
      >
        Modif À PROPOS
      </button>
    </div>
  );
}