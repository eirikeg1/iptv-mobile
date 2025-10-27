import { useFocusEffect } from '@react-navigation/native';
import { useVideoPlayer } from 'expo-video';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import type { Channel } from '@/types/playlist.types';
import { VIDEO_CONSTANTS } from '../constants';
import type { VideoError, RetryState } from '../types/video-error.types';
import { getVideoErrorInfo, calculateRetryDelay } from '../types/video-error.types';
import { checkNetworkConnectivity, subscribeToNetworkChanges, isNetworkSuitableForStreaming, type NetworkState } from '../utils/network-utils';

interface UseVideoPlayerProps {
  channel: Channel;
  onStopVideo?: () => void;
  onRegisterStopFunction?: (stopFn: () => void) => void;
}

export function useVideoPlayerLogic({ channel, onStopVideo, onRegisterStopFunction }: UseVideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState<'connecting' | 'buffering' | 'preparing'>('connecting');
  const [loadingProgress, setLoadingProgress] = useState<number>();
  const [hasError, setHasError] = useState(false);
  const [videoError, setVideoError] = useState<VideoError | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [networkState, setNetworkState] = useState<NetworkState>({ isConnected: true, type: 'unknown', isWifiEnabled: false });
  const [retryState, setRetryState] = useState<RetryState>({
    attempt: 0,
    maxAttempts: 3,
    baseDelay: 1000,
    isRetrying: false,
  });

  const hideControlsTimeoutRef = useRef<number | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);
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
    }, VIDEO_CONSTANTS.CONTROLS_HIDE_TIMEOUT);
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

  const checkNetworkBeforePlayback = useCallback(async (): Promise<boolean> => {
    try {
      const network = await checkNetworkConnectivity();
      setNetworkState(network);

      if (!network.isConnected) {
        const networkError = getVideoErrorInfo(new Error('No internet connection'), 0);
        setVideoError(networkError);
        setHasError(true);
        setIsLoading(false);
        return false;
      }

      if (!isNetworkSuitableForStreaming(network)) {
        console.warn('Network conditions may not be suitable for streaming');
      }

      return true;
    } catch (error) {
      console.warn('Failed to check network connectivity:', error);
      return true; // Assume network is okay if we can't check
    }
  }, []);

  const retryPlayback = useCallback(async () => {
    if (retryState.isRetrying || retryState.attempt >= retryState.maxAttempts) {
      return;
    }

    setRetryState(prev => ({ ...prev, isRetrying: true }));

    // Check network before retrying
    const networkOk = await checkNetworkBeforePlayback();
    if (!networkOk) {
      setRetryState(prev => ({ ...prev, isRetrying: false }));
      return;
    }

    // Calculate delay for this retry attempt
    const delay = calculateRetryDelay(retryState.attempt, retryState.baseDelay);

    retryTimeoutRef.current = setTimeout(() => {
      if (!isUnmountedRef.current) {
        setHasError(false);
        setVideoError(null);
        setIsLoading(true);
        setLoadingStage('connecting');
        setShowControls(false);
        setIsPlaying(false);
        clearHideControlsTimeout();

        setRetryState(prev => ({
          ...prev,
          attempt: prev.attempt + 1,
          isRetrying: false,
        }));

        player.replay();
      }
    }, delay);
  }, [player, clearHideControlsTimeout, retryState, checkNetworkBeforePlayback]);

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
      if (status === 'loading') {
        setLoadingStage('buffering');
        setLoadingProgress(undefined);
      } else if (status === 'readyToPlay') {
        setIsLoading(false);
        setHasError(false);
        setVideoError(null);
        setRetryState(prev => ({ ...prev, attempt: 0, isRetrying: false })); // Reset retry state on success
        player.play();
        setIsPlaying(true);
        setShowControls(true);
        scheduleHideControls();
      } else if (status === 'error' || error) {
        setIsLoading(false);
        setHasError(true);
        const enhancedError = getVideoErrorInfo(error, retryState.attempt);
        setVideoError(enhancedError);

        // Only show alert for non-retryable errors or after max retries
        if (!enhancedError.canRetry || retryState.attempt >= retryState.maxAttempts) {
          Alert.alert(
            enhancedError.title,
            enhancedError.message + '\n\n' + enhancedError.suggestion,
            [{ text: 'OK' }]
          );
        }

        console.error('Video playback error:', error, 'Enhanced:', enhancedError);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [player, scheduleHideControls, retryState.attempt, retryState.maxAttempts]);

  useEffect(() => {
    onRegisterStopFunction?.(stopVideo);
  }, [onRegisterStopFunction, stopVideo]);

  // Network monitoring
  useEffect(() => {
    const unsubscribe = subscribeToNetworkChanges((newNetworkState) => {
      setNetworkState(newNetworkState);

      // If we regain connection and were in an error state, suggest retry
      if (newNetworkState.isConnected && hasError && videoError?.type === 'NETWORK_ERROR') {
        console.log('Network connection restored, error can be retried');
      }
    });

    // Check initial network state
    checkNetworkBeforePlayback();

    return unsubscribe;
  }, [hasError, videoError?.type, checkNetworkBeforePlayback]);

  useEffect(() => {
    return () => {
      clearHideControlsTimeout();
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
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
    loadingStage,
    loadingProgress,
    hasError,
    videoError,
    showControls,
    showControlsTemporarily,
    stopVideo,
    retryPlayback,
    togglePlayPause,
    clearHideControlsTimeout,
    isPlaying,
    networkState,
    retryState,
  };
}