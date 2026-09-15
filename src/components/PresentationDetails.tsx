import React, { useMemo, useState, useEffect } from 'react';
import { Presentation, Comment } from '../types';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Tag, BookOpen, Lightbulb, Code, CheckCircle, User, Pencil, Trash2, Link as LinkIcon, Heart, MessageCircle, Send, ExternalLink } from 'lucide-react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { StatusBadge } from './Dashboard';
import { fetchComments, addComment, deleteComment, likePresentation } from '../lib/presentationsApi';

interface PresentationDetailsProps {
  presentation: Presentation;
  onBack: () => void;
  onEdit: (presentation: Presentation) => void;
  onDelete: (presentation: Presentation) => void;
  onLike: (presentationId: string, newLikes: number) => void;
}

export const PresentationDetails: React.FC<PresentationDetailsProps> = ({ presentation, onBack, onEdit, onDelete, onLike }) => {
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

  const [comments, setComments] = useState<Comment[]>([]);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(presentation.likes ?? 0);
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchComments(presentation.id)
      .then((data) => {
        if (!cancelled) {
          setComments(data);
          setCommentsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCommentsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [presentation.id]);

  useEffect(() => {
    setLikesCount(presentation.likes ?? 0);
  }, [presentation.likes]);

  useEffect(() => {
    try {
      const likedIds: string[] = JSON.parse(localStorage.getItem('liked_presentations') ?? '[]');
      setLiked(likedIds.includes(presentation.id));
    } catch {
      setLiked(false);
    }
  }, [presentation.id]);

  const handleLike = async () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((prev) => nextLiked ? prev + 1 : Math.max(0, prev - 1));

    try {
      const result = await likePresentation(presentation.id, nextLiked);
      setLikesCount(result.likes);
      onLike(presentation.id, result.likes);
    } catch {
      setLiked(!nextLiked);
      setLikesCount(presentation.likes ?? 0);
    }

    try {
      const likedIds: string[] = JSON.parse(localStorage.getItem('liked_presentations') ?? '[]');
      const nextIds = nextLiked
        ? [...likedIds, presentation.id]
        : likedIds.filter((id) => id !== presentation.id);
      localStorage.setItem('liked_presentations', JSON.stringify(nextIds));
    } catch { /* ignore */ }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;

    setSubmitting(true);
    try {
      const newComment = await addComment(presentation.id, {
        author: commentAuthor.trim() || 'Anonymous',
        text: commentText.trim(),
      });
      setComments((prev) => [newComment, ...prev]);
      setCommentText('');
      setSubmitting(false);
    } catch {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(presentation.id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch { /* ignore */ }
  };

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
        <div className="mb-6 flex justify-between items-start">
          <div />
          <div className="flex gap-3">
            <button
              onClick={handleLike}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                liked
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-red-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              {likesCount}
            </button>
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

      {/* Presentation Link */}
      {presentation.presentationLink && (
        <motion.a
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          href={presentation.presentationLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-5 bg-white rounded-2xl shadow-sm border border-gray-200 mb-8 hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <LinkIcon className="w-5 h-5" />
          </div>
          <div className="flex-grow min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-0.5">Presentation Link</p>
            <p className="text-sm font-medium text-indigo-600 truncate">{presentation.presentationLink}</p>
          </div>
          <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors shrink-0" />
        </motion.a>
      )}

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

        {/* Comments Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-sky-100 text-sky-600 rounded-lg">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Comments
              {comments.length > 0 && (
                <span className="ml-2 text-sm font-medium text-gray-400">({comments.length})</span>
              )}
            </h2>
          </div>

          <form onSubmit={handleAddComment} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="mb-4">
              <input
                type="text"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="Your name (optional, defaults to Anonymous)"
              />
            </div>
            <div className="flex gap-3">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                placeholder="Add a comment..."
              />
            </div>
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={!commentText.trim() || submitting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Sending...' : 'Post Comment'}
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {commentsLoading ? (
              <div className="text-center py-8 text-gray-500 text-sm">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                        {comment.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{comment.author}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(comment.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mt-1">{comment.text}</p>
                </motion.div>
              ))
            )}
          </div>
        </section>

      </div>
    </motion.div>
  );
};
