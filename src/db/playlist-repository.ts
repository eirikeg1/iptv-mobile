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
    console.log('[PlaylistRepository] getAll called, count:', this.playlists.size);
    return Array.from(this.playlists.values());
  }

  async getById(id: string): Promise<Playlist | null> {
    console.log('[PlaylistRepository] getById called:', id);
    const playlist = this.playlists.get(id) || null;
    console.log('[PlaylistRepository] Found:', !!playlist);
    return playlist;
  }

  async create(playlist: Playlist): Promise<Playlist> {
    console.log('[PlaylistRepository] create called:', {
      id: playlist.id,
      name: playlist.name,
      channelCount: playlist.channelCount,
    });
    this.playlists.set(playlist.id, playlist);
    console.log('[PlaylistRepository] Playlist created, total count:', this.playlists.size);
    return playlist;
  }

  async update(id: string, updates: Partial<Playlist>): Promise<Playlist> {
    console.log('[PlaylistRepository] update called:', id);
    const existing = this.playlists.get(id);
    if (!existing) {
      console.error('[PlaylistRepository] Playlist not found:', id);
      throw new Error(`Playlist with id ${id} not found`);
    }

    const updated: Playlist = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };

    this.playlists.set(id, updated);
    console.log('[PlaylistRepository] Playlist updated');
    return updated;
  }

  async delete(id: string): Promise<void> {
    console.log('[PlaylistRepository] delete called:', id);
    if (!this.playlists.has(id)) {
      console.error('[PlaylistRepository] Playlist not found:', id);
      throw new Error(`Playlist with id ${id} not found`);
    }
    this.playlists.delete(id);
    console.log('[PlaylistRepository] Playlist deleted, remaining count:', this.playlists.size);
  }

  async clear(): Promise<void> {
    console.log('[PlaylistRepository] clear called');
    this.playlists.clear();
    console.log('[PlaylistRepository] All playlists cleared');
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
