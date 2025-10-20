import { create } from 'zustand';
import type {
  Playlist,
  CreatePlaylistInput,
  UpdatePlaylistInput,
} from '@/types/playlist.types';
import { PlaylistService } from '@/services/playlist-service';
import { playlistRepository } from '@/db/playlist-repository';
import { generatePlaylistId, sanitizePlaylistName } from '@/lib/playlist-utils';

interface PlaylistState {
  playlists: Playlist[];
  activePlaylistId: string | null;
  isLoading: boolean;
  error: string | null;

  addPlaylist: (input: CreatePlaylistInput) => Promise<void>;
  removePlaylist: (id: string) => Promise<void>;
  setActivePlaylist: (id: string | null) => void;
  refreshPlaylist: (id: string) => Promise<void>;
  updatePlaylist: (id: string, updates: UpdatePlaylistInput) => Promise<void>;
  loadPlaylists: () => Promise<void>;

  getActivePlaylist: () => Playlist | null;
  getPlaylistById: (id: string) => Playlist | null;
}
export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: [],
  activePlaylistId: null,
  isLoading: false,
  error: null,

  addPlaylist: async (input: CreatePlaylistInput) => {
    if (!input.name?.trim()) {
      const error = new Error('Playlist name is required');
      set({ error: error.message });
      throw error;
    }

    if (!input.url?.trim()) {
      const error = new Error('Playlist URL is required');
      set({ error: error.message });
      throw error;
    }

    set({ isLoading: true, error: null });

    try {
      if (!PlaylistService.validateUrl(input.url)) {
        throw new Error('Invalid URL format');
      }

      const existingPlaylist = get().playlists.find(
        (p) => p.url.toLowerCase() === input.url.toLowerCase()
      );
      if (existingPlaylist) {
        throw new Error(`Playlist from this URL already exists: "${existingPlaylist.name}"`);
      }

      const parsedData = await PlaylistService.fetchAndParsePlaylist(
        input.url,
        input.credentials
      );

      const validation = PlaylistService.validateParsedData(parsedData);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      const now = new Date();
      const playlist: Playlist = {
        id: generatePlaylistId(),
        name: sanitizePlaylistName(input.name),
        url: input.url.trim(),
        credentials: input.credentials,
        parsedData,
        channelCount: PlaylistService.getChannelCount(parsedData),
        createdAt: now,
        updatedAt: now,
        lastFetchedAt: now,
      };

      await playlistRepository.create(playlist);

      set((state) => ({
        playlists: [...state.playlists, playlist],
        isLoading: false,
        error: null,
        activePlaylistId: state.playlists.length === 0 ? playlist.id : state.activePlaylistId,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to add playlist';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  removePlaylist: async (id: string) => {
    if (!id) {
      const error = new Error('Playlist ID is required');
      set({ error: error.message });
      throw error;
    }

    set({ isLoading: true, error: null });

    try {
      await playlistRepository.delete(id);

      set((state) => ({
        playlists: state.playlists.filter((p) => p.id !== id),
        activePlaylistId:
          state.activePlaylistId === id
            ? state.playlists.find((p) => p.id !== id)?.id ?? null
            : state.activePlaylistId,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to remove playlist';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  setActivePlaylist: (id: string | null) => {
    if (id !== null) {
      const playlist = get().playlists.find((p) => p.id === id);
      if (!playlist) {
        set({ error: 'Playlist not found' });
        return;
      }
    }
    set({ activePlaylistId: id, error: null });
  },

  refreshPlaylist: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const playlist = get().getPlaylistById(id);
      if (!playlist) {
        throw new Error('Playlist not found');
      }

      const parsedData = await PlaylistService.fetchAndParsePlaylist(
        playlist.url,
        playlist.credentials
      );

      const validation = PlaylistService.validateParsedData(parsedData);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      const updated = await playlistRepository.update(id, {
        parsedData,
        channelCount: PlaylistService.getChannelCount(parsedData),
        lastFetchedAt: new Date(),
      });

      set((state) => ({
        playlists: state.playlists.map((p) => (p.id === id ? updated : p)),
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to refresh playlist';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updatePlaylist: async (id: string, updates: UpdatePlaylistInput) => {
    set({ isLoading: true, error: null });

    try {
      let parsedData;
      let channelCount;

      if (updates.url || updates.credentials) {
        const playlist = get().getPlaylistById(id);
        if (!playlist) {
          throw new Error('Playlist not found');
        }

        const newUrl = updates.url || playlist.url;
        const newCredentials = updates.credentials || playlist.credentials;

        if (updates.url && !PlaylistService.validateUrl(updates.url)) {
          throw new Error('Invalid URL format');
        }

        parsedData = await PlaylistService.fetchAndParsePlaylist(
          newUrl,
          newCredentials
        );

        channelCount = PlaylistService.getChannelCount(parsedData);
      }

      const updateData: Partial<Playlist> = {
        ...updates,
        ...(updates.name && { name: sanitizePlaylistName(updates.name) }),
        ...(parsedData && { parsedData }),
        ...(channelCount !== undefined && { channelCount }),
        ...(parsedData && { lastFetchedAt: new Date() }),
      };

      const updated = await playlistRepository.update(id, updateData);

      set((state) => ({
        playlists: state.playlists.map((p) => (p.id === id ? updated : p)),
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update playlist';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  loadPlaylists: async () => {
    set({ isLoading: true, error: null });

    try {
      const playlists = await playlistRepository.getAll();
      set({
        playlists,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load playlists';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  getActivePlaylist: () => {
    const state = get();
    if (!state.activePlaylistId) return null;
    return state.playlists.find((p) => p.id === state.activePlaylistId) || null;
  },

  getPlaylistById: (id: string) => {
    const state = get();
    return state.playlists.find((p) => p.id === id) || null;
  },
}));
