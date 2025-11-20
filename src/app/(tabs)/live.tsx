import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { LiveTopBar } from '@/components/domain/live/live-top-bar';
import { FavoriteStar } from '@/components/domain/live/favorite-star';
import InfiniteParallaxGrid from '@/components/ui/containers/infinite-parallax-grid';
import { IconSymbol } from '@/components/ui/display/icon-symbol';
import { ThemedText } from '@/components/ui/display/themed-text';
import { ThemedView } from '@/components/ui/display/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePlaylistStore } from '@/states/playlist/playlist-store';
import { useUserStore } from '@/states/user/user-store';
import { getChannelId } from '@/lib/channel-utils';
import type { Channel } from '@/types/playlist.types';
import type { ListRenderItemInfo } from '@shopify/flash-list';

export default function LiveScreen() {
  const [selectedGroupName, setSelectedGroupName] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [favoriteChannels, setFavoriteChannels] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const isInitialMount = useRef(true);

  const router = useRouter();
  const activePlaylist = usePlaylistStore((state) => state.getActivePlaylist());
  const currentUser = useUserStore((state) => state.currentUser);
  const getFavoriteChannels = useUserStore((state) => state.getFavoriteChannels);
  const migrateFavoritesToNewFormat = useUserStore((state) => state.migrateFavoritesToNewFormat);

  const iconColor = useThemeColor({}, 'icon');

  // Function to load favorites
  const loadFavorites = useCallback(async () => {
    if (currentUser) {
      try {
        // Migrate old favorites if needed
        const channels = activePlaylist?.parsedData?.items || [];
        if (channels.length > 0) {
          await migrateFavoritesToNewFormat(currentUser.id, channels);
        }

        const favorites = await getFavoriteChannels(currentUser.id);
        console.log('[LiveScreen] Loaded', favorites.length, 'favorite channels:', favorites);
        setFavoriteChannels(favorites);
      } catch (error) {
        console.error('Error loading favorite channels:', error);
      }
    } else {
      setFavoriteChannels([]);
    }
  }, [currentUser, getFavoriteChannels, migrateFavoritesToNewFormat, activePlaylist?.parsedData?.items]);

  // Refresh function for pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadFavorites();
    setIsRefreshing(false);
  }, [loadFavorites]);

  // Load favorite channels when user changes
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Handle tab focus for reload functionality
  useFocusEffect(
    useCallback(() => {
      // Don't reload on initial mount, only on subsequent focuses
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }

      // Reload favorites when tab is focused (clicked)
      loadFavorites();
    }, [loadFavorites])
  );

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


    // Sort channels - always prioritize favorites first, then by name
    if (favoriteChannels.length > 0) {
      let favoriteMatches = 0;
      channels = channels.sort((a, b) => {
        const aChannelId = getChannelId(a);
        const bChannelId = getChannelId(b);

        // Check both old formats and new format for backward compatibility
        const aIsFavorite = favoriteChannels.includes(aChannelId) ||
                           favoriteChannels.includes(`${a.name}|${a.url}`) ||
                           favoriteChannels.includes(a.name);
        const bIsFavorite = favoriteChannels.includes(bChannelId) ||
                           favoriteChannels.includes(`${b.name}|${b.url}`) ||
                           favoriteChannels.includes(b.name);

        if (aIsFavorite) favoriteMatches++;
        if (bIsFavorite && !aIsFavorite) favoriteMatches++;

        if (aIsFavorite && !bIsFavorite) return -1;
        if (!aIsFavorite && bIsFavorite) return 1;

        // If both are favorites or both are not favorites, sort by name
        return a.name.localeCompare(b.name);
      });
      console.log(`[LiveScreen] Found ${favoriteMatches} favorite channels in current view`);
    } else {
      // No favorites - just sort by name
      channels = channels.sort((a, b) => a.name.localeCompare(b.name));
    }

    return channels;
  }, [activePlaylist, selectedGroupName, searchText, favoriteChannels]);

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

    // Navigate to video player with channel data
    router.push({
      pathname: '/video-player',
      params: {
        channel: JSON.stringify(channel),
      },
    });
  }, [router]);

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
      <View style={styles.channelItem}>
        <TouchableOpacity
          style={styles.channelButton}
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

        <View style={styles.favoriteContainer}>
          <FavoriteStar
            channelId={getChannelId(channel)}
            channelName={channel.name}
            size={16}
          />
        </View>
      </View>
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
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
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
    position: 'relative',
  },
  channelButton: {
    alignItems: 'center',
    width: '100%',
  },
  favoriteContainer: {
    position: 'absolute',
    top: 2,
    right: 2,
    zIndex: 1,
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
