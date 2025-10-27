import { useFocusEffect } from '@react-navigation/native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';

import { IconSymbol } from '@/components/ui/display/icon-symbol';
import { ThemedText } from '@/components/ui/display/themed-text';
import { ThemedView } from '@/components/ui/display/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Channel } from '@/types/playlist.types';

interface VideoPlayerProps {
  channel: Channel;
  onBack?: () => void;
  onStopVideo?: () => void;
  onRegisterStopFunction?: (stopFn: () => void) => void;
}

export function VideoPlayer({ channel, onBack, onStopVideo, onRegisterStopFunction }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const hideControlsTimeoutRef = useRef<number | null>(null);
  const iconColor = useThemeColor({}, 'icon');

  const player = useVideoPlayer(channel.url, (player) => {
    player.loop = false;
    player.muted = false;
  });

  const clearHideControlsTimeout = useCallback(() => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
      hideControlsTimeoutRef.current = null;
    }
  }, []);

  const scheduleHideControls = useCallback(() => {
    clearHideControlsTimeout();
    hideControlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, [clearHideControlsTimeout]);

  useEffect(() => {
    const subscription = player.addListener('statusChange', ({ status, error }) => {
      if (status === 'readyToPlay') {
        setIsLoading(false);
        setHasError(false);
        player.play();
        // Show controls initially, then auto-hide
        setShowControls(true);
        scheduleHideControls();
      } else if (status === 'error' || error) {
        setIsLoading(false);
        setHasError(true);
        Alert.alert(
          'Playback Error',
          'Unable to play this channel. The stream may be unavailable.',
          [{ text: 'OK' }]
        );
        console.error('Video playback error:', error);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [player, scheduleHideControls]);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    scheduleHideControls();
  }, [scheduleHideControls]);

  const stopVideo = useCallback(() => {
    player.pause();
    clearHideControlsTimeout();
    onStopVideo?.();
  }, [player, clearHideControlsTimeout, onStopVideo]);

  // Register stop function with parent component
  useEffect(() => {
    onRegisterStopFunction?.(stopVideo);
  }, [onRegisterStopFunction, stopVideo]);


  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      clearHideControlsTimeout();
    };
  }, [clearHideControlsTimeout]);

  // Handle screen focus/blur to stop video on navigation away
  useFocusEffect(
    useCallback(() => {
      return () => {
        // Screen is losing focus (user navigating away) - stop video
        player.pause();
        onStopVideo?.();
      };
    }, [player, onStopVideo])
  );

  const renderControls = () => {
    if (!showControls || hasError) return null;

    return (
      <ThemedView style={styles.controlsOverlay} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            clearHideControlsTimeout();
            onBack?.();
          }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <IconSymbol name="chevron.left" size={24} color={iconColor} />
          <ThemedText style={styles.backButtonText}>Back</ThemedText>
        </TouchableOpacity>

        <ThemedView style={styles.centerControls}>
          {!isLoading && (
            <TouchableOpacity
              style={styles.playPauseButton}
              onPress={() => {
                if (player.playing) {
                  player.pause();
                } else {
                  player.play();
                }
                // Reset the auto-hide timer when user interacts with play/pause
                scheduleHideControls();
              }}
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
        </ThemedView>

        <ThemedView style={styles.bottomControls}>
          <ThemedText style={styles.channelName} numberOfLines={1}>
            {channel.name}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  };

  const renderTapOverlay = () => {
    if (showControls || hasError || isLoading) return null;

    return (
      <TouchableOpacity
        style={styles.tapOverlay}
        onPress={showControlsTemporarily}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel="Show video controls"
      />
    );
  };

  const renderLoadingState = () => {
    if (!isLoading) return null;

    return (
      <ThemedView style={styles.stateOverlay}>
        <IconSymbol name="tv" size={64} color={iconColor} />
        <ThemedText style={styles.stateTitle}>Loading Channel</ThemedText>
        <ThemedText style={styles.stateSubtitle} type="subtitle">
          {channel.name}
        </ThemedText>
      </ThemedView>
    );
  };

  const renderErrorState = () => {
    if (!hasError) return null;

    return (
      <ThemedView style={styles.stateOverlay}>
        <IconSymbol name="exclamationmark.triangle" size={64} color={iconColor} />
        <ThemedText style={styles.stateTitle}>Unable to Play</ThemedText>
        <ThemedText style={styles.stateSubtitle} type="subtitle">
          This channel is currently unavailable
        </ThemedText>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setHasError(false);
            setIsLoading(true);
            setShowControls(false);
            clearHideControlsTimeout();
            player.replay();
          }}
          accessibilityRole="button"
          accessibilityLabel="Retry playback"
        >
          <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.videoContainer}>
        <VideoView
          style={styles.video}
          player={player}
          nativeControls={false}
          fullscreenOptions={{ enable: true }}
          allowsPictureInPicture
          contentFit="contain"
        />

        {renderLoadingState()}
        {renderErrorState()}
        {renderControls()}
        {renderTapOverlay()}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  centerControls: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  channelName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  tapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  stateOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 32,
  },
  stateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#fff',
    textAlign: 'center',
  },
  stateSubtitle: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});