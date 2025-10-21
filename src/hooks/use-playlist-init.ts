import { useEffect } from 'react';
import { usePlaylistStore } from '@/states/playlist-store';
import { useUserStore } from '@/states/user-store';
import { initializeDatabase } from '@/db/migrations';

/**
 * Hook to initialize the database, users, and playlists on app load
 * This sets up the SQLite database schema and loads stored data
 */
export function usePlaylistInit() {
  const loadPlaylists = usePlaylistStore((state) => state.loadPlaylists);
  const loadUsers = useUserStore((state) => state.loadUsers);

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize database schema (run migrations)
        console.log('[App] Initializing database...');
        await initializeDatabase();
        console.log('[App] Database initialized successfully');

        // Load users
        console.log('[App] Loading users...');
        await loadUsers();
        console.log('[App] Users loaded successfully');

        // Load playlists from database
        console.log('[App] Loading playlists...');
        await loadPlaylists();
        console.log('[App] Playlists loaded successfully');
      } catch (error) {
        console.error('[App] Failed to initialize app:', error);
      }
    };

    init();
  }, [loadPlaylists, loadUsers]);
}
