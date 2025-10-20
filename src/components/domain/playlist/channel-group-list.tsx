import { useCallback, memo, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { usePlaylistStore } from '@/states/playlist-store';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ChannelGroup {
  title: string;
  channelCount: number;
}

/**
 * Displays channel groups from the active playlist.
 * Groups channels by their group title and shows channel counts.
 */
export const ChannelGroupList = memo(function ChannelGroupList() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const activePlaylist = usePlaylistStore((state) => state.getActivePlaylist());
  const channels = activePlaylist?.parsedData?.items || [];

  const groups = useMemo(() => {
    const groupMap = new Map<string, number>();

    channels.forEach((channel) => {
      const groupTitle = channel.group.title || 'Uncategorized';
      groupMap.set(groupTitle, (groupMap.get(groupTitle) || 0) + 1);
    });

    return Array.from(groupMap.entries())
      .map(([title, channelCount]) => ({ title, channelCount }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [channels]);

  const handleGroupPress = useCallback((group: ChannelGroup) => {
    if (__DEV__) {
      console.log('Group pressed:', group.title, 'with', group.channelCount, 'channels');
    }
  }, []);

  const renderGroupCard = useCallback(
    ({ item }: { item: ChannelGroup }) => {
      const cardStyle = [
        styles.groupCard,
        {
          backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
          borderColor: isDark ? '#444' : '#ddd',
        },
      ];

      return (
        <TouchableOpacity
          style={cardStyle}
          onPress={() => handleGroupPress(item)}
          accessibilityRole="button"
          accessibilityLabel={`${item.title} group`}
          accessibilityHint={`View ${item.channelCount} channels in this group`}
        >
          <View style={styles.groupContent}>
            <View style={[styles.groupIcon, { backgroundColor: isDark ? '#333' : '#e0e0e0' }]}>
              <IconSymbol name="folder" size={32} color={isDark ? '#666' : '#999'} />
            </View>

            <View style={styles.groupInfo}>
              <ThemedText type="defaultSemiBold" style={styles.groupTitle}>
                {item.title}
              </ThemedText>

              <View style={styles.groupMeta}>
                <IconSymbol name="tv" size={16} color={isDark ? '#aaa' : '#666'} />
                <ThemedText style={styles.channelCount}>
                  {item.channelCount} {item.channelCount === 1 ? 'channel' : 'channels'}
                </ThemedText>
              </View>
            </View>

            <IconSymbol
              name="chevron.right"
              size={24}
              color={isDark ? '#666' : '#999'}
              style={styles.chevronIcon}
            />
          </View>
        </TouchableOpacity>
      );
    },
    [isDark, handleGroupPress]
  );

  const keyExtractor = useCallback((item: ChannelGroup) => item.title, []);

  if (!activePlaylist) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <IconSymbol name="tv" size={64} color={isDark ? '#555' : '#ccc'} />
        <ThemedText style={styles.emptyTitle}>No Active Playlist</ThemedText>
        <ThemedText style={styles.emptyText}>
          Please add and select a playlist from the settings
        </ThemedText>
      </ThemedView>
    );
  }

  if (channels.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <IconSymbol name="tv" size={64} color={isDark ? '#555' : '#ccc'} />
        <ThemedText style={styles.emptyTitle}>No Channels</ThemedText>
        <ThemedText style={styles.emptyText}>
          This playlist doesn't contain any channels
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <FlatList
      data={groups}
      renderItem={renderGroupCard}
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
    gap: 8,
  },
  groupCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  groupContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  groupIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupInfo: {
    flex: 1,
    gap: 8,
  },
  groupTitle: {
    fontSize: 18,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  channelCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  chevronIcon: {
    marginLeft: 8,
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
