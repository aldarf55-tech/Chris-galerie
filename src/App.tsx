import { useState } from 'react';
import './App.css'
import { Header } from './components/layout/header/Header.tsx';
import { AdminUpload } from './components/ui/AdminUpload.tsx';
import { Footer } from './components/layout/Footer/Footer.tsx';
import { Gallery } from './sections/Gallery.tsx';
import { About } from './sections/About.tsx';

// Type pour sécuriser les noms de vues possibles
export type ViewType = 'gallery' | 'admin' | 'about';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('gallery');

  return (
    <>
      <Header onViewChange={setCurrentView} />
      
      <main id="center">
        {currentView === 'gallery' && <Gallery />}
        {currentView === 'about' && <About />}
        {currentView === 'admin' && <AdminUpload />}
      </main>

     <Footer/>
    </>
  );
}

export default App
