import { useEffect } from 'react';
import { usePlaylistStore } from '@/states/playlist-store';

/**
 * Hook to initialize playlists on app load
 * This loads any stored playlists from the repository
 */
export function usePlaylistInit() {
  const loadPlaylists = usePlaylistStore((state) => state.loadPlaylists);

  useEffect(() => {
    // Load playlists when the app starts
    loadPlaylists().catch((error) => {
      console.error('Failed to load playlists on app init:', error);
    });
  }, [loadPlaylists]);
}
