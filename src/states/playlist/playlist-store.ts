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
  setActivePlaylist: (id: string | null) => Promise<void>;
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
    console.log('[PlaylistStore] addPlaylist called with:', {
      name: input.name,
      url: input.url?.substring(0, 50) + '...',
      hasCredentials: !!input.credentials,
    });

    if (!input.name?.trim()) {
      console.error('[PlaylistStore] Validation failed: name is empty');
      const error = new Error('Playlist name is required');
      set({ error: error.message });
      throw error;
    }

    if (!input.url?.trim()) {
      console.error('[PlaylistStore] Validation failed: URL is empty');
      const error = new Error('Playlist URL is required');
      set({ error: error.message });
      throw error;
    }

    set({ isLoading: true, error: null });
    console.log('[PlaylistStore] Set loading state to true');

    try {
      console.log('[PlaylistStore] Validating URL...');
      if (!PlaylistService.validateUrl(input.url)) {
        throw new Error('Invalid URL format');
      }

      console.log('[PlaylistStore] Checking for duplicates...');
      const existingPlaylist = get().playlists.find(
        (p) => p.url.toLowerCase() === input.url.toLowerCase()
      );
      if (existingPlaylist) {
        throw new Error(`Playlist from this URL already exists: "${existingPlaylist.name}"`);
      }

      console.log('[PlaylistStore] Fetching and parsing playlist...');
      const parsedData = await PlaylistService.fetchAndParsePlaylist(
        input.url,
        input.credentials
      );
      console.log('[PlaylistStore] Playlist fetched and parsed successfully');

      console.log('[PlaylistStore] Validating parsed data...');
      const validation = PlaylistService.validateParsedData(parsedData);
      if (!validation.valid) {
        console.error('[PlaylistStore] Validation failed:', validation.errors);
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

      console.log('[PlaylistStore] Creating playlist in repository:', {
        id: playlist.id,
        name: playlist.name,
        channelCount: playlist.channelCount,
      });

      await playlistRepository.create(playlist);
      console.log('[PlaylistStore] Playlist saved to repository');

      set((state) => ({
        playlists: [...state.playlists, playlist],
        isLoading: false,
        error: null,
        activePlaylistId: state.playlists.length === 0 ? playlist.id : state.activePlaylistId,
      }));

      console.log('[PlaylistStore] State updated successfully, total playlists:', get().playlists.length);
    } catch (error) {
      console.error('[PlaylistStore] Error in addPlaylist:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to add playlist';
      console.error('[PlaylistStore] Setting error state:', errorMessage);
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

  setActivePlaylist: async (id: string | null) => {
    if (id !== null) {
      const playlist = get().playlists.find((p) => p.id === id);
      if (!playlist) {
        set({ error: 'Playlist not found' });
        return;
      }
    }

    set({ activePlaylistId: id, error: null });

    // Also save to current user's settings
    const { useUserStore } = await import('../user/user-store');
    const currentUser = useUserStore.getState().currentUser;
    if (currentUser) {
      try {
        await useUserStore.getState().updateSettings(currentUser.id, { activePlaylistId: id || undefined });
      } catch (error) {
        console.error('[PlaylistStore] Failed to save active playlist to user settings:', error);
      }
    }
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

      // Load active playlist from current user's settings
      let activePlaylistId: string | null = null;
      try {
        const { useUserStore } = await import('../user/user-store');
        const currentUser = useUserStore.getState().currentUser;
        if (currentUser?.settings?.activePlaylistId) {
          // Check if the saved playlist still exists
          const savedPlaylist = playlists.find(p => p.id === currentUser.settings?.activePlaylistId);
          if (savedPlaylist) {
            activePlaylistId = currentUser.settings.activePlaylistId;
          }
        }
      } catch (error) {
        console.error('[PlaylistStore] Failed to load active playlist from user settings:', error);
      }

      set({
        playlists,
        activePlaylistId,
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
