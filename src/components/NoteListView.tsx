import { Note } from '../types';
import { motion } from 'motion/react';
import { FileText, ChevronRight, Clock, ArrowRight } from 'lucide-react';

interface NoteListViewProps {
  notes: Note[];
  onNoteSelect: (id: string) => void;
  projectName: string;
}

export function NoteListView({ notes, onNoteSelect, projectName }: NoteListViewProps) {
  return (
    <div className="flex-1 bg-white overflow-y-auto no-scrollbar">
      <div className="max-w-4xl mx-auto px-8 pt-24 pb-20">
        <header className="mb-16">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">{projectName}</div>
          <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Thoughts List</h2>
          <p className="text-zinc-500 mt-2">Browse and organize your ideas in a linear format.</p>
        </header>

        {notes.length === 0 ? (
          <div className="text-center py-32 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
             <div className="text-zinc-400 text-sm italic">No notes found in this space.</div>
          </div>
        ) : (
          <div className="grid gap-3">
            {notes.map((note, idx) => (
              <motion.button
                key={note.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onNoteSelect(note.id)}
                className="group flex items-center gap-6 p-6 rounded-3xl bg-white border border-zinc-100 hover:border-zinc-300 hover:shadow-xl transition-all text-left w-full"
              >
                <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-zinc-900 text-lg truncate mb-1">
                    {note.content.split('\n')[0].replace(/[#*]/g, '').trim() || 'Untitled Thought'}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-zinc-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="w-1 h-1 bg-zinc-200 rounded-full" />
                    <span className="truncate max-w-[200px]">
                       {note.content.slice(0, 80).replace(/\n/g, ' ') || 'Empty content...'}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-50 text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
