import type { Channel } from '@/types/playlist.types';

export interface GroupOption {
  name: string;
  channelCount: number;
}

/**
 * Calculate available channel groups from a list of channels
 * Includes an "All Channels" option at the top
 */
export function calculateChannelGroups(channels: Channel[]): GroupOption[] {
  const groupMap = new Map<string, number>();

  channels.forEach((channel) => {
    const groupTitle = channel.group.title || 'Uncategorized';
    groupMap.set(groupTitle, (groupMap.get(groupTitle) || 0) + 1);
  });

  const groupList = Array.from(groupMap.entries())
    .map(([name, channelCount]) => ({ name, channelCount }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return [
    { name: '', channelCount: channels.length },
    ...groupList,
  ];
}