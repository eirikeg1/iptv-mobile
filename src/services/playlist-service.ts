import parser from 'iptv-playlist-parser';
import { getRawChannelId } from '@/lib/channel-utils';
import type { ParsedPlaylist, PlaylistCredentials } from '@/types/playlist.types';

// HTTP Status codes
const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const;

/**
 * Service for handling IPTV playlist operations
 * Provides static methods for fetching, parsing, and validating IPTV playlists
 */
export class PlaylistService {
  /**
   * Fetch playlist content from a URL.
   * Supports optional HTTP Basic Authentication via credentials parameter.
   * If your URL already contains authentication parameters, pass the full URL without credentials.
   */
  static async fetchPlaylistContent(
    url: string,
    credentials?: PlaylistCredentials
  ): Promise<string> {
    console.log('[PlaylistService] Starting fetch for URL:', url.substring(0, 50) + '...');

    if (!this.validateUrl(url)) {
      console.error('[PlaylistService] URL validation failed:', url);
      throw new Error('Invalid URL format. Please provide a valid HTTP or HTTPS URL.');
    }

    try {
      const fetchUrl = credentials
        ? this.buildAuthenticatedUrl(url, credentials)
        : url;

      console.log('[PlaylistService] Making fetch request...');
      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-mpegURL',
          Accept: 'application/x-mpegURL, text/plain, */*',
        },
      });

      console.log('[PlaylistService] Fetch response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        console.error('[PlaylistService] Response not OK:', response.status);
        if (
          response.status === HTTP_STATUS.UNAUTHORIZED ||
          response.status === HTTP_STATUS.FORBIDDEN
        ) {
          throw new Error('Authentication failed. Please check your credentials or URL.');
        } else if (response.status === HTTP_STATUS.NOT_FOUND) {
          throw new Error('Playlist not found. Please verify the URL.');
        } else if (response.status >= HTTP_STATUS.SERVER_ERROR) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      console.log('[PlaylistService] Reading response text...');
      const content = await response.text();
      console.log('[PlaylistService] Content received, length:', content.length);

      if (!content || content.trim().length === 0) {
        console.error('[PlaylistService] Content is empty');
        throw new Error('Playlist content is empty');
      }

      console.log('[PlaylistService] Content preview:', content.substring(0, 100));
      return content;
    } catch (error) {
      console.error('[PlaylistService] Error during fetch:', error);
      if (error instanceof TypeError) {
        console.error('[PlaylistService] TypeError details:', error.message, error.stack);
        throw new Error('Network error. Please check your internet connection.');
      }
      if (error instanceof Error) {
        console.error('[PlaylistService] Error message:', error.message);
        throw error;
      }
      throw new Error('Unknown error occurred while fetching playlist');
    }
  }

  /**
   * Parse M3U playlist content using iptv-playlist-parser.
   * Handles various playlist formats and provides detailed error messages.
   */
  static parsePlaylistContent(content: string): ParsedPlaylist {
    console.log('[PlaylistService] Starting parse, content length:', content?.length);

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      console.error('[PlaylistService] Invalid content for parsing');
      throw new Error('Invalid playlist content: content is empty or not a string');
    }

    try {
      console.log('[PlaylistService] Calling parser.parse...');
      const parsed = parser.parse(content);
      console.log('[PlaylistService] Parser returned:', {
        hasItems: !!parsed?.items,
        itemsCount: parsed?.items?.length,
      });

      // Deduplicate channels at the source
      if (parsed?.items && Array.isArray(parsed.items)) {
        const originalCount = parsed.items.length;
        const seenChannels = new Map<string, any>();

        parsed.items = parsed.items.filter((item: any) => {
          const channelId = getRawChannelId(item);
          if (seenChannels.has(channelId)) {
            return false;
          }
          seenChannels.set(channelId, item);
          return true;
        });

        if (originalCount !== parsed.items.length) {
          console.log(`[PlaylistService] Removed ${originalCount - parsed.items.length} duplicate channels during parsing`);
        }
      }

      if (!parsed) {
        console.error('[PlaylistService] Parser returned null/undefined');
        throw new Error('Failed to parse playlist. The content may not be in M3U format.');
      }

      if (!parsed.items || !Array.isArray(parsed.items) || parsed.items.length === 0) {
        console.error('[PlaylistService] No items in parsed data');
        throw new Error('No channels found in playlist. Please verify the M3U format.');
      }

      console.log('[PlaylistService] Successfully parsed', parsed.items.length, 'channels');
      return parsed;
    } catch (error) {
      console.error('[PlaylistService] Parse error:', error);
      if (error instanceof Error) {
        if (error.message.startsWith('No channels found') ||
            error.message.startsWith('Invalid playlist') ||
            error.message.startsWith('Failed to parse')) {
          throw error;
        }
        console.error('[PlaylistService] Wrapping parse error:', error.message);
        throw new Error(`Playlist parsing failed: ${error.message}`);
      }
      throw new Error('Unknown error occurred while parsing playlist');
    }
  }

  /**
   * Fetch and parse playlist in one operation
   * @param url - The M3U playlist URL
   * @param credentials - Optional authentication credentials
   * @returns Parsed playlist data
   * @throws {Error} If fetch or parse fails
   */
  static async fetchAndParsePlaylist(
    url: string,
    credentials?: PlaylistCredentials
  ): Promise<ParsedPlaylist> {
    const content = await this.fetchPlaylistContent(url, credentials);
    return this.parsePlaylistContent(content);
  }

  /**
   * Validate playlist URL format
   * @param url - The URL to validate
   * @returns True if valid HTTP/HTTPS URL
   */
  static validateUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
      return false;
    }

    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Validate parsed playlist data
   * @param data - The parsed playlist data to validate
   * @returns Validation result with errors array
   */
  static validateParsedData(data: ParsedPlaylist): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data) {
      errors.push('Parsed data is null or undefined');
    } else {
      if (!data.items || !Array.isArray(data.items)) {
        errors.push('Items array is missing or invalid');
      } else if (data.items.length === 0) {
        errors.push('No channels found in playlist');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Build URL with HTTP Basic Authentication credentials.
   * Converts: https://example.com/playlist.m3u + {user, pass}
   * To: https://user:pass@example.com/playlist.m3u
   *
   * Note: This is only for HTTP Basic Auth. If your URL already has
   * credentials as query parameters (e.g., ?username=X&password=Y),
   * use the URL directly without this method.
   */
  private static buildAuthenticatedUrl(
    url: string,
    credentials: PlaylistCredentials
  ): string {
    try {
      const urlObj = new URL(url);
      urlObj.username = encodeURIComponent(credentials.username);
      urlObj.password = encodeURIComponent(credentials.password);
      return urlObj.toString();
    } catch (error) {
      if (__DEV__) {
        console.warn('Failed to parse URL for authentication:', error);
      }
      return url;
    }
  }

  /**
   * Extract channel count from parsed playlist
   * @param parsedData - The parsed playlist data
   * @returns Number of channels in the playlist
   */
  static getChannelCount(parsedData: ParsedPlaylist): number {
    return parsedData?.items?.length || 0;
  }

  /**
   * Get unique channel groups from parsed playlist
   * @param parsedData - The parsed playlist data
   * @returns Sorted array of unique group names
   */
  static getChannelGroups(parsedData: ParsedPlaylist): string[] {
    if (!parsedData?.items) return [];

    const groups = new Set<string>();
    parsedData.items.forEach((item: ParsedPlaylist['items'][0]) => {
      const groupTitle = item.group?.title;
      if (groupTitle && groupTitle.trim().length > 0) {
        groups.add(groupTitle.trim());
      }
    });

    return Array.from(groups).sort();
  }
}
