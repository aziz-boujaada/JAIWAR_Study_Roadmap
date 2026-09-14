import React, { useMemo } from 'react';
import { Presentation } from '../types';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Tag, BookOpen, Lightbulb, Code, CheckCircle, User, Pencil, Trash2 } from 'lucide-react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { StatusBadge } from './Dashboard';

interface PresentationDetailsProps {
  presentation: Presentation;
  onBack: () => void;
  onEdit: (presentation: Presentation) => void;
  onDelete: (presentation: Presentation) => void;
}

export const PresentationDetails: React.FC<PresentationDetailsProps> = ({ presentation, onBack, onEdit, onDelete }) => {
  const highlightedExamples = useMemo(() => {
    return presentation.codeExamples.map((example) => {
      const detected = hljs.highlightAuto(example.code);
      const languageLabel = detected.language ?? example.language?.trim() ?? 'text';

      return {
        ...example,
        highlightedCode: detected.value,
        detectedLanguage: languageLabel,
      };
    });
  }, [presentation.codeExamples]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto pb-20"
    >
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
        Back to presentations
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-8">
        <div className="mb-6 flex justify-end gap-3">
          <button
            onClick={() => onEdit(presentation)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => onDelete(presentation)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
          {presentation.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">
            <Tag className="w-4 h-4" />
            {presentation.category}
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
            <User className="w-4 h-4" />
            {presentation.author}
          </div>
          <div className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
            <Calendar className="w-4 h-4" />
            {new Date(presentation.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          <StatusBadge status={presentation.status} />
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-12">
        
        {/* Summary */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Summary</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-700 leading-relaxed text-lg">
              {presentation.summary}
            </p>
          </div>
        </section>

        {/* Important Points */}
        {presentation.importantPoints.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Important Points</h2>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <ol className="list-decimal list-outside ml-5 space-y-3">
                {presentation.importantPoints.map((point, index) => (
                  <li key={index} className="text-gray-700 pl-2 leading-relaxed">
                    {point}
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* Concepts */}
        {presentation.concepts.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Concepts</h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {presentation.concepts.map((concept, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">{concept.name}</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Definition</h4>
                      <p className="text-gray-800">{concept.definition}</p>
                    </div>
                    
                    {concept.advantages && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Advantages</h4>
                        <p className="text-gray-700">{concept.advantages}</p>
                      </div>
                    )}
                    
                    {concept.disadvantages && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Disadvantages</h4>
                        <p className="text-gray-700">{concept.disadvantages}</p>
                      </div>
                    )}
                    
                    {concept.whenToUse && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">When to use</h4>
                        <p className="text-gray-700">{concept.whenToUse}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Code Examples */}
        {presentation.codeExamples.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <Code className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Code Examples</h2>
            </div>
            
            <div className="space-y-6">
              {highlightedExamples.map((example, index) => (
                <div key={index} className="rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                  <div className="px-4 py-3 bg-gray-900 flex justify-between items-center border-b border-gray-800">
                    <span className="text-sm font-medium text-gray-200">{example.title}</span>
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                      {example.detectedLanguage}
                    </span>
                  </div>
                  <div className="bg-gray-950 p-6 overflow-x-auto">
                    <pre className="text-sm font-mono leading-6">
                      <code
                        className="hljs"
                        dangerouslySetInnerHTML={{ __html: example.highlightedCode }}
                      />
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </motion.div>
  );
};
