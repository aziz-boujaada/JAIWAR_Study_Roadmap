import React from 'react';
import { Presentation } from '../types';
import { BookOpen, CheckCircle, Clock, Calendar, ChevronRight, User } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  presentations: Presentation[];
  onNavigate: (page: string, id?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ presentations, onNavigate }) => {
  const total = presentations.length;
  const completed = presentations.filter((p) => p.status === 'Completed').length;
  const inProgress = presentations.filter((p) => p.status === 'In Progress').length;
  const planned = presentations.filter((p) => p.status === 'Planned').length;
  
  const progressPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  
  const categories = Array.from(new Set(presentations.map((p) => p.category)));
  
  const recentPresentations = [...presentations]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-2">Overview of your learning journey and upcoming topics.</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Overall Learning Progress</h2>
            <p className="text-sm text-gray-500 mt-1">Track your completion across all presentations</p>
          </div>
          <div className="text-3xl font-bold text-indigo-600">{progressPercentage}%</div>
        </div>
        
        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-indigo-600 rounded-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<BookOpen />} label="Total Presentations" value={total} color="bg-blue-50 text-blue-600" />
        <StatCard icon={<CheckCircle />} label="Completed" value={completed} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={<Clock />} label="In Progress" value={inProgress} color="bg-amber-50 text-amber-600" />
        <StatCard icon={<Calendar />} label="Upcoming" value={planned} color="bg-purple-50 text-purple-600" />
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Presentations</h2>
          <button 
            onClick={() => onNavigate('presentations')}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentPresentations.map((presentation, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={presentation.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all flex flex-col cursor-pointer overflow-hidden group"
              onClick={() => onNavigate('details', presentation.id)}
            >
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                    {presentation.category}
                  </span>
                  <StatusBadge status={presentation.status} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {presentation.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {presentation.shortDescription}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <User className="w-3.5 h-3.5" />
                  {presentation.author}
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/50 flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(presentation.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-3">
                  <span title="Important Points">
                    <span className="font-medium">{presentation.importantPoints.length}</span> pts
                  </span>
                  <span title="Concepts">
                    <span className="font-medium">{presentation.concepts.length}</span> cncpts
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Categories</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map(category => {
            const count = presentations.filter(p => p.category === category).length;
            return (
              <div key={category} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{category}</div>
                  <div className="text-xs text-gray-500">{count} presentations</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 font-medium">{label}</div>
    </div>
  </div>
);

export const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-700';
      case 'In Progress': return 'bg-amber-100 text-amber-700';
      case 'Planned': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getStatusStyles()}`}>
      {status}
    </span>
  );
};
