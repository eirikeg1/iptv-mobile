import { TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/components/ui/display/icon-symbol';
import { ThemedText } from '@/components/ui/display/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Channel } from '@/types/playlist.types';

interface VideoLoadingStateProps {
  channel: Channel;
}

export function VideoLoadingState({ channel }: VideoLoadingStateProps) {
  const iconColor = useThemeColor({}, 'icon');

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 32,
      }}
    >
      <IconSymbol name="tv" size={64} color={iconColor} />
      <ThemedText
        style={{
          fontSize: 20,
          fontWeight: '600',
          marginTop: 16,
          marginBottom: 8,
          color: '#fff',
          textAlign: 'center',
        }}
      >
        Loading Channel
      </ThemedText>
      <ThemedText
        type="subtitle"
        style={{
          fontSize: 14,
          color: '#ccc',
          textAlign: 'center',
          lineHeight: 20,
        }}
      >
        {channel.name}
      </ThemedText>
    </View>
  );
}

interface VideoErrorStateProps {
  channel: Channel;
  onRetry: () => void;
}

export function VideoErrorState({ onRetry }: VideoErrorStateProps) {
  const iconColor = useThemeColor({}, 'icon');

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 32,
      }}
    >
      <IconSymbol name="exclamationmark.triangle" size={64} color={iconColor} />
      <ThemedText
        style={{
          fontSize: 20,
          fontWeight: '600',
          marginTop: 16,
          marginBottom: 8,
          color: '#fff',
          textAlign: 'center',
        }}
      >
        Unable to Play
      </ThemedText>
      <ThemedText
        type="subtitle"
        style={{
          fontSize: 14,
          color: '#ccc',
          textAlign: 'center',
          lineHeight: 20,
          marginBottom: 24,
        }}
      >
        This channel is currently unavailable
      </ThemedText>
      <TouchableOpacity
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
        }}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Retry playback"
      >
        <ThemedText style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>Retry</ThemedText>
      </TouchableOpacity>
    </View>
  );
}