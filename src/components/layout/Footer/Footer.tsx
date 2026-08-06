import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.social}>
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
                Instagram
              </a>
        </div>

        <div className={styles.social}>
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
                Mail
              </a>
        </div>
      <p>&copy; 2026 MonProjet. Tous droits réservés. Mk.</p>
    </footer>
  );
};