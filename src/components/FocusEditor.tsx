import { Note } from '../types';
import { motion } from 'motion/react';
import { ArrowLeft, Save, Trash2, Clock, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';

interface FocusEditorProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>, persist?: boolean) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function FocusEditor({ note, onUpdate, onDelete, onClose }: FocusEditorProps) {
  const [content, setContent] = useState(note.content);

  const handleSave = () => {
    onUpdate(note.id, { content });
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-white z-[200] flex flex-col no-scrollbar overflow-y-auto"
    >
      <div className="flex-1 max-w-5xl w-full mx-auto px-8 lg:px-24 py-12 lg:py-24">
        {/* Header Navigation */}
        <header className="flex items-center justify-between mb-24">
          <button 
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2 rounded-2xl hover:bg-zinc-50 transition-colors text-zinc-500 font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Return to Space
          </button>

          <div className="flex items-center gap-2">
             <button 
                onClick={() => {
                   if(confirm('Delete this thought forever?')) {
                     onDelete(note.id);
                     onClose();
                   }
                }}
                className="p-3 text-red-400 hover:bg-red-50 rounded-2xl transition-colors"
                title="Delete"
             >
                <Trash2 className="w-5 h-5" />
             </button>
             <button 
               onClick={handleSave}
               className="bg-zinc-900 text-white px-8 py-3 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-black transition-all active:scale-95 flex items-center gap-2 font-semibold tracking-tight"
             >
               <Save className="w-4 h-4" />
               Save Changes
             </button>
          </div>
        </header>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          {/* Editor Area */}
          <div className="space-y-8">
            <div>
               <div className="flex items-center gap-2 mb-6">
                 <div className="w-2 h-2 rounded-full bg-zinc-900 animate-pulse" />
                 <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Drafting Environment</span>
               </div>
               <textarea
                 value={content}
                 onChange={(e) => setContent(e.target.value)}
                 autoFocus
                 placeholder="Begin your thought stream..."
                 className="w-full min-h-[500px] bg-transparent border-none focus:ring-0 text-lg leading-relaxed text-zinc-800 placeholder:text-zinc-200 resize-none font-mono no-scrollbar"
               />
            </div>
            
            <div className="flex flex-col gap-3 pt-12 border-t border-zinc-100 italic text-[10px] text-zinc-300 font-mono">
               <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  CREATED: {new Date(note.createdAt).toLocaleString()}
               </div>
               <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  LAST EDITED: {new Date(note.updatedAt).toLocaleString()}
               </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="bg-zinc-50/50 rounded-[40px] p-12 lg:p-16 min-h-[600px] border border-zinc-100 text-zinc-800">
             <div className="flex items-center gap-3 mb-12">
               <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest leading-none">Live Rendered Insight</span>
             </div>
             <div className="prose prose-zinc prose-lg max-w-none">
               {content ? (
                 <ReactMarkdown remarkPlugins={[remarkGfm]}>
                   {content}
                 </ReactMarkdown>
               ) : (
                 <p className="text-zinc-200 italic font-medium text-xl">The output of your mind will appear here.</p>
               )}
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
