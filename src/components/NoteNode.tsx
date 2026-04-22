import { motion, useDragControls } from 'motion/react';
import { useState, useCallback, useRef, ChangeEvent } from 'react';
import { Note } from '../types';
import { Trash2, GripHorizontal, Maximize2, Minimize2, Edit3, Eye } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NoteNodeProps {
  note: Note;
  scale: number;
  onUpdate: (id: string, updates: Partial<Note>, persist?: boolean) => void;
  onDelete: (id: string) => void;
  onConnectStart: (id: string, point: 'top' | 'bottom' | 'left' | 'right') => void;
  onConnectEnd: (id: string, point: 'top' | 'bottom' | 'left' | 'right') => void;
  isConnecting: boolean;
}

export function NoteNode({ 
  note, 
  scale, 
  onUpdate, 
  onDelete, 
  onConnectStart, 
  onConnectEnd,
  isConnecting
}: NoteNodeProps) {
  const [isEditing, setIsEditing] = useState(note.content === "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const dragControls = useDragControls();

  const handleDragUpdate = useCallback((_: any, info: any) => {
    onUpdate(note.id, { 
      x: note.x + info.delta.x / scale, 
      y: note.y + info.delta.y / scale 
    }, false);
  }, [note.id, note.x, note.y, onUpdate, scale]);

  const handleDragEnd = useCallback((_: any, info: any) => {
    onUpdate(note.id, { 
      x: note.x + info.offset.x / scale, 
      y: note.y + info.offset.y / scale 
    }, true);
  }, [note.id, note.x, note.y, onUpdate, scale]);

  const toggleExpand = useCallback(() => {
    onUpdate(note.id, { isExpanded: !note.isExpanded });
  }, [note.id, note.isExpanded, onUpdate]);

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      onDrag={handleDragUpdate}
      onDragEnd={handleDragEnd}
      style={{ 
        x: note.x, 
        y: note.y, 
        scale,
        width: note.isExpanded ? 400 : 220,
        zIndex: note.isExpanded ? 50 : 10
      }}
      className={cn(
        "absolute group bg-white border border-zinc-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 ease-out flex flex-col",
        note.isExpanded ? "min-h-[300px]" : "h-auto max-h-[180px]",
        isConnecting && "ring-2 ring-zinc-400 ring-offset-4"
      )}
    >
      {/* Connection Points (Handles) */}
      <ConnectionPoint position="top" onClick={() => onConnectStart(note.id, 'top')} onMouseUp={() => onConnectEnd(note.id, 'top')} />
      <ConnectionPoint position="bottom" onClick={() => onConnectStart(note.id, 'bottom')} onMouseUp={() => onConnectEnd(note.id, 'bottom')} />
      <ConnectionPoint position="left" onClick={() => onConnectStart(note.id, 'left')} onMouseUp={() => onConnectEnd(note.id, 'left')} />
      <ConnectionPoint position="right" onClick={() => onConnectStart(note.id, 'right')} onMouseUp={() => onConnectEnd(note.id, 'right')} />

      {/* Header */}
      <div 
        onPointerDown={(e) => dragControls.start(e)}
        className="flex items-center justify-between px-4 py-2 border-b border-zinc-100 bg-zinc-50/50 rounded-t-2xl drag-handle cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Thought</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 hover:bg-zinc-200/50 rounded-lg transition-colors text-zinc-500"
          >
            {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
          </button>
          <button 
            onClick={toggleExpand}
            className="p-1.5 hover:bg-zinc-200/50 rounded-lg transition-colors text-zinc-500"
          >
            {note.isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button 
            onClick={() => onDelete(note.id)}
            className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto no-scrollbar p-5" onPointerDown={e => e.stopPropagation()}>
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={note.content}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onUpdate(note.id, { content: e.target.value })}
            placeholder="Type # for titles, * for lists..."
            className="w-full bg-transparent border-none resize-none focus:ring-0 text-sm leading-relaxed p-0 min-h-[100px] font-mono text-zinc-600 placeholder:text-zinc-300"
            autoFocus={note.content === ""}
          />
        ) : (
          <div className="prose prose-zinc prose-sm max-w-none text-zinc-800">
            {note.content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {note.content}
              </ReactMarkdown>
            ) : (
              <p className="text-zinc-300 italic text-xs">No content yet.</p>
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-4 py-1.5 border-t border-zinc-50 bg-zinc-50/30 rounded-b-2xl">
        <div className="flex items-center justify-between">
           <div className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
           <span className="text-[8px] font-mono text-zinc-300 uppercase select-none">
             {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
           </span>
        </div>
      </div>
    </motion.div>
  );
}

function ConnectionPoint({ position, onClick, onMouseUp }: any) {
  const baseClasses = "absolute w-2.5 h-2.5 bg-zinc-300 rounded-full border-2 border-white hover:bg-zinc-600 hover:scale-125 transition-all cursor-crosshair z-20";
  const positions: any = {
    top: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
    bottom: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
    left: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2",
    right: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2",
  };

  return (
    <div 
      className={cn(baseClasses, positions[position])} 
      onPointerDown={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseUp={onMouseUp}
    />
  );
}
