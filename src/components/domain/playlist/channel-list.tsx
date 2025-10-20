import { useCallback, memo, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { usePlaylistStore } from '@/states/playlist-store';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Channel } from '@/types/playlist.types';

interface ChannelListProps {
  group?: string;
}

export const ChannelList = memo(function ChannelList({ group }: ChannelListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const activePlaylist = usePlaylistStore((state) => state.getActivePlaylist());
  const allChannels = activePlaylist?.parsedData?.items || [];

  // Filter channels by group if provided
  const channels = useMemo(() => {
    if (!group) return allChannels;
    return allChannels.filter((channel) => {
      const channelGroup = channel.group.title || 'Uncategorized';
      return channelGroup === group;
    });
  }, [allChannels, group]);

  const handleChannelPress = useCallback((channel: Channel) => {
    // TODO: Implement channel playback
    console.log('Channel pressed:', channel.name);
  }, []);

  const renderItem = useCallback(({ item }: { item: Channel }) => {
    const cardStyle = [
      styles.channelCard,
      {
        backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
        borderColor: isDark ? '#444' : '#ddd',
      },
    ];

    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={() => handleChannelPress(item)}
        accessibilityRole="button"
        accessibilityLabel={`${item.name} channel`}
        accessibilityHint="Tap to play this channel"
      >
        <View style={styles.channelContent}>
          {item.tvg.logo ? (
            <Image
              source={{ uri: item.tvg.logo }}
              style={styles.channelLogo}
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.channelLogo, styles.placeholderLogo]}>
              <IconSymbol name="tv" size={24} color={isDark ? '#666' : '#999'} />
            </View>
          )}

          <View style={styles.channelInfo}>
            <ThemedText type="defaultSemiBold" style={styles.channelName}>
              {item.name}
            </ThemedText>

            {item.group.title && (
              <View style={styles.channelMeta}>
                <IconSymbol name="folder" size={14} color={isDark ? '#aaa' : '#666'} />
                <ThemedText style={styles.channelGroup}>
                  {item.group.title}
                </ThemedText>
              </View>
            )}

            {(item.tvg.country || item.tvg.language) && (
              <View style={styles.channelMeta}>
                {item.tvg.country && (
                  <ThemedText style={styles.metaText}>
                    {item.tvg.country}
                  </ThemedText>
                )}
                {item.tvg.country && item.tvg.language && (
                  <ThemedText style={styles.metaSeparator}>•</ThemedText>
                )}
                {item.tvg.language && (
                  <ThemedText style={styles.metaText}>
                    {item.tvg.language}
                  </ThemedText>
                )}
              </View>
            )}
          </View>

          <IconSymbol
            name="play.circle"
            size={28}
            color="#007AFF"
            style={styles.playIcon}
          />
        </View>
      </TouchableOpacity>
    );
  }, [isDark, handleChannelPress]);

  const keyExtractor = useCallback((item: Channel, index: number) =>
    `${item.tvg.id || item.name}-${index}`, []
  );

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
      data={channels}
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
    gap: 8,
  },
  channelCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  channelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  channelLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderLogo: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelInfo: {
    flex: 1,
    gap: 4,
  },
  channelName: {
    fontSize: 16,
  },
  channelMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  channelGroup: {
    fontSize: 13,
    opacity: 0.7,
  },
  metaText: {
    fontSize: 12,
    opacity: 0.6,
  },
  metaSeparator: {
    fontSize: 12,
    opacity: 0.6,
    marginHorizontal: 4,
  },
  playIcon: {
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
