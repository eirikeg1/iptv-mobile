import parser from 'iptv-playlist-parser';
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
   * Fetch playlist content from a URL
   * Supports optional authentication via credentials
   * @throws {Error} If URL is invalid, network request fails, or content is empty
   */
  static async fetchPlaylistContent(
    url: string,
    credentials?: PlaylistCredentials
  ): Promise<string> {
    // Validate URL before attempting fetch
    if (!this.validateUrl(url)) {
      throw new Error('Invalid URL format. Please provide a valid HTTP or HTTPS URL.');
    }

    try {
      // Build URL with credentials if provided
      const fetchUrl = credentials
        ? this.buildAuthenticatedUrl(url, credentials)
        : url;

      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-mpegURL',
          Accept: 'application/x-mpegURL, text/plain, */*',
        },
      });

      if (!response.ok) {
        // Provide more specific error messages based on status code
        if (
          response.status === HTTP_STATUS.UNAUTHORIZED ||
          response.status === HTTP_STATUS.FORBIDDEN
        ) {
          throw new Error('Authentication failed. Please check your credentials.');
        } else if (response.status === HTTP_STATUS.NOT_FOUND) {
          throw new Error('Playlist not found. Please verify the URL.');
        } else if (response.status >= HTTP_STATUS.SERVER_ERROR) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      const content = await response.text();

      if (!content || content.trim().length === 0) {
        throw new Error('Playlist content is empty');
      }

      return content;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      if (error instanceof Error) {
        throw error; // Re-throw our custom errors
      }
      throw new Error('Unknown error occurred while fetching playlist');
    }
  }

  /**
   * Parse M3U playlist content using iptv-playlist-parser
   * @throws {Error} If content is invalid or parsing fails
   */
  static parsePlaylistContent(content: string): ParsedPlaylist {
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw new Error('Invalid playlist content: content is empty or not a string');
    }

    try {
      const parsed = parser.parse(content);

      if (!parsed || !parsed.items || parsed.items.length === 0) {
        throw new Error('No channels found in playlist. Please verify the M3U format.');
      }

      return parsed;
    } catch (error) {
      if (error instanceof Error) {
        // Don't wrap our own errors
        if (error.message.startsWith('No channels found') || error.message.startsWith('Invalid playlist')) {
          throw error;
        }
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
   * Build URL with embedded credentials
   * Converts: https://example.com/playlist.m3u + {user, pass}
   * To: https://user:pass@example.com/playlist.m3u
   */
  private static buildAuthenticatedUrl(
    url: string,
    credentials: PlaylistCredentials
  ): string {
    try {
      const urlObj = new URL(url);

      // Add or replace credentials
      urlObj.username = encodeURIComponent(credentials.username);
      urlObj.password = encodeURIComponent(credentials.password);

      return urlObj.toString();
    } catch {
      // If URL parsing fails, return original URL
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
