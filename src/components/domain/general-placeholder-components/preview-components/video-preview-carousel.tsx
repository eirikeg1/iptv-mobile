import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';

const data = [...new Array(6).keys()];
const windowWidth = Dimensions.get('window').width;
const itemWidth = 160; // w-40 = 160px (40 * 4px)
const itemHeight = 160; // h-40 = 160px

const baseOptions = {
  parallaxScrollingOffset: windowWidth * 0.68,
  parallaxScrollingScale: 1,
  parallaxAdjacentItemScale: 0.8,
};

export function VideoPreviewCarousel(props: any) {
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);

  return (
    <View>
      <Carousel
        ref={ref}
        defaultIndex={1}
        width={windowWidth}
        height={itemHeight}
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
      ;
    </View>
  );
}
