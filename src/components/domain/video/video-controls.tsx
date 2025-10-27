import { TouchableOpacity, View } from 'react-native';
import type { VideoPlayer } from 'expo-video';

import { IconSymbol } from '@/components/ui/display/icon-symbol';
import { ThemedText } from '@/components/ui/display/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Channel } from '@/types/playlist.types';

interface VideoControlsProps {
  channel: Channel;
  player: VideoPlayer;
  isLoading: boolean;
  onBack?: () => void;
  onTogglePlayPause: () => void;
  onClearTimeout: () => void;
}

export function VideoControls({
  channel,
  player,
  isLoading,
  onBack,
  onTogglePlayPause,
  onClearTimeout,
}: VideoControlsProps) {
  const iconColor = useThemeColor({}, 'icon');

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'space-between',
        paddingTop: 20,
        paddingBottom: 40,
        paddingHorizontal: 20,
      }}
    >
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          paddingVertical: 8,
          paddingHorizontal: 12,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          borderRadius: 8,
        }}
        onPress={() => {
          onClearTimeout();
          onBack?.();
        }}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <IconSymbol name="chevron.left" size={24} color={iconColor} />
        <ThemedText style={{ marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#fff' }}>
          Back
        </ThemedText>
      </TouchableOpacity>

      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'transparent',
        }}
      >
        {!isLoading && (
          <TouchableOpacity
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={onTogglePlayPause}
            accessibilityRole="button"
            accessibilityLabel={player.playing ? 'Pause' : 'Play'}
          >
            <IconSymbol
              name={player.playing ? 'pause.fill' : 'play.fill'}
              size={48}
              color={iconColor}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={{ backgroundColor: 'transparent', alignItems: 'center' }}>
        <ThemedText
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#fff',
            textAlign: 'center',
          }}
          numberOfLines={1}
        >
          {channel.name}
        </ThemedText>
      </View>
    </View>
  );
}

interface VideoTapOverlayProps {
  onTap: () => void;
}

export function VideoTapOverlay({ onTap }: VideoTapOverlayProps) {
  return (
    <TouchableOpacity
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
      }}
      onPress={onTap}
      activeOpacity={1}
      accessibilityRole="button"
      accessibilityLabel="Show video controls"
    />
  );
}