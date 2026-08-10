import { useState } from 'react';
import './App.css'
import { Header } from './components/layout/header/Header.tsx';
import { AdminUpload } from './components/ui/AdminUpload.tsx';
import { Footer } from './components/layout/Footer/Footer.tsx';
import { Gallery } from './sections/Gallery.tsx';
import { About } from './sections/About.tsx';
import { Actu } from './sections/Actu.tsx';

// Type pour sécuriser les noms de vues possibles
export type ViewType = 'GALLERIE' | 'ADMIN' | 'ABOUT' | 'ACTU';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('ACTU');

  return (
    <>
      <Header onViewChange={setCurrentView} />
      
      <main id="center">
        {currentView === 'GALLERIE' && <Gallery />}
        {currentView === 'ABOUT' && <About />}
        {currentView === 'ADMIN' && <AdminUpload />}
        {currentView === 'ACTU' && <Actu />}
      </main>

     <Footer/>
    </>
  );
}

export default App
