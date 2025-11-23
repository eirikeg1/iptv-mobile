import { useEffect, useRef, useState } from 'react';
import { usePlaylistStore } from '@/states/playlist/playlist-store';
import type { Playlist } from '@/types/playlist.types';

export function usePlaylistData() {
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [hasLoadedPlaylist, setHasLoadedPlaylist] = useState<boolean>(false);
  const isMountedRef = useRef(true);

  const getActivePlaylist = usePlaylistStore((state) => state.getActivePlaylist);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const loadPlaylistData = () => {
      try {
        const playlist = getActivePlaylist();
        if (isMountedRef.current) {
          setActivePlaylist(playlist);
          setHasLoadedPlaylist(true);
        }
      } catch (error) {
        console.error('Error loading playlist data:', error);
        if (isMountedRef.current) {
          setActivePlaylist(null);
          setHasLoadedPlaylist(true);
        }
      }
    };

    setTimeout(loadPlaylistData, 0);
  }, [getActivePlaylist]);

  return {
    activePlaylist,
    hasLoadedPlaylist,
    isLoadingPlaylist: !hasLoadedPlaylist
  };
}