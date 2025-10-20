import type { Playlist } from '@/types/playlist.types';

/**
 * Repository interface for playlist data access
 * Currently uses in-memory storage, but designed to support SQLite in the future
 */
export interface IPlaylistRepository {
  getAll(): Promise<Playlist[]>;
  getById(id: string): Promise<Playlist | null>;
  create(playlist: Playlist): Promise<Playlist>;
  update(id: string, updates: Partial<Playlist>): Promise<Playlist>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * In-memory implementation of playlist repository
 * This will be replaced with SQLite implementation in the future
 */
class InMemoryPlaylistRepository implements IPlaylistRepository {
  private playlists: Map<string, Playlist> = new Map();

  async getAll(): Promise<Playlist[]> {
    return Array.from(this.playlists.values());
  }

  async getById(id: string): Promise<Playlist | null> {
    return this.playlists.get(id) || null;
  }

  async create(playlist: Playlist): Promise<Playlist> {
    this.playlists.set(playlist.id, playlist);
    return playlist;
  }

  async update(id: string, updates: Partial<Playlist>): Promise<Playlist> {
    const existing = this.playlists.get(id);
    if (!existing) {
      throw new Error(`Playlist with id ${id} not found`);
    }

    const updated: Playlist = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };

    this.playlists.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    if (!this.playlists.has(id)) {
      throw new Error(`Playlist with id ${id} not found`);
    }
    this.playlists.delete(id);
  }

  async clear(): Promise<void> {
    this.playlists.clear();
  }
}

/**
 * SQLite implementation placeholder
 * Uncomment and implement when ready to migrate to SQLite
 */
/*
class SQLitePlaylistRepository implements IPlaylistRepository {
  private db: SQLiteDatabase;

  constructor(database: SQLiteDatabase) {
    this.db = database;
  }

  async getAll(): Promise<Playlist[]> {
    // TODO: Implement SQLite query
    return [];
  }

  async getById(id: string): Promise<Playlist | null> {
    // TODO: Implement SQLite query
    return null;
  }

  async create(playlist: Playlist): Promise<Playlist> {
    // TODO: Implement SQLite insert
    return playlist;
  }

  async update(id: string, updates: Partial<Playlist>): Promise<Playlist> {
    // TODO: Implement SQLite update
    throw new Error('Not implemented');
  }

  async delete(id: string): Promise<void> {
    // TODO: Implement SQLite delete
  }

  async clear(): Promise<void> {
    // TODO: Implement SQLite clear
  }
}
*/

/**
 * Factory function to create the appropriate repository instance
 * This allows easy switching between in-memory and SQLite implementations
 */
export function createPlaylistRepository(): IPlaylistRepository {
  // For now, return in-memory repository
  // In the future, check for SQLite availability and return appropriate implementation
  return new InMemoryPlaylistRepository();
}

/**
 * Singleton instance of the repository
 */
export const playlistRepository = createPlaylistRepository();
