import React, { useState } from 'react';
import { Presentation } from '../types';
import { motion } from 'motion/react';
import { Search, Filter, ArrowUpDown, User } from 'lucide-react';
import { StatusBadge } from './Dashboard';

interface PresentationsProps {
  presentations: Presentation[];
  onNavigate: (page: string, id?: string) => void;
}

export const Presentations: React.FC<PresentationsProps> = ({ presentations, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');

  const categories = ['All', ...Array.from(new Set(presentations.map(p => p.category)))];
  const statuses = ['All', 'Planned', 'In Progress', 'Completed'];

  const filteredPresentations = presentations
    .filter(p => 
      (categoryFilter === 'All' || p.category === categoryFilter) &&
      (statusFilter === 'All' || p.status === statusFilter) &&
      (p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
       p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Presentations</h1>
          <p className="text-gray-500 mt-2">Browse and search all knowledge resources.</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96 flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
            placeholder="Search presentations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex w-full md:w-auto gap-3 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center space-x-2 shrink-0">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              className="pl-2 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <select
              className="pl-2 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
            </select>
          </div>

          <div className="flex items-center space-x-2 shrink-0 border-l border-gray-200 pl-3">
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
            <select
              className="pl-2 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Presentations */}
      {filteredPresentations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPresentations.map((presentation, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={presentation.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden"
            >
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-50 text-indigo-700">
                    {presentation.category}
                  </span>
                  <StatusBadge status={presentation.status} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {presentation.title}
                </h3>
                
                <div className="flex items-center gap-4 mb-3">
                  <p className="text-sm text-gray-500 font-medium">
                    {new Date(presentation.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                    <User className="w-3.5 h-3.5" />
                    {presentation.author}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 flex-grow">
                  {presentation.shortDescription}
                </p>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => onNavigate('details', presentation.id)}
                  className="w-full py-2 px-4 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Open Presentation
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No presentations found</h3>
          <p className="mt-1 text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      )}
    </motion.div>
  );
};
