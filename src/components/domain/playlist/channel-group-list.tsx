import { useCallback, memo, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ActionCard } from '@/components/ui/action-card';
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
      return (
        <ActionCard
          icon="folder"
          title={item.title}
          subtitle={`${item.channelCount} ${item.channelCount === 1 ? 'channel' : 'channels'}`}
          subtitleIcon="tv"
          onPress={() => handleGroupPress(item)}
          accessibilityLabel={`${item.title} group`}
          accessibilityHint={`View ${item.channelCount} channels in this group`}
        />
      );
    },
    [handleGroupPress]
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
