import type { Playlist as IPTVPlaylist } from 'iptv-playlist-parser';

/**
 * Credentials for accessing authenticated IPTV playlists
 */
export interface PlaylistCredentials {
  username: string;
  password: string;
}

/**
 * Individual channel from parsed playlist
 */
export interface Channel {
  name: string;
  url: string;
  tvg: {
    id?: string;
    name?: string;
    logo?: string;
    country?: string;
    language?: string;
    url?: string;
  };
  group: {
    title?: string;
  };
  http?: {
    referrer?: string;
    userAgent?: string;
  };
}

/**
 * Parsed playlist data from iptv-playlist-parser
 */
export type ParsedPlaylist = IPTVPlaylist;

/**
 * Main playlist entity stored in the application
 */
export interface Playlist {
  id: string;
  name: string;
  url: string;
  credentials?: PlaylistCredentials;
  parsedData?: ParsedPlaylist;
  channelCount?: number;
  createdAt: Date;
  updatedAt: Date;
  lastFetchedAt?: Date;
}

/**
 * DTO for creating a new playlist
 */
export interface CreatePlaylistInput {
  name: string;
  url: string;
  credentials?: PlaylistCredentials;
}

/**
 * DTO for updating an existing playlist
 */
export interface UpdatePlaylistInput {
  name?: string;
  url?: string;
  credentials?: PlaylistCredentials;
}

/**
 * State for playlist operations
 */
export enum PlaylistStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}
