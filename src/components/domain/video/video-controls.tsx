import { TouchableOpacity, View } from 'react-native';
import type { VideoPlayer } from 'expo-video';

import { IconSymbol } from '@/components/ui/display/icon-symbol';
import { ThemedText } from '@/components/ui/display/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Channel } from '@/types/playlist.types';
import { VIDEO_CONSTANTS } from './constants';

interface VideoControlsProps {
  channel: Channel;
  player: VideoPlayer;
  isLoading: boolean;
  isPlaying: boolean;
  onBack?: () => void;
  onTogglePlayPause: () => void;
  onClearTimeout: () => void;
}

export function VideoControls({
  channel,
  player,
  isLoading,
  isPlaying,
  onBack,
  onTogglePlayPause,
  onClearTimeout,
}: VideoControlsProps) {
  const iconColor = useThemeColor({}, 'icon');
  const overlayColor = useThemeColor({ light: 'rgba(0, 0, 0, 0.3)', dark: 'rgba(0, 0, 0, 0.3)' }, 'background');
  const buttonBackground = useThemeColor({ light: 'rgba(0, 0, 0, 0.6)', dark: 'rgba(0, 0, 0, 0.6)' }, 'background');
  const textColor = useThemeColor({ light: '#fff', dark: '#fff' }, 'background');

  return (
    <View
      className="absolute inset-0 justify-between"
      style={{
        backgroundColor: overlayColor,
        paddingTop: VIDEO_CONSTANTS.OVERLAY_PADDING_TOP,
        paddingBottom: VIDEO_CONSTANTS.OVERLAY_PADDING_BOTTOM,
        paddingHorizontal: VIDEO_CONSTANTS.OVERLAY_PADDING_HORIZONTAL,
      }}
    >
      <TouchableOpacity
        className="flex-row items-center self-start"
        style={{
          paddingVertical: VIDEO_CONSTANTS.BACK_BUTTON_PADDING_VERTICAL,
          paddingHorizontal: VIDEO_CONSTANTS.BACK_BUTTON_PADDING_HORIZONTAL,
          backgroundColor: buttonBackground,
          borderRadius: VIDEO_CONSTANTS.BACK_BUTTON_BORDER_RADIUS,
        }}
        onPress={() => {
          onClearTimeout();
          onBack?.();
        }}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <IconSymbol name="chevron.left" size={VIDEO_CONSTANTS.BACK_ICON_SIZE} color={iconColor} />
        <ThemedText
          style={{
            marginLeft: VIDEO_CONSTANTS.BACK_TEXT_MARGIN_LEFT,
            fontSize: VIDEO_CONSTANTS.BACK_TEXT_SIZE,
            fontWeight: '600',
            color: textColor,
          }}
        >
          Back
        </ThemedText>
      </TouchableOpacity>

      <View className="flex-1 justify-center items-center bg-transparent">
        {!isLoading && (
          <TouchableOpacity
            className="justify-center items-center"
            style={{
              width: VIDEO_CONSTANTS.PLAY_BUTTON_SIZE,
              height: VIDEO_CONSTANTS.PLAY_BUTTON_SIZE,
              borderRadius: VIDEO_CONSTANTS.PLAY_BUTTON_RADIUS,
              backgroundColor: buttonBackground,
            }}
            onPress={onTogglePlayPause}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
          >
            <IconSymbol
              name={isPlaying ? 'pause.fill' : 'play.fill'}
              size={VIDEO_CONSTANTS.PLAY_ICON_SIZE}
              color={iconColor}
            />
          </TouchableOpacity>
        )}
      </View>

      <View className="bg-transparent items-center">
        <ThemedText
          style={{
            fontSize: VIDEO_CONSTANTS.CHANNEL_NAME_SIZE,
            fontWeight: '600',
            color: textColor,
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
      className="absolute inset-0 bg-transparent"
      onPress={onTap}
      activeOpacity={1}
      accessibilityRole="button"
      accessibilityLabel="Show video controls"
    />
  );
}