import React from 'react';
import { Map, LayoutDashboard, Presentation as PresentationIcon, Plus } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'roadmap', label: 'Roadmap', icon: Map },
    { id: 'presentations', label: 'Presentations', icon: PresentationIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 z-20 sticky top-0 md:h-screen">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <img
              src="/jaiwar-logo.svg"
              alt="JAIWAR logo"
              className="w-10 h-10 rounded-full object-cover shadow-sm ring-1 ring-gray-200"
            />
            <span className="text-xl font-bold text-gray-900 tracking-tight">JAIWAR</span>
          </div>
        </div>
        
        <nav className="px-4 pb-6 md:pb-0 space-y-1 overflow-x-auto md:overflow-x-visible flex md:block no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id || (currentPage === 'details' && item.id === 'presentations');
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3 w-full md:w-auto md:w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors shrink-0 ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
        
        <div className="px-4 mt-6 pb-6 md:pb-0">
          <button
            onClick={() => onNavigate('add-presentation')}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 text-sm font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Presentation
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-full min-w-0">
        <div className="p-6 md:p-10 max-w-7xl mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
};
