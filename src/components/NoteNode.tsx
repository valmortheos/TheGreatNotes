import { motion } from 'motion/react';
import { useState, useCallback, useRef } from 'react';
import { Note } from '../types';
import { Trash2, GripHorizontal, Link, Link2Off } from 'lucide-react';
import { cn } from '../lib/utils';

interface NoteNodeProps {
  key?: string;
  note: Note;
  scale: number;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onConnectStart: (id: string) => void;
  onConnectEnd: (id: string) => void;
  isConnectingSource: boolean;
}

export function NoteNode({ 
  note, 
  scale, 
  onUpdate, 
  onDelete, 
  onConnectStart, 
  onConnectEnd,
  isConnectingSource
}: NoteNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDragEnd = useCallback((_: any, info: any) => {
    onUpdate(note.id, { 
      x: note.x + info.offset.x / scale, 
      y: note.y + info.offset.y / scale 
    });
  }, [note.id, note.x, note.y, onUpdate, scale]);

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      style={{ x: note.x, y: note.y, scale }}
      className={cn(
        "absolute group min-w-[200px] max-w-[300px] bg-white border border-zinc-200 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-default overflow-hidden",
        isConnectingSource && "ring-2 ring-blue-500"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-50 border-bottom border-zinc-100 drag-handle cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-zinc-400" />
          <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Note</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onConnectStart(note.id)}
            className="p-1 hover:bg-zinc-200 rounded transition-colors"
            title="Connect"
          >
            <Link className="w-3.5 h-3.5 text-zinc-600" />
          </button>
          <button 
            onClick={() => onConnectEnd(note.id)}
            className="p-1 hover:bg-zinc-200 rounded transition-colors"
            title="Connect here"
          >
            <Link2Off className="w-3.5 h-3.5 text-zinc-600" />
          </button>
          <button 
            onClick={() => onDelete(note.id)}
            className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4" onPointerDown={e => e.stopPropagation()}>
        <textarea
          ref={textareaRef}
          value={note.content}
          onChange={(e) => onUpdate(note.id, { content: e.target.value })}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          placeholder="Write your thoughts..."
          className="w-full bg-transparent border-none resize-none focus:ring-0 text-sm leading-relaxed p-0 min-h-[60px]"
          autoFocus={note.content === ""}
        />
      </div>

      {/* Footer / Connectors */}
      <div className="h-2 bg-zinc-50 flex items-center justify-center">
         <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full" />
      </div>
    </motion.div>
  );
}
