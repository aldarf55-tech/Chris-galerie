import { Navbar } from '../navbar/Navbar.tsx';
import styles from './Header.module.css';
import type { ViewType } from '../../../App.tsx'; // Importez le type depuis App

interface HeaderProps {
  onViewChange: (view: ViewType) => void;
}

export const Header = ({ onViewChange }: HeaderProps) => {
  return (
    <header className={styles.header}>
      {/* Cliquer sur le logo ramène à la Galerie (au lieu d'un rechargement de page complet) */}
      <div className={styles.headerlogo} onClick={() => onViewChange('gallery')}>
        <img src="src/assets/images/logocarre.jpg" alt="Logo" />
      </div>

      {/* On transmet onViewChange à la Navbar pour gérer les clics "Accueil" et "À propos" */}
      <Navbar onViewChange={onViewChange} />

      {/* Le bouton Admin active la vue 'admin' */}
      <button className={styles.cta} onClick={() => onViewChange('admin')}>
        Admin
      </button>
    </header>
  );
};