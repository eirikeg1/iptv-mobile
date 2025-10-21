import React, { useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { usePlaylistStore } from '@/states/playlist-store';
import type { Channel } from '@/types/playlist.types';

interface ChannelGridProps {
  selectedGroup?: string;
  searchText?: string;
  onChannelPress?: (channel: Channel) => void;
}

const { width } = Dimensions.get('window');
const PADDING = 16;
const GAP = 8;
const COLUMNS = 4;
const ITEM_WIDTH = (width - PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

export function ChannelGrid({
  selectedGroup,
  searchText = '',
  onChannelPress,
}: ChannelGridProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const activePlaylist = usePlaylistStore((state) => state.getActivePlaylist());

  const filteredChannels = useMemo(() => {
    let channels = activePlaylist?.parsedData?.items || [];

    // Filter by group
    if (selectedGroup) {
      channels = channels.filter((channel) => {
        const channelGroup = channel.group.title || 'Uncategorized';
        return channelGroup === selectedGroup;
      });
    }

    // Filter by search text
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      channels = channels.filter((channel) =>
        channel.name.toLowerCase().includes(searchLower)
      );
    }

    // Limit to first 100 channels to prevent performance issues
    return channels.slice(0, 100);
  }, [activePlaylist, selectedGroup, searchText]);

  const handleChannelPress = useCallback(
    (channel: Channel) => {
      if (onChannelPress) {
        onChannelPress(channel);
      } else if (__DEV__) {
        console.log('Channel pressed:', channel.name);
      }
    },
    [onChannelPress]
  );

  const getChannelInitial = (channelName: string) => {
    return channelName.charAt(0).toUpperCase();
  };

  if (!activePlaylist) {
    return (
      <View style={styles.emptyContainer}>
        <IconSymbol name="tv" size={64} color={isDark ? '#555' : '#ccc'} />
        <Text
          style={[
            styles.emptyTitle,
            { color: isDark ? '#ffffff' : '#000000' },
          ]}
        >
          No Active Playlist
        </Text>
        <Text
          style={[
            styles.emptyText,
            { color: isDark ? '#aaa' : '#666' },
          ]}
        >
          Please add and select a playlist from the settings
        </Text>
      </View>
    );
  }

  if (filteredChannels.length === 0) {
    const isSearching = searchText.trim().length > 0;
    const isFiltering = !!selectedGroup;

    return (
      <View style={styles.emptyContainer}>
        <IconSymbol
          name={isSearching ? 'magnifyingglass' : 'tv'}
          size={64}
          color={isDark ? '#555' : '#ccc'}
        />
        <Text
          style={[
            styles.emptyTitle,
            { color: isDark ? '#ffffff' : '#000000' },
          ]}
        >
          {isSearching ? 'No Results' : 'No Channels'}
        </Text>
        <Text
          style={[
            styles.emptyText,
            { color: isDark ? '#aaa' : '#666' },
          ]}
        >
          {isSearching
            ? `No channels found for "${searchText}"`
            : isFiltering
            ? `No channels found in "${selectedGroup}" group`
            : "This playlist doesn't contain any channels"}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {filteredChannels.map((channel, index) => {
          const hasLogo = !!channel.tvg.logo;
          const initial = getChannelInitial(channel.name);

          return (
            <View key={`channel-${index}`} style={styles.gridItem}>
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
                  <View
                    style={[
                      styles.channelIcon,
                      styles.fallbackIcon,
                      {
                        backgroundColor: isDark ? '#444' : '#ddd',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.fallbackText,
                        {
                          color: isDark ? '#ffffff' : '#000000',
                        },
                      ]}
                    >
                      {initial}
                    </Text>
                  </View>
                )}

                <Text
                  style={[
                    styles.channelName,
                    {
                      color: isDark ? '#ffffff' : '#000000',
                    },
                  ]}
                  numberOfLines={2}
                >
                  {channel.name}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: PADDING,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: ITEM_WIDTH,
    marginBottom: GAP,
  },
  channelItem: {
    alignItems: 'center',
    paddingVertical: 4,
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
    height: 26, // Fixed height for consistent alignment
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