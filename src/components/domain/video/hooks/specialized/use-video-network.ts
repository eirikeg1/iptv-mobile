import { useEffect, useCallback } from 'react';
import { useVideoNetworkStore } from '@/states/video/network-store';
import {
  checkNetworkConnectivity,
  subscribeToNetworkChanges,
  isNetworkSuitableForStreaming,
  getNetworkErrorMessage
} from '../../utils/network-utils';

export function useVideoNetwork() {
  const {
    networkState,
    isMonitoring,
    unsubscribe,
    setNetworkState,
    setIsMonitoring,
    setUnsubscribe,
  } = useVideoNetworkStore();

  const checkNetwork = useCallback(async () => {
    try {
      const network = await checkNetworkConnectivity();
      setNetworkState(network);
      return network;
    } catch (error) {
      console.warn('Failed to check network connectivity:', error);
      return networkState; // Return current state if check fails
    }
  }, [setNetworkState, networkState]);

  const startNetworkMonitoring = useCallback(() => {
    if (isMonitoring) return;

    const unsubscribeFn = subscribeToNetworkChanges((newNetworkState) => {
      setNetworkState(newNetworkState);
    });

    setUnsubscribe(unsubscribeFn);
    setIsMonitoring(true);

    // Check initial network state
    checkNetwork();
  }, [isMonitoring, setNetworkState, setUnsubscribe, setIsMonitoring, checkNetwork]);

  const stopNetworkMonitoring = useCallback(() => {
    if (unsubscribe) {
      unsubscribe();
      setUnsubscribe(null);
    }
    setIsMonitoring(false);
  }, [unsubscribe, setUnsubscribe, setIsMonitoring]);

  const isNetworkSuitable = useCallback(() => {
    return isNetworkSuitableForStreaming(networkState);
  }, [networkState]);

  const getNetworkError = useCallback(() => {
    return getNetworkErrorMessage(networkState);
  }, [networkState]);

  // Auto-start monitoring on mount
  useEffect(() => {
    if (isMonitoring) return;

    const unsubscribeFn = subscribeToNetworkChanges((newNetworkState) => {
      setNetworkState(newNetworkState);
    });

    setUnsubscribe(unsubscribeFn);
    setIsMonitoring(true);

    // Check initial network state
    checkNetworkConnectivity().then(setNetworkState).catch(console.warn);

    return () => {
      if (unsubscribeFn) {
        unsubscribeFn();
      }
      setUnsubscribe(null);
      setIsMonitoring(false);
    };
  }, []); // Empty deps - only run on mount/unmount

  return {
    networkState,
    isMonitoring,
    isNetworkSuitable: isNetworkSuitable(),
    networkError: getNetworkError(),
    actions: {
      checkNetwork,
      startNetworkMonitoring,
      stopNetworkMonitoring,
    },
  };
}