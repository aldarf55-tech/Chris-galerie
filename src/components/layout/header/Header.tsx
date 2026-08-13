import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { Navbar } from '../navbar/Navbar.tsx';
import styles from './Header.module.css';
import type { ViewType } from '../../../App.tsx'; // Importez le type depuis App
import logoImg from '../../../assets/images/logocarre.jpg';

interface HeaderProps {
  onViewChange: (view: ViewType) => void;
}

export const Header = ({ onViewChange }: HeaderProps) => {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // 1. Récupère la session au chargement du Header
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Écoute en temps réel si tu te connectes ou déconnectes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className={styles.header}>
      {/* Cliquer sur le logo ramène à la Galerie (au lieu d'un rechargement de page complet) */}
      
      <div className={styles.social}>
      <div className={styles.headerlogo} onClick={() => onViewChange('GALLERIE')}>
        <img src={logoImg} alt="Logo" />
      </div>

      <div className={styles.socialIcons}>
        <a href="https://www.instagram.com/christophevergnet/" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
          <svg className={styles.buttonIcon}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"    
          >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
        </a>
      
        <a href="mailto:votre.adresse@email.com?subject=Demande%20d'information" className={styles.mailLink}>
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            aria-hidden="true"
            className={styles.mailIcon}
          >
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </a>
      </div>
    </div>

      {/* On transmet onViewChange à la Navbar pour gérer les clics "Accueil" et "À propos" */}
      <Navbar onViewChange={onViewChange} />

      {/* Le bouton Admin ne s'affiche QUE SI 'session' existe (tu es connecté) */}
      {session && (
        <button className={styles.cta} onClick={() => onViewChange('ADMIN')}>
          Admin
        </button>
      )}
    </header>
  );
};