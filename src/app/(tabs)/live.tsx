import { useCallback, useMemo, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { LiveTopBar } from '@/components/domain/live/live-top-bar';
import InfiniteParallaxGrid from '@/components/ui/containers/infinite-parallax-grid';
import { IconSymbol } from '@/components/ui/display/icon-symbol';
import { ThemedText } from '@/components/ui/display/themed-text';
import { ThemedView } from '@/components/ui/display/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePlaylistStore } from '@/states/playlist-store';
import type { Channel } from '@/types/playlist.types';
import type { ListRenderItemInfo } from '@shopify/flash-list';

export default function LiveScreen() {
  const [selectedGroupName, setSelectedGroupName] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');

  const activePlaylist = usePlaylistStore((state) => state.getActivePlaylist());

  const iconColor = useThemeColor({}, 'icon');

  // Calculate filtered channels for infinite grid
  const filteredChannels = useMemo(() => {
    let channels = activePlaylist?.parsedData?.items || [];

    // Filter by group
    if (selectedGroupName) {
      channels = channels.filter((channel) => {
        const channelGroup = channel.group.title || 'Uncategorized';
        return channelGroup === selectedGroupName;
      });
    }

    // Filter by search text
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      channels = channels.filter((channel) =>
        channel.name.toLowerCase().includes(searchLower)
      );
    }

    return channels;
  }, [activePlaylist, selectedGroupName, searchText]);

  // Calculate available groups
  const groups = useMemo(() => {
    const channels = activePlaylist?.parsedData?.items || [];
    const groupMap = new Map<string, number>();

    channels.forEach((channel) => {
      const groupTitle = channel.group.title || 'Uncategorized';
      groupMap.set(groupTitle, (groupMap.get(groupTitle) || 0) + 1);
    });

    const groupList = Array.from(groupMap.entries())
      .map(([name, channelCount]) => ({ name, channelCount }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Add "All Channels" option at the top
    return [
      { name: '', channelCount: channels.length },
      ...groupList,
    ];
  }, [activePlaylist]);

  const handleGroupSelect = (groupName: string) => {
    setSelectedGroupName(groupName);
  };

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
  };

  const handleChannelPress = useCallback((channel: Channel) => {
    if (__DEV__) {
      console.log('Channel pressed:', channel.name);
    }
    // TODO: Implement channel playback
  }, []);

  const getChannelInitial = (channelName: string) => {
    return channelName.charAt(0).toUpperCase();
  };

  const keyExtractor = useCallback((item: Channel, index: number) => {
    return `channel-${item.name}-${index}`;
  }, []);

  const renderChannelItem = useCallback(({ item: channel }: ListRenderItemInfo<Channel>) => {
    const hasLogo = !!channel.tvg.logo;
    const initial = getChannelInitial(channel.name);

    return (
      <TouchableOpacity
        style={styles.channelItem}
        onPress={() => handleChannelPress(channel)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${channel.name} channel`}
        accessibilityHint="Tap to play this channel"
      >
        {hasLogo ? (
          <Image
            source={{ uri: channel.tvg.logo }}
            style={styles.channelIcon}
            resizeMode="contain"
            onError={() => {
              // Silently handle image load errors
            }}
          />
        ) : (
          <ThemedView
            style={[
              styles.channelIcon,
              styles.fallbackIcon,
            ]}
          >
            <ThemedText style={styles.fallbackText}>
              {initial}
            </ThemedText>
          </ThemedView>
        )}

        <ThemedText
          style={styles.channelName}
          numberOfLines={2}
        >
          {channel.name}
        </ThemedText>
      </TouchableOpacity>
    );
  }, [handleChannelPress]);

  const EmptyComponent = () => {
    const isSearching = searchText.trim().length > 0;
    const isFiltering = !!selectedGroupName;

    return (
      <ThemedView style={styles.emptyContainer}>
        <IconSymbol
          name={isSearching ? 'magnifyingglass' : 'tv'}
          size={64}
          color={iconColor}
        />
        <ThemedText style={styles.emptyTitle}>
          {isSearching ? 'No Results' : 'No Channels'}
        </ThemedText>
        <ThemedText style={styles.emptyText} type="subtitle">
          {isSearching
            ? `No channels found for "${searchText}"`
            : isFiltering
            ? `No channels found in "${selectedGroupName}" group`
            : "This playlist doesn't contain any channels"}
        </ThemedText>
      </ThemedView>
    );
  };

  if (!activePlaylist) {
    return (
      <View style={styles.container}>
        <ThemedView style={styles.emptyContainer}>
          <IconSymbol name="tv" size={64} color={iconColor} />
          <ThemedText style={styles.emptyTitle}>
            No Active Playlist
          </ThemedText>
          <ThemedText style={styles.emptyText} type="subtitle">
            Please add and select a playlist from the settings
          </ThemedText>
        </ThemedView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <InfiniteParallaxGrid
        data={filteredChannels}
        renderItem={renderChannelItem}
        keyExtractor={keyExtractor}
        headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
        headerImage={
          <IconSymbol
            size={310}
            color="#808080"
            name="play.tv"
            style={styles.headerImage}
          />
        }
        ListHeaderComponentAfterParallax={
          <ThemedView style={styles.contentContainer}>
            <ThemedView style={styles.titleContainer}>
              <ThemedText type="title">Live TV</ThemedText>
            </ThemedView>

            <LiveTopBar
              groups={groups}
              selectedGroupName={selectedGroupName}
              onGroupSelect={handleGroupSelect}
              searchText={searchText}
              onSearchTextChange={handleSearchTextChange}
            />
          </ThemedView>
        }
        columns={4}
        ListEmptyComponent={<EmptyComponent />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  contentContainer: {
    paddingHorizontal: 0,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  channelItem: {
    alignItems: 'center',
    paddingVertical: 4,
    flex: 1,
  },
  channelIcon: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginBottom: 4,
  },
  fallbackIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    fontSize: 20,
    fontWeight: '600',
  },
  channelName: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 13,
    height: 26,
    textAlignVertical: 'top',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
