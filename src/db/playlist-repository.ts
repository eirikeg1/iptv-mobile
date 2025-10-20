import type { Playlist, Channel } from '@/types/playlist.types';
import { executeQuery, executeQuerySingle, executeStatement, executeTransaction } from './sqlite-client';
import { randomUUID } from 'expo-crypto';

/**
 * Repository interface for playlist data access
 */
export interface IPlaylistRepository {
  getAll(): Promise<Playlist[]>;
  getById(id: string): Promise<Playlist | null>;
  create(playlist: Playlist): Promise<Playlist>;
  update(id: string, updates: Partial<Playlist>): Promise<Playlist>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;

  // Channel operations
  getChannelsByPlaylistId(playlistId: string): Promise<Channel[]>;
  saveChannels(playlistId: string, channels: Channel[]): Promise<void>;
  deleteChannelsByPlaylistId(playlistId: string): Promise<void>;
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

  async getChannelsByPlaylistId(playlistId: string): Promise<Channel[]> {
    const playlist = this.playlists.get(playlistId);
    return playlist?.parsedData?.items || [];
  }

  async saveChannels(playlistId: string, channels: Channel[]): Promise<void> {
    // In-memory implementation: channels are stored in parsedData.items
    const playlist = this.playlists.get(playlistId);
    if (playlist && playlist.parsedData) {
      playlist.parsedData.items = channels as any;
    }
  }

  async deleteChannelsByPlaylistId(playlistId: string): Promise<void> {
    const playlist = this.playlists.get(playlistId);
    if (playlist && playlist.parsedData) {
      playlist.parsedData.items = [];
    }
  }
}

/**
 * Database row types
 */
interface PlaylistRow {
  id: string;
  name: string;
  url: string;
  username: string | null;
  password: string | null;
  channelCount: number | null;
  createdAt: string;
  updatedAt: string;
  lastFetchedAt: string | null;
}

interface ChannelRow {
  id: string;
  playlistId: string;
  name: string;
  url: string;
  tvgId: string | null;
  tvgName: string | null;
  tvgLogo: string | null;
  tvgCountry: string | null;
  tvgLanguage: string | null;
  tvgUrl: string | null;
  groupTitle: string | null;
  httpReferrer: string | null;
  httpUserAgent: string | null;
}

/**
 * SQLite implementation of playlist repository
 */
class SQLitePlaylistRepository implements IPlaylistRepository {
  /**
   * Convert database row to Playlist object
   */
  private rowToPlaylist(row: PlaylistRow, channels?: Channel[]): Playlist {
    const playlist: Playlist = {
      id: row.id,
      name: row.name,
      url: row.url,
      channelCount: row.channelCount || undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      lastFetchedAt: row.lastFetchedAt ? new Date(row.lastFetchedAt) : undefined,
    };

    if (row.username && row.password) {
      playlist.credentials = {
        username: row.username,
        password: row.password,
      };
    }

    if (channels && channels.length > 0) {
      playlist.parsedData = {
        items: channels as any,
        header: {
          attrs: { 'x-tvg-url': '' },
          raw: '',
        },
      };
    }

    return playlist;
  }

  /**
   * Convert database row to Channel object
   */
  private rowToChannel(row: ChannelRow): Channel {
    return {
      name: row.name,
      url: row.url,
      tvg: {
        id: row.tvgId || undefined,
        name: row.tvgName || undefined,
        logo: row.tvgLogo || undefined,
        country: row.tvgCountry || undefined,
        language: row.tvgLanguage || undefined,
        url: row.tvgUrl || undefined,
      },
      group: {
        title: row.groupTitle || undefined,
      },
      http: row.httpReferrer || row.httpUserAgent ? {
        referrer: row.httpReferrer || undefined,
        userAgent: row.httpUserAgent || undefined,
      } : undefined,
    };
  }

  async getAll(): Promise<Playlist[]> {
    console.log('[SQLitePlaylistRepository] getAll called');
    const rows = await executeQuery<PlaylistRow>(
      'SELECT * FROM playlists ORDER BY createdAt DESC'
    );

    const playlists = await Promise.all(
      rows.map(async (row) => {
        const channels = await this.getChannelsByPlaylistId(row.id);
        return this.rowToPlaylist(row, channels);
      })
    );

    console.log('[SQLitePlaylistRepository] Found', playlists.length, 'playlists');
    return playlists;
  }

  async getById(id: string): Promise<Playlist | null> {
    console.log('[SQLitePlaylistRepository] getById called:', id);
    const row = await executeQuerySingle<PlaylistRow>(
      'SELECT * FROM playlists WHERE id = ?',
      [id]
    );

    if (!row) {
      console.log('[SQLitePlaylistRepository] Playlist not found');
      return null;
    }

    const channels = await this.getChannelsByPlaylistId(id);
    console.log('[SQLitePlaylistRepository] Found playlist with', channels.length, 'channels');
    return this.rowToPlaylist(row, channels);
  }

  async create(playlist: Playlist): Promise<Playlist> {
    console.log('[SQLitePlaylistRepository] create called:', {
      id: playlist.id,
      name: playlist.name,
      channelCount: playlist.channelCount,
    });

    await executeTransaction(async (tx) => {
      // Insert playlist
      await tx.runAsync(
        `INSERT INTO playlists (id, name, url, username, password, channelCount, createdAt, updatedAt, lastFetchedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          playlist.id,
          playlist.name,
          playlist.url,
          playlist.credentials?.username || null,
          playlist.credentials?.password || null,
          playlist.channelCount || null,
          playlist.createdAt.toISOString(),
          playlist.updatedAt.toISOString(),
          playlist.lastFetchedAt?.toISOString() || null,
        ]
      );

      // Insert channels if they exist
      if (playlist.parsedData?.items && playlist.parsedData.items.length > 0) {
        for (const item of playlist.parsedData.items) {
          const channel = item as any as Channel;
          await tx.runAsync(
            `INSERT INTO channels (id, playlistId, name, url, tvgId, tvgName, tvgLogo, tvgCountry, tvgLanguage, tvgUrl, groupTitle, httpReferrer, httpUserAgent)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              randomUUID(),
              playlist.id,
              channel.name,
              channel.url,
              channel.tvg?.id || null,
              channel.tvg?.name || null,
              channel.tvg?.logo || null,
              channel.tvg?.country || null,
              channel.tvg?.language || null,
              channel.tvg?.url || null,
              channel.group?.title || null,
              channel.http?.referrer || null,
              channel.http?.userAgent || null,
            ]
          );
        }
      }
    });

    console.log('[SQLitePlaylistRepository] Playlist created successfully');
    return playlist;
  }

  async update(id: string, updates: Partial<Playlist>): Promise<Playlist> {
    console.log('[SQLitePlaylistRepository] update called:', id);

    const existing = await this.getById(id);
    if (!existing) {
      console.error('[SQLitePlaylistRepository] Playlist not found:', id);
      throw new Error(`Playlist with id ${id} not found`);
    }

    const updated: Playlist = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };

    await executeTransaction(async (tx) => {
      // Update playlist metadata
      await tx.runAsync(
        `UPDATE playlists
         SET name = ?, url = ?, username = ?, password = ?, channelCount = ?, updatedAt = ?, lastFetchedAt = ?
         WHERE id = ?`,
        [
          updated.name,
          updated.url,
          updated.credentials?.username || null,
          updated.credentials?.password || null,
          updated.channelCount || null,
          updated.updatedAt.toISOString(),
          updated.lastFetchedAt?.toISOString() || null,
          id,
        ]
      );

      // If channels are updated, replace them
      if (updates.parsedData?.items) {
        // Delete existing channels
        await tx.runAsync('DELETE FROM channels WHERE playlistId = ?', [id]);

        // Insert new channels
        for (const item of updates.parsedData.items) {
          const channel = item as any as Channel;
          await tx.runAsync(
            `INSERT INTO channels (id, playlistId, name, url, tvgId, tvgName, tvgLogo, tvgCountry, tvgLanguage, tvgUrl, groupTitle, httpReferrer, httpUserAgent)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              randomUUID(),
              id,
              channel.name,
              channel.url,
              channel.tvg?.id || null,
              channel.tvg?.name || null,
              channel.tvg?.logo || null,
              channel.tvg?.country || null,
              channel.tvg?.language || null,
              channel.tvg?.url || null,
              channel.group?.title || null,
              channel.http?.referrer || null,
              channel.http?.userAgent || null,
            ]
          );
        }
      }
    });

    console.log('[SQLitePlaylistRepository] Playlist updated successfully');
    return updated;
  }

  async delete(id: string): Promise<void> {
    console.log('[SQLitePlaylistRepository] delete called:', id);

    const result = await executeStatement('DELETE FROM playlists WHERE id = ?', [id]);

    if (result.changes === 0) {
      console.error('[SQLitePlaylistRepository] Playlist not found:', id);
      throw new Error(`Playlist with id ${id} not found`);
    }

    console.log('[SQLitePlaylistRepository] Playlist deleted successfully');
  }

  async clear(): Promise<void> {
    console.log('[SQLitePlaylistRepository] clear called');
    await executeStatement('DELETE FROM playlists');
    await executeStatement('DELETE FROM channels');
    console.log('[SQLitePlaylistRepository] All playlists and channels cleared');
  }

  async getChannelsByPlaylistId(playlistId: string): Promise<Channel[]> {
    const rows = await executeQuery<ChannelRow>(
      'SELECT * FROM channels WHERE playlistId = ?',
      [playlistId]
    );

    return rows.map(row => this.rowToChannel(row));
  }

  async saveChannels(playlistId: string, channels: Channel[]): Promise<void> {
    console.log('[SQLitePlaylistRepository] saveChannels called:', playlistId, channels.length);

    await executeTransaction(async (tx) => {
      // Delete existing channels
      await tx.runAsync('DELETE FROM channels WHERE playlistId = ?', [playlistId]);

      // Insert new channels
      for (const channel of channels) {
        await tx.runAsync(
          `INSERT INTO channels (id, playlistId, name, url, tvgId, tvgName, tvgLogo, tvgCountry, tvgLanguage, tvgUrl, groupTitle, httpReferrer, httpUserAgent)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            randomUUID(),
            playlistId,
            channel.name,
            channel.url,
            channel.tvg?.id || null,
            channel.tvg?.name || null,
            channel.tvg?.logo || null,
            channel.tvg?.country || null,
            channel.tvg?.language || null,
            channel.tvg?.url || null,
            channel.group?.title || null,
            channel.http?.referrer || null,
            channel.http?.userAgent || null,
          ]
        );
      }
    });

    console.log('[SQLitePlaylistRepository] Channels saved successfully');
  }

  async deleteChannelsByPlaylistId(playlistId: string): Promise<void> {
    console.log('[SQLitePlaylistRepository] deleteChannelsByPlaylistId called:', playlistId);
    await executeStatement('DELETE FROM channels WHERE playlistId = ?', [playlistId]);
    console.log('[SQLitePlaylistRepository] Channels deleted successfully');
  }
}

/**
 * Factory function to create the appropriate repository instance
 * This allows easy switching between in-memory and SQLite implementations
 */
export function createPlaylistRepository(useSQLite: boolean = true): IPlaylistRepository {
  if (useSQLite) {
    return new SQLitePlaylistRepository();
  }
  return new InMemoryPlaylistRepository();
}

/**
 * Singleton instance of the repository
 * Uses SQLite by default for persistent storage
 */
export const playlistRepository = createPlaylistRepository();
