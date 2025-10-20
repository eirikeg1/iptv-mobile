import { useCallback, memo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { usePlaylistStore } from '@/states/playlist-store';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { extractDomain, getTimeElapsed } from '@/lib/playlist-utils';
import type { Playlist } from '@/types/playlist.types';

export const PlaylistList = memo(function PlaylistList() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const playlists = usePlaylistStore((state) => state.playlists);
  const activePlaylistId = usePlaylistStore((state) => state.activePlaylistId);
  const setActivePlaylist = usePlaylistStore((state) => state.setActivePlaylist);
  const removePlaylist = usePlaylistStore((state) => state.removePlaylist);
  const refreshPlaylist = usePlaylistStore((state) => state.refreshPlaylist);

  const handleDelete = useCallback((playlist: Playlist) => {
    Alert.alert(
      'Delete Playlist',
      `Are you sure you want to delete "${playlist.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removePlaylist(playlist.id);
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to delete playlist'
              );
            }
          },
        },
      ]
    );
  }, [removePlaylist]);

  const handleRefresh = useCallback(async (playlist: Playlist) => {
    try {
      await refreshPlaylist(playlist.id);
      Alert.alert('Success', 'Playlist refreshed successfully');
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to refresh playlist'
      );
    }
  }, [refreshPlaylist]);

  const renderItem = useCallback(({ item }: { item: Playlist }) => {
    const isActive = item.id === activePlaylistId;
    const cardStyle = [
      styles.playlistCard,
      {
        backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
        borderColor: isActive ? '#007AFF' : isDark ? '#444' : '#ddd',
        borderWidth: isActive ? 2 : 1,
      },
    ];

    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={() => setActivePlaylist(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`${item.name} playlist`}
        accessibilityHint={isActive ? 'Active playlist' : 'Tap to set as active playlist'}
        accessibilityState={{ selected: isActive }}
      >
        <View style={styles.playlistHeader}>
          <View style={styles.playlistInfo}>
            <ThemedText type="defaultSemiBold" style={styles.playlistName}>
              {item.name}
            </ThemedText>
            <ThemedText style={styles.playlistUrl}>
              {extractDomain(item.url)}
            </ThemedText>
          </View>

          {isActive && (
            <View style={styles.activeBadge}>
              <ThemedText style={styles.activeBadgeText}>Active</ThemedText>
            </View>
          )}
        </View>

        <View style={styles.playlistDetails}>
          <View style={styles.detailRow}>
            <IconSymbol name="tv" size={16} color={isDark ? '#aaa' : '#666'} />
            <ThemedText style={styles.detailText}>
              {item.channelCount || 0} channels
            </ThemedText>
          </View>

          {item.lastFetchedAt && (
            <View style={styles.detailRow}>
              <IconSymbol name="clock" size={16} color={isDark ? '#aaa' : '#666'} />
              <ThemedText style={styles.detailText}>
                Updated {getTimeElapsed(item.lastFetchedAt)}
              </ThemedText>
            </View>
          )}

          {item.credentials && (
            <View style={styles.detailRow}>
              <IconSymbol name="lock" size={16} color={isDark ? '#aaa' : '#666'} />
              <ThemedText style={styles.detailText}>Authenticated</ThemedText>
            </View>
          )}
        </View>

        <View style={styles.playlistActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleRefresh(item)}
            accessibilityRole="button"
            accessibilityLabel="Refresh playlist"
            accessibilityHint="Re-fetch and update the playlist channels"
          >
            <IconSymbol name="arrow.clockwise" size={20} color="#007AFF" />
            <ThemedText style={styles.actionText}>Refresh</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item)}
            accessibilityRole="button"
            accessibilityLabel="Delete playlist"
            accessibilityHint="Remove this playlist from your library"
          >
            <IconSymbol name="trash" size={20} color="#FF3B30" />
            <ThemedText style={[styles.actionText, styles.deleteText]}>
              Delete
            </ThemedText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }, [activePlaylistId, isDark, setActivePlaylist, handleRefresh, handleDelete]);

  const keyExtractor = useCallback((item: Playlist) => item.id, []);

  if (playlists.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <IconSymbol name="tv" size={64} color={isDark ? '#555' : '#ccc'} />
        <ThemedText style={styles.emptyTitle}>No Playlists</ThemedText>
        <ThemedText style={styles.emptyText}>
          Add your first IPTV playlist to get started
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <FlatList
      data={playlists}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContainer}
      scrollEnabled={false}
      removeClippedSubviews
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
});

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    gap: 12,
  },
  playlistCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  playlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 18,
    marginBottom: 4,
  },
  playlistUrl: {
    fontSize: 14,
    opacity: 0.7,
  },
  activeBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  playlistDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    opacity: 0.7,
  },
  playlistActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  deleteText: {
    color: '#FF3B30',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
});
