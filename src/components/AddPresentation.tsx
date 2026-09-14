import React, { useState } from 'react';
import { Presentation, Status, Concept, CodeExample } from '../types';
import { motion } from 'motion/react';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

interface AddPresentationProps {
  onAdd: (presentation: Presentation) => void;
  onCancel: () => void;
  presentationsCount: number;
}

export const AddPresentation: React.FC<AddPresentationProps> = ({ onAdd, onCancel, presentationsCount }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<Status>('Planned');
  const [shortDescription, setShortDescription] = useState('');
  const [summary, setSummary] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [importantPoints, setImportantPoints] = useState<string[]>(['']);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [codeExamples, setCodeExamples] = useState<CodeExample[]>([]);

  const handleAddPoint = () => setImportantPoints([...importantPoints, '']);
  const handlePointChange = (index: number, value: string) => {
    const newPoints = [...importantPoints];
    newPoints[index] = value;
    setImportantPoints(newPoints);
  };
  const handleRemovePoint = (index: number) => {
    setImportantPoints(importantPoints.filter((_, i) => i !== index));
  };

  const handleAddConcept = () => {
    setConcepts([...concepts, { name: '', definition: '', advantages: '', disadvantages: '', whenToUse: '' }]);
  };
  const handleConceptChange = (index: number, field: keyof Concept, value: string) => {
    const newConcepts = [...concepts];
    newConcepts[index] = { ...newConcepts[index], [field]: value };
    setConcepts(newConcepts);
  };
  const handleRemoveConcept = (index: number) => {
    setConcepts(concepts.filter((_, i) => i !== index));
  };

  const handleAddCode = () => {
    setCodeExamples([...codeExamples, { title: '', language: '', code: '' }]);
  };
  const handleCodeChange = (index: number, field: keyof CodeExample, value: string) => {
    const newCodes = [...codeExamples];
    newCodes[index] = { ...newCodes[index], [field]: value };
    setCodeExamples(newCodes);
  };
  const handleRemoveCode = (index: number) => {
    setCodeExamples(codeExamples.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || !category) return;

    const newPresentation: Presentation = {
      id: Date.now().toString(),
      title,
      author,
      category,
      date,
      status,
      shortDescription,
      summary,
      importantPoints: importantPoints.filter(p => p.trim() !== ''),
      concepts: concepts.filter(c => c.name.trim() !== '' && c.definition.trim() !== ''),
      codeExamples: codeExamples.filter(c => c.title.trim() !== '' && c.code.trim() !== ''),
      order: presentationsCount + 1,
    };

    onAdd(newPresentation);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto pb-20"
    >
      <button 
        onClick={onCancel}
        className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
        Cancel
      </button>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">
          Add New Presentation
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Basic Info */}
          <section className="space-y-5">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Data Structures in Java" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author Name *</label>
                <input required type="text" value={author} onChange={e => setAuthor(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <input required type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Java, React, Python" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as Status)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                  <option value="Planned">Planned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Description (for cards)</label>
              <input type="text" value={shortDescription} onChange={e => setShortDescription(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="A brief 1-sentence overview" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Summary</label>
              <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Detailed explanation of the presentation..." />
            </div>
          </section>

          {/* Important Points */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Important Points</h2>
            {importantPoints.map((point, index) => (
              <div key={index} className="flex gap-2">
                <input 
                  type="text" 
                  value={point} 
                  onChange={e => handlePointChange(index, e.target.value)} 
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  placeholder={`Point ${index + 1}`} 
                />
                <button type="button" onClick={() => handleRemovePoint(index)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            <button type="button" onClick={handleAddPoint} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Point
            </button>
          </section>

          {/* Concepts */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Core Concepts</h2>
            {concepts.map((concept, index) => (
              <div key={index} className="p-5 border border-gray-200 rounded-xl bg-gray-50 relative space-y-4">
                <button type="button" onClick={() => handleRemoveConcept(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="pr-8">
                  <label className="block text-xs font-bold text-gray-600 mb-1">Concept Name *</label>
                  <input type="text" value={concept.name} onChange={e => handleConceptChange(index, 'name', e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm" placeholder="e.g. ArrayList" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Definition *</label>
                  <textarea value={concept.definition} onChange={e => handleConceptChange(index, 'definition', e.target.value)} rows={2} className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm" placeholder="What is it?" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Advantages</label>
                    <input type="text" value={concept.advantages || ''} onChange={e => handleConceptChange(index, 'advantages', e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Disadvantages</label>
                    <input type="text" value={concept.disadvantages || ''} onChange={e => handleConceptChange(index, 'disadvantages', e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">When to Use</label>
                  <input type="text" value={concept.whenToUse || ''} onChange={e => handleConceptChange(index, 'whenToUse', e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm" />
                </div>
              </div>
            ))}
            <button type="button" onClick={handleAddConcept} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Concept
            </button>
          </section>

          {/* Code Examples */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Code Snippets</h2>
            {codeExamples.map((codeInfo, index) => (
              <div key={index} className="p-5 border border-gray-200 rounded-xl bg-gray-50 relative space-y-4">
                <button type="button" onClick={() => handleRemoveCode(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Snippet Title *</label>
                    <input type="text" value={codeInfo.title} onChange={e => handleCodeChange(index, 'title', e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm" placeholder="e.g. For Loop" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Language *</label>
                    <input type="text" value={codeInfo.language} onChange={e => handleCodeChange(index, 'language', e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm" placeholder="e.g. java, python, ts" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Code *</label>
                  <textarea value={codeInfo.code} onChange={e => handleCodeChange(index, 'code', e.target.value)} rows={4} className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm font-mono bg-gray-900 text-gray-100" placeholder="// your code here" />
                </div>
              </div>
            ))}
            <button type="button" onClick={handleAddCode} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Code Snippet
            </button>
          </section>

          <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
            <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm">
              <Save className="w-4 h-4" /> Save Presentation
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};
