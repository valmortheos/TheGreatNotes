import { ChangeEvent } from 'react';
import { Plus, Folder, Trash2, Home, Download, Upload } from 'lucide-react';
import { Project } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  onCreateProject: () => void;
  onDeleteProject: (id: string) => void;
  onExport: () => void;
  onImport: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function Sidebar({ 
  projects, 
  activeProjectId, 
  onSelectProject, 
  onCreateProject, 
  onDeleteProject,
  onExport,
  onImport
}: SidebarProps) {
  return (
    <div className="w-64 h-full bg-[#F5F5F3] border-r border-zinc-200 flex flex-col z-20">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg leading-none">G</span>
          </div>
          <h1 className="text-sm font-semibold tracking-tight text-zinc-800">The Great Notes</h1>
        </div>

        <button
          onClick={() => onSelectProject(null)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-2",
            activeProjectId === null ? "bg-[#EBEBE8] text-zinc-900" : "text-zinc-500 hover:bg-[#EBEBE8] hover:text-zinc-900"
          )}
        >
          <Home className="w-4 h-4" />
          General
        </button>

        <div className="mt-8 mb-4">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Projects</span>
            <button 
              onClick={onCreateProject}
              className="p-1 hover:bg-[#EBEBE8] rounded text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="space-y-1">
            {projects.map(project => (
              <div key={project.id} className="group relative">
                <button
                  onClick={() => onSelectProject(project.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left pr-10",
                    activeProjectId === project.id ? "bg-[#EBEBE8] text-zinc-900" : "text-zinc-500 hover:bg-[#EBEBE8] hover:text-zinc-900"
                  )}
                >
                  <Folder className="w-4 h-4" />
                  <span className="truncate">{project.name}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProject(project.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-all rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto p-6 border-t border-zinc-200">
        <div className="space-y-2">
          <button 
            onClick={onExport}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-zinc-500 hover:bg-[#EBEBE8] hover:text-zinc-900 transition-colors rounded-lg"
          >
            <Download className="w-3.5 h-3.5" />
            Export Backup (JSON)
          </button>
          <label className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-zinc-500 hover:bg-[#EBEBE8] hover:text-zinc-900 transition-colors rounded-lg cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            Import Backup
            <input type="file" accept=".json" onChange={onImport} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
}
