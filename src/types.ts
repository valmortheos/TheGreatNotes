export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface Note {
  id: string;
  projectId: string;
  content: string;
  x: number;
  y: number;
  color?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Connection {
  id: string;
  projectId: string;
  fromNoteId: string;
  toNoteId: string;
}

export interface AppData {
  projects: Project[];
  notes: Note[];
  connections: Connection[];
}
