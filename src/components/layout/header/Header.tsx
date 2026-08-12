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
      <div className={styles.headerlogo} onClick={() => onViewChange('GALLERIE')}>
        <img src={logoImg} alt="Logo" />
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