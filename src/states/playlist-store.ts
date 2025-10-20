import { create } from 'zustand';
import type {
  Playlist,
  CreatePlaylistInput,
  UpdatePlaylistInput,
} from '@/types/playlist.types';
import { PlaylistService } from '@/services/playlist-service';
import { playlistRepository } from '@/db/playlist-repository';
import { generatePlaylistId, sanitizePlaylistName } from '@/lib/playlist-utils';

/**
 * Playlist store state interface
 */
interface PlaylistState {
  // State
  playlists: Playlist[];
  activePlaylistId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  addPlaylist: (input: CreatePlaylistInput) => Promise<void>;
  removePlaylist: (id: string) => Promise<void>;
  setActivePlaylist: (id: string | null) => void;
  refreshPlaylist: (id: string) => Promise<void>;
  updatePlaylist: (id: string, updates: UpdatePlaylistInput) => Promise<void>;
  loadPlaylists: () => Promise<void>;

  // Selectors
  getActivePlaylist: () => Playlist | null;
  getPlaylistById: (id: string) => Playlist | null;
}

/**
 * Zustand store for playlist management
 */
export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  // Initial state
  playlists: [],
  activePlaylistId: null,
  isLoading: false,
  error: null,

  // Actions

  /**
   * Add a new playlist
   * Fetches and parses the playlist from the provided URL
   * @throws {Error} If validation fails, fetch fails, or save fails
   */
  addPlaylist: async (input: CreatePlaylistInput) => {
    console.log('[PlaylistStore] addPlaylist called with:', { name: input.name, url: input.url });

    // Input validation
    if (!input.name || input.name.trim().length === 0) {
      const error = new Error('Playlist name is required');
      set({ error: error.message });
      console.error('[PlaylistStore] Validation error: name required');
      throw error;
    }

    if (!input.url || input.url.trim().length === 0) {
      const error = new Error('Playlist URL is required');
      set({ error: error.message });
      console.error('[PlaylistStore] Validation error: URL required');
      throw error;
    }

    set({ isLoading: true, error: null });
    console.log('[PlaylistStore] Set loading state');

    try {
      // Validate URL
      if (!PlaylistService.validateUrl(input.url)) {
        throw new Error('Invalid URL format');
      }
      console.log('[PlaylistStore] URL validation passed');

      // Check for duplicate URLs
      const existingPlaylist = get().playlists.find(
        (p) => p.url.toLowerCase() === input.url.toLowerCase()
      );
      if (existingPlaylist) {
        throw new Error(`Playlist from this URL already exists: "${existingPlaylist.name}"`);
      }
      console.log('[PlaylistStore] No duplicate found');

      // Fetch and parse playlist
      console.log('[PlaylistStore] Fetching and parsing playlist...');
      const parsedData = await PlaylistService.fetchAndParsePlaylist(
        input.url,
        input.credentials
      );
      console.log('[PlaylistStore] Playlist fetched and parsed, channels:', parsedData.items?.length);

      // Validate parsed data
      const validation = PlaylistService.validateParsedData(parsedData);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }
      console.log('[PlaylistStore] Parsed data validation passed');

      // Create playlist object
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
      console.log('[PlaylistStore] Created playlist object:', { id: playlist.id, name: playlist.name, channelCount: playlist.channelCount });

      // Save to repository
      await playlistRepository.create(playlist);
      console.log('[PlaylistStore] Saved to repository');

      // Update state
      const currentPlaylists = get().playlists;
      console.log('[PlaylistStore] Current playlists count:', currentPlaylists.length);

      set((state) => {
        const newState = {
          playlists: [...state.playlists, playlist],
          isLoading: false,
          error: null,
          // Set as active if it's the first playlist
          activePlaylistId: state.playlists.length === 0 ? playlist.id : state.activePlaylistId,
        };
        console.log('[PlaylistStore] Updating state, new playlists count:', newState.playlists.length);
        return newState;
      });

      console.log('[PlaylistStore] State updated, final playlists count:', get().playlists.length);
    } catch (error) {
      console.error('[PlaylistStore] Error in addPlaylist:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to add playlist';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  /**
   * Remove a playlist by ID
   * @throws {Error} If playlist not found or deletion fails
   */
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
        // If deleting active playlist, clear active or set to first remaining
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

  /**
   * Set the active playlist
   * @param id - Playlist ID to set as active, or null to clear
   */
  setActivePlaylist: (id: string | null) => {
    if (id !== null) {
      // Validate that playlist exists
      const playlist = get().playlists.find((p) => p.id === id);
      if (!playlist) {
        set({ error: 'Playlist not found' });
        return;
      }
    }
    set({ activePlaylistId: id, error: null });
  },

  /**
   * Refresh a playlist (re-fetch and re-parse)
   */
  refreshPlaylist: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const playlist = get().getPlaylistById(id);
      if (!playlist) {
        throw new Error('Playlist not found');
      }

      // Re-fetch and parse
      const parsedData = await PlaylistService.fetchAndParsePlaylist(
        playlist.url,
        playlist.credentials
      );

      // Validate
      const validation = PlaylistService.validateParsedData(parsedData);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      // Update playlist
      const updated = await playlistRepository.update(id, {
        parsedData,
        channelCount: PlaylistService.getChannelCount(parsedData),
        lastFetchedAt: new Date(),
      });

      // Update state
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

  /**
   * Update playlist metadata (name, url, credentials)
   */
  updatePlaylist: async (id: string, updates: UpdatePlaylistInput) => {
    set({ isLoading: true, error: null });

    try {
      // If URL or credentials changed, re-fetch and parse
      let parsedData;
      let channelCount;

      if (updates.url || updates.credentials) {
        const playlist = get().getPlaylistById(id);
        if (!playlist) {
          throw new Error('Playlist not found');
        }

        const newUrl = updates.url || playlist.url;
        const newCredentials = updates.credentials || playlist.credentials;

        // Validate new URL if changed
        if (updates.url && !PlaylistService.validateUrl(updates.url)) {
          throw new Error('Invalid URL format');
        }

        // Fetch and parse with new URL/credentials
        parsedData = await PlaylistService.fetchAndParsePlaylist(
          newUrl,
          newCredentials
        );

        channelCount = PlaylistService.getChannelCount(parsedData);
      }

      // Prepare update object
      const updateData: Partial<Playlist> = {
        ...updates,
        ...(updates.name && { name: sanitizePlaylistName(updates.name) }),
        ...(parsedData && { parsedData }),
        ...(channelCount !== undefined && { channelCount }),
        ...(parsedData && { lastFetchedAt: new Date() }),
      };

      // Update in repository
      const updated = await playlistRepository.update(id, updateData);

      // Update state
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

  /**
   * Load all playlists from repository
   * Useful for initializing the app
   */
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

  // Selectors

  /**
   * Get the currently active playlist
   */
  getActivePlaylist: () => {
    const state = get();
    if (!state.activePlaylistId) return null;
    return state.playlists.find((p) => p.id === state.activePlaylistId) || null;
  },

  /**
   * Get a playlist by ID
   */
  getPlaylistById: (id: string) => {
    const state = get();
    return state.playlists.find((p) => p.id === id) || null;
  },
}));
