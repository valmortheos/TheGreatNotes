import { useState, useEffect, useCallback, useMemo, ChangeEvent } from 'react';
import { Sidebar } from './components/Sidebar';
import { NoteNode } from './components/NoteNode';
import { ConnectionLine } from './components/ConnectionLine';
import { useCanvas } from './hooks/useCanvas';
import { dbService } from './lib/db';
import { Project, Note, Connection, AppData } from './types';
import { Plus, Maximize, MousePointer2, Zap, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  
  const { scale, setScale, offset, setOffset, startPan, canvasRef, onWheel, resetView } = useCanvas();

  // Load projects on mount
  useEffect(() => {
    dbService.getProjects().then(setProjects);
  }, []);

  // Load notes and connections when project changes
  useEffect(() => {
    const pid = activeProjectId || 'general';
    Promise.all([
      dbService.getNotes(pid),
      dbService.getConnections(pid)
    ]).then(([loadedNotes, loadedConnections]) => {
      setNotes(loadedNotes);
      setConnections(loadedConnections);
    });
  }, [activeProjectId]);

  const handleCreateProject = useCallback(async () => {
    const name = prompt('Enter project name:');
    if (!name) return;
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await dbService.saveProject(newProject);
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
  }, []);

  const handleDeleteProject = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this project and all its notes?')) return;
    await dbService.deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) setActiveProjectId(null);
  }, [activeProjectId]);

  const handleCreateNote = useCallback(async () => {
    const pid = activeProjectId || 'general';
    const newNote: Note = {
      id: crypto.randomUUID(),
      projectId: pid,
      content: '',
      x: -offset.x / scale + window.innerWidth / 2 / scale - 100,
      y: -offset.y / scale + window.innerHeight / 2 / scale - 50,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await dbService.saveNote(newNote);
    setNotes(prev => [...prev, newNote]);
  }, [activeProjectId, offset, scale]);

  const handleUpdateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n));
    const note = notes.find(n => n.id === id);
    if (note) {
      await dbService.saveNote({ ...note, ...updates, updatedAt: Date.now() });
    }
  }, [notes]);

  const handleDeleteNote = useCallback(async (id: string) => {
    await dbService.deleteNote(id);
    setNotes(prev => prev.filter(n => n.id !== id));
    setConnections(prev => prev.filter(c => c.fromNoteId !== id && c.toNoteId !== id));
  }, []);

  const handleConnectStart = useCallback((id: string) => {
    setConnectingSourceId(id);
  }, []);

  const handleConnectEnd = useCallback(async (id: string) => {
    if (!connectingSourceId || connectingSourceId === id) {
      setConnectingSourceId(null);
      return;
    }

    const pid = activeProjectId || 'general';
    const existing = connections.find(c => 
      (c.fromNoteId === connectingSourceId && c.toNoteId === id) ||
      (c.fromNoteId === id && c.toNoteId === connectingSourceId)
    );

    if (existing) {
      setConnectingSourceId(null);
      return;
    }

    const newConn: Connection = {
      id: crypto.randomUUID(),
      projectId: pid,
      fromNoteId: connectingSourceId,
      toNoteId: id
    };

    await dbService.saveConnection(newConn);
    setConnections(prev => [...prev, newConn]);
    setConnectingSourceId(null);
  }, [connectingSourceId, connections, activeProjectId]);

  const handleExport = useCallback(async () => {
    const data = await dbService.getFullExport();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `the-great-notes-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImport = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as AppData;
        await dbService.importData(data);
        window.location.reload();
      } catch (err) {
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleExportZip = useCallback(async () => {
    const data = await dbService.getFullExport();
    const zip = new JSZip();
    zip.file('data.json', JSON.stringify(data, null, 2));
    
    // Also export as text files in folders
    const projectsFolder = zip.folder('projects');
    for (const p of data.projects) {
      const pFolder = projectsFolder?.folder(p.name);
      const pNotes = data.notes.filter(n => n.projectId === p.id);
      pNotes.forEach((n, idx) => {
        pFolder?.file(`note-${idx+1}.txt`, n.content);
      });
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `the-great-notes-archive.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#FCFCFB] overflow-hidden select-none">
      <Sidebar 
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={setActiveProjectId}
        onCreateProject={handleCreateProject}
        onDeleteProject={handleDeleteProject}
        onExport={handleExport}
        onImport={handleImport}
      />

      <main 
        ref={canvasRef}
        className="flex-1 relative overflow-hidden canvas-bg"
        onMouseDown={startPan}
        onWheel={onWheel}
      >
        {/* Canvas Content Container */}
        <div 
          className="absolute inset-0 transition-none"
          style={{ 
            transformOrigin: '0 0',
            transform: `translate(${offset.x}px, ${offset.y}px)` 
          }}
        >
          {/* Connections Layer */}
          {connections.map(conn => {
            const fromNote = notes.find(n => n.id === conn.fromNoteId);
            const toNote = notes.find(n => n.id === conn.toNoteId);
            if (!fromNote || !toNote) return null;
            return <ConnectionLine key={conn.id} from={fromNote} to={toNote} scale={scale} />;
          })}

          {/* Notes Layer */}
          <AnimatePresence>
            {notes.map(note => (
              <NoteNode 
                key={note.id}
                note={note}
                scale={scale}
                onUpdate={handleUpdateNote}
                onDelete={handleDeleteNote}
                onConnectStart={handleConnectStart}
                onConnectEnd={handleConnectEnd}
                isConnectingSource={connectingSourceId === note.id}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* HUD UI */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-4">
             <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-zinc-200 flex items-center gap-3 pointer-events-auto">
                <span className="text-xs font-semibold text-zinc-900">
                  {projects.find(p => p.id === activeProjectId)?.name || 'General Space'}
                </span>
                <div className="w-px h-3 bg-zinc-200" />
                <span className="text-[10px] text-zinc-400 font-mono">
                  {notes.length} NOTES
                </span>
             </div>
             
             {connectingSourceId && (
               <motion.div 
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-blue-500 px-4 py-2 rounded-2xl shadow-lg border border-blue-600 flex items-center gap-2 pointer-events-auto"
               >
                 <Zap className="w-3.5 h-3.5 text-white animate-pulse" />
                 <span className="text-xs font-medium text-white italic">Select another note to connect...</span>
                 <button 
                  onClick={() => setConnectingSourceId(null)}
                  className="ml-2 text-[10px] bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-white transition-colors"
                 >
                   Cancel
                 </button>
               </motion.div>
             )}
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={handleCreateNote}
              className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-2xl shadow-xl hover:bg-black transition-all active:scale-95 group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              <span className="text-sm font-medium">New Thought</span>
            </button>
            
            <button
               onClick={resetView}
               title="Reset View"
               className="p-2.5 bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-900 rounded-2xl shadow-sm transition-all"
            >
               <Maximize className="w-4 h-4" />
            </button>
            <button
               onClick={handleExportZip}
               title="Export ZIP Archive"
               className="p-2.5 bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-900 rounded-2xl shadow-sm transition-all"
            >
               <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer controls */}
        <div className="absolute bottom-6 left-6 flex items-center gap-2 pointer-events-auto">
          <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-zinc-200 flex items-center gap-3">
             <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400">
                <MousePointer2 className="w-3 h-3" />
                MIDDLE CLICK OR ALT+CLICK TO PAN
             </div>
             <div className="w-px h-2 bg-zinc-200" />
             <div className="flex items-center gap-2">
                <button onClick={() => setScale(s => Math.max(s - 0.1, 0.1))} className="text-xs font-mono px-1 hover:text-zinc-900">-</button>
                <span className="text-[10px] font-mono min-w-[3ch] text-center">{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale(s => Math.min(s + 0.1, 5))} className="text-xs font-mono px-1 hover:text-zinc-900">+</button>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
