import { useState } from 'react';
import styles from './Navbar.module.css';
import type { ViewType } from '../../../App.tsx';

interface NavbarProps {
  onViewChange: (view: ViewType) => void;
}

export const Navbar = ({ onViewChange }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Fonction utilitaire pour changer de vue et fermer le menu burger
  const handleNavigation = (view: ViewType) => {
    onViewChange(view);
    setIsOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      {/* Bouton Hamburger - visible uniquement sur mobile */}
      <button 
        className={styles.hamburger}  
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Liste des liens */}
      <ul className={`${styles.navList} ${isOpen ? styles.menuOpen : ''}`}>
        <li className={styles.navLink}>
          <a 
            href="#" 
            onClick={(e) => { 
              e.preventDefault(); 
              handleNavigation('ACTU'); 
            }}
          >
            ACTU
          </a>
        </li>
        <li className={styles.navLink}>
          <a 
            href="#" 
            onClick={(e) => { 
              e.preventDefault(); 
              handleNavigation('GALLERIE'); 
            }}
          >
            GALERIE
          </a>
        </li>
        <li className={styles.navLink}>
          <a 
            href="#" 
            onClick={(e) => { 
              e.preventDefault(); 
              handleNavigation('ABOUT'); 
            }}
          >
            À PROPOS
          </a>
        </li>
      </ul>
    </nav>
  );
};