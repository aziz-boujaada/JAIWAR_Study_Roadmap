import React from 'react';
import { Presentation } from '../types';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, Clock, User } from 'lucide-react';

interface RoadmapProps {
  presentations: Presentation[];
  onNavigate: (page: string, id?: string) => void;
}

export const Roadmap: React.FC<RoadmapProps> = ({ presentations, onNavigate }) => {
  // Sort by order
  const sortedPresentations = [...presentations].sort((a, b) => a.order - b.order);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto py-8"
    >
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Learning Roadmap</h1>
        <p className="text-gray-500 mt-3 max-w-lg mx-auto">
          Your visual journey through the technical concepts. Follow the path to master the topics.
        </p>
      </div>

      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-[27px] sm:left-1/2 top-4 bottom-4 w-0.5 bg-gray-200 transform sm:-translate-x-1/2"></div>
        
        <div className="space-y-12 relative">
          <div className="flex items-center justify-start sm:justify-center">
            <div className="bg-indigo-100 text-indigo-600 text-xs font-bold px-4 py-2 rounded-full shadow-sm z-10 border border-indigo-200">
              START
            </div>
          </div>

          {sortedPresentations.map((presentation, index) => {
            const isEven = index % 2 === 0;
            const isCompleted = presentation.status === 'Completed';
            const isInProgress = presentation.status === 'In Progress';
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                key={presentation.id}
                className={`flex flex-col sm:flex-row items-start ${isEven ? 'sm:flex-row-reverse' : ''}`}
              >
                {/* Mobile View: Spacer for icon alignment */}
                <div className="hidden sm:block sm:w-1/2"></div>
                
                {/* Center Icon */}
                <div className="absolute left-0 sm:left-1/2 transform sm:-translate-x-1/2 flex justify-center items-center mt-1 z-10 w-14">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm border-4 border-white
                    ${isCompleted ? 'bg-emerald-500 text-white' : 
                      isInProgress ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-400'}
                  `}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : 
                     isInProgress ? <Clock className="w-5 h-5" /> : 
                     <Circle className="w-5 h-5" />}
                  </div>
                </div>

                {/* Content Card */}
                <div className={`w-full pl-16 sm:pl-0 sm:w-1/2 ${isEven ? 'sm:pr-12' : 'sm:pl-12'}`}>
                  <div 
                    onClick={() => onNavigate('details', presentation.id)}
                    className={`bg-white p-5 rounded-2xl shadow-sm border transition-all cursor-pointer hover:shadow-md
                      ${isCompleted ? 'border-emerald-100 hover:border-emerald-200' : 
                        isInProgress ? 'border-amber-200 hover:border-amber-300 ring-1 ring-amber-100' : 
                        'border-gray-200 hover:border-gray-300 opacity-80'}
                    `}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-gray-400">
                        {String(presentation.order).padStart(2, '0')}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {presentation.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {presentation.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-indigo-600 font-medium mb-2">
                      <User className="w-3 h-3" />
                      {presentation.author}
                    </div>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {presentation.shortDescription}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-md
                        ${isCompleted ? 'bg-emerald-50 text-emerald-700' : 
                          isInProgress ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-500'}
                      `}>
                        {presentation.status}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        {new Date(presentation.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
