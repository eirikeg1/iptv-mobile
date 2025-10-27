import { useFocusEffect } from '@react-navigation/native';
import { useVideoPlayer } from 'expo-video';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import type { Channel } from '@/types/playlist.types';

interface UseVideoPlayerProps {
  channel: Channel;
  onStopVideo?: () => void;
  onRegisterStopFunction?: (stopFn: () => void) => void;
}

export function useVideoPlayerLogic({ channel, onStopVideo, onRegisterStopFunction }: UseVideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const hideControlsTimeoutRef = useRef<number | null>(null);
  const isUnmountedRef = useRef(false);

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

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    scheduleHideControls();
  }, [scheduleHideControls]);

  const stopVideo = useCallback(() => {
    try {
      if (!isUnmountedRef.current && player) {
        player.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.warn('Error stopping video:', error);
    }
    clearHideControlsTimeout();
    onStopVideo?.();
  }, [player, clearHideControlsTimeout, onStopVideo]);

  const retryPlayback = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    setShowControls(false);
    setIsPlaying(false);
    clearHideControlsTimeout();
    player.replay();
  }, [player, clearHideControlsTimeout]);

  const togglePlayPause = useCallback(() => {
    try {
      if (!isUnmountedRef.current && player) {
        if (isPlaying) {
          player.pause();
          setIsPlaying(false);
        } else {
          player.play();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.warn('Error toggling play/pause:', error);
    }
    scheduleHideControls();
  }, [player, isPlaying, scheduleHideControls]);

  useEffect(() => {
    const subscription = player.addListener('statusChange', ({ status, error }) => {
      if (status === 'readyToPlay') {
        setIsLoading(false);
        setHasError(false);
        player.play();
        setIsPlaying(true);
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

  useEffect(() => {
    onRegisterStopFunction?.(stopVideo);
  }, [onRegisterStopFunction, stopVideo]);

  useEffect(() => {
    return () => {
      clearHideControlsTimeout();
    };
  }, [clearHideControlsTimeout]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        try {
          if (!isUnmountedRef.current && player) {
            player.pause();
            setIsPlaying(false);
          }
        } catch (error) {
          console.warn('Error pausing video on focus loss:', error);
        }
        onStopVideo?.();
      };
    }, [player, onStopVideo])
  );

  // Track unmount state
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
    };
  }, []);

  return {
    player,
    isLoading,
    hasError,
    showControls,
    showControlsTemporarily,
    stopVideo,
    retryPlayback,
    togglePlayPause,
    clearHideControlsTimeout,
    isPlaying,
  };
}