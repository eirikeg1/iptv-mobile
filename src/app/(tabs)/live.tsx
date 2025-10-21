import React, { useState, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { TopBar } from '@/components/domain/live/sticky-top-bar';
import { GroupSelectionModal } from '@/components/domain/live/group-selection-modal';
import { ChannelGrid } from '@/components/domain/live/channel-grid';
import { usePlaylistStore } from '@/states/playlist-store';
import type { Channel } from '@/types/playlist.types';

export default function LiveScreen() {
  const [selectedGroupName, setSelectedGroupName] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);

  const activePlaylist = usePlaylistStore((state) => state.getActivePlaylist());

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

  const handleSearchClear = () => {
    setSearchText('');
  };

  const handleChannelPress = (channel: Channel) => {
    if (__DEV__) {
      console.log('Channel pressed:', channel.name);
    }
    // TODO: Implement channel playback
  };

  return (
    <View style={styles.container}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
        headerImage={
          <IconSymbol
            size={310}
            color="#808080"
            name="play.tv"
            style={styles.headerImage}
          />
        }
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Live TV</ThemedText>
        </ThemedView>

        <TopBar
          selectedGroupName={selectedGroupName}
          onGroupSelectorPress={() => setIsGroupModalVisible(true)}
          searchText={searchText}
          onSearchTextChange={handleSearchTextChange}
          onSearchClear={handleSearchClear}
        />

        <ChannelGrid
          selectedGroup={selectedGroupName || undefined}
          searchText={searchText}
          onChannelPress={handleChannelPress}
        />
      </ParallaxScrollView>

      <GroupSelectionModal
        visible={isGroupModalVisible}
        onClose={() => setIsGroupModalVisible(false)}
        groups={groups}
        selectedGroupName={selectedGroupName}
        onGroupSelect={handleGroupSelect}
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
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
});
