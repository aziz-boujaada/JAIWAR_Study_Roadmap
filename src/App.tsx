import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Roadmap } from './components/Roadmap';
import { Presentations } from './components/Presentations';
import { PresentationDetails } from './components/PresentationDetails';
import { AddPresentation } from './components/AddPresentation';
import { presentationsData } from './data';
import { Presentation } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [selectedPresentationId, setSelectedPresentationId] = useState<string | null>(null);

  const [presentations, setPresentations] = useState<Presentation[]>(() => {
    const saved = localStorage.getItem('study_roadmap_presentations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return presentationsData;
  });

  React.useEffect(() => {
    localStorage.setItem('study_roadmap_presentations', JSON.stringify(presentations));
  }, [presentations]);

  const handleNavigate = (page: string, id?: string) => {
    setCurrentPage(page);
    if (id) {
      setSelectedPresentationId(id);
    } else if (page !== 'details') {
      setSelectedPresentationId(null);
    }
  };

  const handleAddPresentation = (newPres: Presentation) => {
    setPresentations([...presentations, newPres]);
    handleNavigate('presentations');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard presentations={presentations} onNavigate={handleNavigate} />;
      case 'roadmap':
        return <Roadmap presentations={presentations} onNavigate={handleNavigate} />;
      case 'presentations':
        return <Presentations presentations={presentations} onNavigate={handleNavigate} />;
      case 'add-presentation':
        return <AddPresentation onAdd={handleAddPresentation} onCancel={() => handleNavigate('presentations')} presentationsCount={presentations.length} />;
      case 'details':
        const presentation = presentations.find(p => p.id === selectedPresentationId);
        if (!presentation) {
          return <div className="text-center py-10">Presentation not found</div>;
        }
        return (
          <PresentationDetails 
            presentation={presentation} 
            onBack={() => handleNavigate('presentations')} 
          />
        );
      default:
        return <Dashboard presentations={presentations} onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderPage()}
    </Layout>
  );
}
