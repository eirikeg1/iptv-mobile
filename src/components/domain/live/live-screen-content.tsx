import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { LiveTopBar } from '@/components/domain/live/live-top-bar';
import { ChannelItem } from '@/components/domain/live/channel-item';
import { LiveEmptyState } from '@/components/domain/live/live-empty-state';
import { LiveLoadingSpinner } from '@/components/domain/live/live-loading-spinner';
import InfiniteParallaxGrid from '@/components/ui/containers/infinite-parallax-grid';
import { IconSymbol } from '@/components/ui/display/icon-symbol';
import { ThemedText } from '@/components/ui/display/themed-text';
import { ThemedView } from '@/components/ui/display/themed-view';
import { isChannelFavorite } from '@/lib/channel-utils';
import type { GroupOption } from '@/lib/group-utils';
import type { Channel, Playlist } from '@/types/playlist.types';
import type { ListRenderItemInfo } from '@shopify/flash-list';

interface LiveScreenContentProps {
  isLoading: boolean;
  playlist: Playlist | null;
  channels: Channel[];
  favoriteChannels: string[];
  groups: GroupOption[];
  selectedGroup: string;
  searchText: string;
  isRefreshing: boolean;
  onGroupSelect: (groupName: string) => void;
  onSearchChange: (text: string) => void;
  onChannelPress: (channel: Channel) => void;
  onRefresh: () => Promise<void>;
  backgroundColor: string;
  iconColor: string;
  tintColor: string;
}

export function LiveScreenContent({
  isLoading,
  playlist,
  channels,
  favoriteChannels,
  groups,
  selectedGroup,
  searchText,
  isRefreshing,
  onGroupSelect,
  onSearchChange,
  onChannelPress,
  onRefresh,
  backgroundColor,
  iconColor,
  tintColor,
}: LiveScreenContentProps) {
  const keyExtractor = useCallback((item: Channel, index: number) => {
    return `channel-${item.name}-${index}`;
  }, []);

  const renderChannelItem = useCallback(({ item: channel }: ListRenderItemInfo<Channel>) => {
    const isFavorite = isChannelFavorite(channel, favoriteChannels);

    return (
      <ChannelItem
        channel={channel}
        isFavorite={isFavorite}
        onPress={onChannelPress}
      />
    );
  }, [favoriteChannels, onChannelPress]);

  const EmptyComponent = useCallback(() => {
    return (
      <LiveEmptyState
        searchText={searchText}
        selectedGroupName={selectedGroup}
        iconColor={iconColor}
      />
    );
  }, [searchText, selectedGroup, iconColor]);

  const LoadingComponent = useCallback(() => {
    return (
      <LiveLoadingSpinner
        isLoading={isLoading}
        tintColor={tintColor}
      />
    );
  }, [isLoading, tintColor]);

  // Show loading spinner if data hasn't loaded yet
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <InfiniteParallaxGrid
          data={[]}
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
            <ThemedView style={[styles.contentContainer, styles.gridBackground]}>
              <LiveTopBar
                groups={groups}
                selectedGroupName={selectedGroup}
                onGroupSelect={onGroupSelect}
                searchText={searchText}
                onSearchTextChange={onSearchChange}
              />
            </ThemedView>
          }
          columns={4}
          ListEmptyComponent={<LoadingComponent />}
          refreshing={isRefreshing}
          onRefresh={onRefresh}
        />
      </View>
    );
  }

  // Show no playlist message only when we've confirmed there's no playlist
  if (!playlist) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
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

  // Show channels with full functionality
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <InfiniteParallaxGrid
        data={channels}
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
          <ThemedView style={[styles.contentContainer, styles.gridBackground]}>
            <LiveTopBar
              groups={groups}
              selectedGroupName={selectedGroup}
              onGroupSelect={onGroupSelect}
              searchText={searchText}
              onSearchTextChange={onSearchChange}
            />
          </ThemedView>
        }
        columns={4}
        ListEmptyComponent={<EmptyComponent />}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
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
  gridBackground: {
    flex: 1,
    minHeight: '100%',
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