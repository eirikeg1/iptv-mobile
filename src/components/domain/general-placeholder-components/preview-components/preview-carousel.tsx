import { ThemedText } from '@/components/themed-text';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView, View } from 'react-native';
import { VideoCard } from './video-card';

// Carousel layout constants
const CAROUSEL_CONFIG = {
  ITEM_WIDTH: 180,
  OVERLAP: 90,
  PREVIOUS_CARD_PEEK: 30,
  SCROLL_EVENT_THROTTLE: 16,
} as const;

interface VideoPreviewCarouselProps {
  data: number[];
  title?: string;
}

export function VideoPreviewCarousel({ title, data }: VideoPreviewCarouselProps) {
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);


  const snapInterval = useMemo(
    () => CAROUSEL_CONFIG.ITEM_WIDTH - CAROUSEL_CONFIG.OVERLAP,
    []
  );

  // Handle window dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  // Handle scroll events to update active index
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollPosition = event.nativeEvent.contentOffset.x;
      const newIndex = Math.round(scrollPosition / snapInterval);

      if (newIndex !== activeIndex && newIndex >= 0 && newIndex < data.length) {
        setActiveIndex(newIndex);
      }
    },
    [activeIndex, data.length, snapInterval]
  );

  // Handle card press to scroll to selected card
  const handleCardPress = useCallback(
    (index: number) => {
      if (index === activeIndex) {
        return; // Card is already active
      }

      const targetPosition = index * snapInterval;
      scrollViewRef.current?.scrollTo({
        x: targetPosition,
        animated: true,
      });
      setActiveIndex(index);
    },
    [activeIndex, snapInterval]
  );

  const contentContainerStyle = useMemo(
    () => ({
      paddingLeft: CAROUSEL_CONFIG.PREVIOUS_CARD_PEEK,
      paddingRight: windowWidth - CAROUSEL_CONFIG.ITEM_WIDTH - CAROUSEL_CONFIG.PREVIOUS_CARD_PEEK,
    }),
    [windowWidth]
  );

  return (
    <View className="w-full flex flex-col gap-2">
      {title && <ThemedText type="title">{title}</ThemedText>}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapInterval}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={CAROUSEL_CONFIG.SCROLL_EVENT_THROTTLE}
        contentContainerStyle={contentContainerStyle}
        nestedScrollEnabled={true}
      >
        {data.map((item, index) => (
          <VideoCard
            key={item}
            isActive={index === activeIndex}
            displayIndex={item + 1}
            itemWidth={CAROUSEL_CONFIG.ITEM_WIDTH}
            index={index}
            activeIndex={activeIndex}
            totalItems={data.length}
            overlap={CAROUSEL_CONFIG.OVERLAP}
            onPress={() => handleCardPress(index)}
          />
        ))}
      </ScrollView>
      <ThemedText
        type="default"
        className="text-gray-400 pl-4"
      >
        {`Video ${activeIndex + 1}`} 
        
      </ThemedText>
    </View>
  );
}

export default VideoPreviewCarousel;
