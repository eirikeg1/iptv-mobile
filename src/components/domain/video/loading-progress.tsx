import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

import { IconSymbol } from '@/components/ui/display/icon-symbol';
import { ThemedText } from '@/components/ui/display/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Channel } from '@/types/playlist.types';

import { VIDEO_CONSTANTS } from './constants';

interface LoadingProgressProps {
  channel: Channel;
  stage: 'connecting' | 'buffering' | 'preparing';
  progress?: number;
  networkType?: string;
}

const LOADING_STAGES = {
  connecting: {
    icon: 'wifi',
    title: 'Connecting to Stream',
    subtitle: 'Establishing connection...',
  },
  buffering: {
    icon: 'arrow.down.circle',
    title: 'Buffering Content',
    subtitle: 'Loading video data...',
  },
  preparing: {
    icon: 'tv',
    title: 'Preparing Video',
    subtitle: 'Getting ready to play...',
  },
} as const;

export function LoadingProgress({ channel, stage, progress, networkType }: LoadingProgressProps) {
  const iconColor = useThemeColor({}, 'icon');
  const overlayBackground = useThemeColor({ light: 'rgba(0, 0, 0, 0.8)', dark: 'rgba(0, 0, 0, 0.8)' }, 'background');
  const titleColor = useThemeColor({ light: '#fff', dark: '#fff' }, 'background');
  const subtitleColor = useThemeColor({ light: '#ccc', dark: '#ccc' }, 'background');
  const progressColor = useThemeColor({ light: '#007AFF', dark: '#3b82f6' }, 'tint');

  const [dots, setDots] = useState('');
  const pulseScale = useSharedValue(1);
  const progressWidth = useSharedValue(0);

  const stageInfo = LOADING_STAGES[stage];

  // Animated dots for loading text
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Pulse animation for icon
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      false
    );
  }, [pulseScale]);

  // Progress bar animation
  useEffect(() => {
    if (progress !== undefined) {
      progressWidth.value = withTiming(progress, { duration: 300 });
    }
  }, [progress, progressWidth]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <View
      className="absolute inset-0 justify-center items-center"
      style={{
        backgroundColor: overlayBackground,
        padding: VIDEO_CONSTANTS.STATE_CONTAINER_PADDING,
      }}
    >
      <Animated.View style={iconAnimatedStyle}>
        <IconSymbol name={stageInfo.icon} size={VIDEO_CONSTANTS.STATE_ICON_SIZE} color={iconColor} />
      </Animated.View>

      <ThemedText
        style={{
          fontSize: VIDEO_CONSTANTS.LOADING_TITLE_SIZE,
          fontWeight: '600',
          marginTop: VIDEO_CONSTANTS.STATE_TITLE_MARGIN_TOP,
          marginBottom: VIDEO_CONSTANTS.STATE_TITLE_MARGIN_BOTTOM,
          color: titleColor,
          textAlign: 'center',
        }}
      >
        {stageInfo.title}{dots}
      </ThemedText>

      <ThemedText
        type="subtitle"
        style={{
          fontSize: VIDEO_CONSTANTS.SUBTITLE_SIZE,
          color: subtitleColor,
          textAlign: 'center',
          lineHeight: VIDEO_CONSTANTS.SUBTITLE_LINE_HEIGHT,
          marginBottom: 16,
        }}
      >
        {stageInfo.subtitle}
      </ThemedText>

      {/* Progress bar */}
      {progress !== undefined && (
        <View className="w-full max-w-xs mb-4">
          <View
            className="w-full h-1 rounded-full"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <Animated.View
              className="h-full rounded-full"
              style={[{ backgroundColor: progressColor }, progressAnimatedStyle]}
            />
          </View>
          <ThemedText
            style={{
              fontSize: 12,
              color: subtitleColor,
              textAlign: 'center',
              marginTop: 8,
            }}
          >
            {Math.round(progress)}%
          </ThemedText>
        </View>
      )}

      <ThemedText
        type="subtitle"
        style={{
          fontSize: 12,
          color: subtitleColor,
          textAlign: 'center',
          lineHeight: VIDEO_CONSTANTS.SUBTITLE_LINE_HEIGHT,
        }}
      >
        {channel.name}
        {networkType && ` • ${networkType.toUpperCase()}`}
      </ThemedText>
    </View>
  );
}