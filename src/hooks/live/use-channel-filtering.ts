import { useMemo, useState } from 'react';
import { filterChannelsByGroup, filterChannelsBySearch, sortChannelsWithFavorites } from '@/lib/channel-utils';
import { calculateChannelGroups } from '@/lib/group-utils';
import type { Channel } from '@/types/playlist.types';

export function useChannelFiltering(channels: Channel[], favoriteChannels: string[]) {
  const [selectedGroupName, setSelectedGroupName] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');

  const filteredChannels = useMemo(() => {
    let filteredChannels = channels;

    filteredChannels = filterChannelsByGroup(filteredChannels, selectedGroupName);
    filteredChannels = filterChannelsBySearch(filteredChannels, searchText);
    filteredChannels = sortChannelsWithFavorites(filteredChannels, favoriteChannels);

    return filteredChannels;
  }, [channels, selectedGroupName, searchText, favoriteChannels]);

  const groups = useMemo(() => {
    return calculateChannelGroups(channels);
  }, [channels]);

  const handleGroupSelect = (groupName: string) => {
    setSelectedGroupName(groupName);
  };

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
  };

  return {
    filteredChannels,
    groups,
    selectedGroupName,
    searchText,
    handleGroupSelect,
    handleSearchTextChange,
    setSelectedGroupName,
    setSearchText
  };
}