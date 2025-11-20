import type { Channel } from '@/types/playlist.types';

/**
 * Generate a consistent unique identifier for a channel
 * Uses tvg.id if available, otherwise falls back to name|url
 */
export function getChannelId(channel: Channel): string {
  if (channel.tvg?.id && channel.tvg.id.trim().length > 0) {
    return channel.tvg.id.trim();
  }

  // Fallback to name|url for channels without tvg.id
  return `${channel.name}|${channel.url}`;
}

/**
 * Generate channel ID for raw parsed items (before type casting)
 * Used during playlist parsing for deduplication
 */
export function getRawChannelId(item: any): string {
  const tvgId = item.tvg?.id || item.tvgId;
  if (tvgId && typeof tvgId === 'string' && tvgId.trim().length > 0) {
    return tvgId.trim();
  }

  // Fallback to name|url
  const name = item.name || '';
  const url = item.url || '';
  return `${name}|${url}`;
}