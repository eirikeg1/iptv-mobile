import { VideoView } from 'expo-video';
import { View } from 'react-native';

import type { Channel } from '@/types/playlist.types';
import { useVideoPlayerLogic } from './hooks/use-video-player';
import { VideoControls, VideoTapOverlay } from './video-controls';
import { VideoErrorState, VideoLoadingState } from './video-states';

interface VideoPlayerProps {
  channel: Channel;
  onBack?: () => void;
  onStopVideo?: () => void;
  onRegisterStopFunction?: (stopFn: () => void) => void;
}

export function VideoPlayer({ channel, onBack, onStopVideo, onRegisterStopFunction }: VideoPlayerProps) {
  const {
    player,
    isLoading,
    hasError,
    showControls,
    showControlsTemporarily,
    retryPlayback,
    togglePlayPause,
    clearHideControlsTimeout,
    isPlaying,
  } = useVideoPlayerLogic({
    channel,
    onStopVideo,
    onRegisterStopFunction,
  });


  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={{ flex: 1 }}>
        <VideoView
          style={{ flex: 1, width: '100%', height: '100%' }}
          player={player}
          nativeControls={false}
          fullscreenOptions={{ enable: true }}
          allowsPictureInPicture
          contentFit="contain"
        />

        {isLoading && <VideoLoadingState channel={channel} />}
        {hasError && <VideoErrorState channel={channel} onRetry={retryPlayback} />}
        {showControls && !hasError && (
          <VideoControls
            channel={channel}
            player={player}
            isLoading={isLoading}
            isPlaying={isPlaying}
            onBack={onBack}
            onTogglePlayPause={togglePlayPause}
            onClearTimeout={clearHideControlsTimeout}
          />
        )}
        {!showControls && !hasError && !isLoading && (
          <VideoTapOverlay onTap={showControlsTemporarily} />
        )}
      </View>
    </View>
  );
}

