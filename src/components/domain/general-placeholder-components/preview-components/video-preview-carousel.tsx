import { ThemedText } from '@/components/themed-text';
import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';

export function VideoPreviewCarousel({title}: {title?: string}) {
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);

  const data = [...new Array(6).keys()];
  const [windowWidth, setWindowWidth] = React.useState(Dimensions.get('window').width);
  const itemWidth = 160; // w-40 = 160px (40 * 4px)
  const gap = 16; // gap between items in pixels

  // Update dimensions when orientation changes
  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowWidth(window.width);
    });

    return () => subscription?.remove();
  }, []);

  const baseOptions = {
    parallaxScrollingOffset: windowWidth * 0.6,
    parallaxScrollingScale: 1,
    parallaxAdjacentItemScale: 0.90,
  };

  return (
    <View className="w-full flex flex-col gap-2">
      {title && <ThemedText type="title">{title}</ThemedText>}
      <Carousel
        ref={ref}
        width={windowWidth}
        height={180}
        scrollAnimationDuration={50}
        mode="parallax"
        modeConfig={baseOptions}
        data={data}
        loop={false}
        onProgressChange={progress}
        renderItem={({ index }) => (
          <View className="flex h-40 w-40 items-center justify-center rounded-lg bg-gray-300 dark:bg-gray-700">
            <Text className="text-white">{`Video ${index + 1}`}</Text>
          </View>
        )}
      />
    </View>
  );
}

export default VideoPreviewCarousel;
