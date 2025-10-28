import { useCallback } from 'react';
import { useVideoUIStore } from '@/states/video/ui-store';
import { VIDEO_CONSTANTS } from '../../constants';

export function useVideoControls() {
  const {
    showControls,
    setShowControls,
    showControlsTemporarily,
    clearHideControlsTimeout,
  } = useVideoUIStore();

  const scheduleHideControls = useCallback((timeoutMs?: number) => {
    showControlsTemporarily(timeoutMs ?? VIDEO_CONSTANTS.CONTROLS_HIDE_TIMEOUT);
  }, [showControlsTemporarily]);

  const showControlsAndScheduleHide = useCallback(() => {
    setShowControls(true);
    scheduleHideControls();
  }, [setShowControls, scheduleHideControls]);

  const hideControls = useCallback(() => {
    clearHideControlsTimeout();
    setShowControls(false);
  }, [clearHideControlsTimeout, setShowControls]);

  const toggleControls = useCallback(() => {
    if (showControls) {
      hideControls();
    } else {
      showControlsAndScheduleHide();
    }
  }, [showControls, hideControls, showControlsAndScheduleHide]);

  return {
    showControls,
    actions: {
      showControlsTemporarily,
      showControlsAndScheduleHide,
      hideControls,
      toggleControls,
      clearHideControlsTimeout,
      scheduleHideControls,
    },
  };
}