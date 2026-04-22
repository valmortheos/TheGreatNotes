import { openDB, type IDBPDatabase } from 'idb';
import { Project, Note, Connection, AppData } from '../types';

const DB_NAME = 'the_great_notes_db';
const DB_VERSION = 1;

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('notes')) {
        const store = db.createObjectStore('notes', { keyPath: 'id' });
        store.createIndex('projectId', 'projectId');
      }
      if (!db.objectStoreNames.contains('connections')) {
        const store = db.createObjectStore('connections', { keyPath: 'id' });
        store.createIndex('projectId', 'projectId');
      }
    },
  });
}

export class DBService {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = initDB();
  }

  async getProjects(): Promise<Project[]> {
    const db = await this.dbPromise;
    return db.getAll('projects');
  }

  async saveProject(project: Project) {
    const db = await this.dbPromise;
    await db.put('projects', project);
  }

  async deleteProject(id: string) {
    const db = await this.dbPromise;
    const tx = db.transaction(['projects', 'notes', 'connections'], 'readwrite');
    await tx.objectStore('projects').delete(id);
    
    // Cleanup related notes and connections
    const notesStore = tx.objectStore('notes');
    const connectionsStore = tx.objectStore('connections');
    
    const notesIdx = notesStore.index('projectId');
    const connectionsIdx = connectionsStore.index('projectId');
    
    const notes = await notesIdx.getAllKeys(id);
    const connections = await connectionsIdx.getAllKeys(id);
    
    for (const key of notes) await notesStore.delete(key);
    for (const key of connections) await connectionsStore.delete(key);
    
    await tx.done;
  }

  async getNotes(projectId: string): Promise<Note[]> {
    const db = await this.dbPromise;
    return db.getAllFromIndex('notes', 'projectId', projectId);
  }

  async saveNote(note: Note) {
    const db = await this.dbPromise;
    await db.put('notes', note);
  }

  async deleteNote(id: string) {
    const db = await this.dbPromise;
    const tx = db.transaction(['notes', 'connections'], 'readwrite');
    await tx.objectStore('notes').delete(id);
    
    // Delete connections involving this note
    const connectionsStore = tx.objectStore('connections');
    const connections = await connectionsStore.getAll();
    const toDelete = connections.filter(c => c.fromNoteId === id || c.toNoteId === id);
    for (const conn of toDelete) await connectionsStore.delete(conn.id);
    
    await tx.done;
  }

  async getConnections(projectId: string): Promise<Connection[]> {
    const db = await this.dbPromise;
    return db.getAllFromIndex('connections', 'projectId', projectId);
  }

  async saveConnection(connection: Connection) {
    const db = await this.dbPromise;
    await db.put('connections', connection);
  }

  async deleteConnection(id: string) {
    const db = await this.dbPromise;
    await db.delete('connections', id);
  }

  async getFullExport(): Promise<AppData> {
    const db = await this.dbPromise;
    const projects = await db.getAll('projects');
    const notes = await db.getAll('notes');
    const connections = await db.getAll('connections');
    return { projects, notes, connections };
  }

  async importData(data: AppData) {
    const db = await this.dbPromise;
    const tx = db.transaction(['projects', 'notes', 'connections'], 'readwrite');
    
    // Clear existing
    await tx.objectStore('projects').clear();
    await tx.objectStore('notes').clear();
    await tx.objectStore('connections').clear();
    
    for (const p of data.projects) await tx.objectStore('projects').put(p);
    for (const n of data.notes) await tx.objectStore('notes').put(n);
    for (const c of data.connections) await tx.objectStore('connections').put(c);
    
    await tx.done;
  }
}

export const dbService = new DBService();
