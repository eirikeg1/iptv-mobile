import { ThemedText } from '@/components/themed-text';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, ScrollView, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface CardProps {
  isActive: boolean;
  displayIndex: number;
  itemWidth: number;
  index: number;
  activeIndex: number;
  totalItems: number;
}

function Card({ isActive, displayIndex, itemWidth, index, activeIndex, totalItems }: CardProps) {
  const INACTIVE_SCALE = 0.8;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withTiming(isActive ? 1.0 : INACTIVE_SCALE, { duration: 200 }) },
      ],
    };
  });

  return (
    <View
      style={{
        width: itemWidth,
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: index > 0 ? -90 : 0,
        // zIndex is highest for active, and decreases based on distance from active
        zIndex: isActive
          ? totalItems + 1
          : totalItems - Math.abs(index - activeIndex),
      }}
    >
      <Animated.View
        style={[
          {
            width: itemWidth,
            height: 160,
          },
          animatedStyle,
        ]}
      >
        <View
          style={{
            width: itemWidth,
            height: 160,
          }}
          className="flex items-center justify-center rounded-lg overflow-hidden bg-gray-300 dark:bg-gray-700"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          />
          <Text className="text-white">{`Video ${displayIndex}`}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

export function VideoPreviewCarousel({ title }: { title?: string }) {
  const data = [...new Array(6).keys()];
  const [windowWidth, setWindowWidth] = React.useState(Dimensions.get('window').width);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const scrollViewRef = React.useRef<ScrollView>(null);

  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  const ITEM_WIDTH = 180;
  const OVERLAP = 90;
  const PREVIOUS_CARD_PEEK = 30;
  const SNAP_INTERVAL = ITEM_WIDTH - OVERLAP;

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(scrollPosition / SNAP_INTERVAL);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < data.length) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <View className="w-full flex flex-col gap-2">
      {title && <ThemedText type="title">{title}</ThemedText>}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingLeft: PREVIOUS_CARD_PEEK,
          paddingRight: windowWidth - ITEM_WIDTH - PREVIOUS_CARD_PEEK,
        }}
      >
        {data.map((item, index) => {
          const isActive = index === activeIndex;
          const displayIndex = item + 1;

          return (
            <Card
              key={item}
              isActive={isActive}
              displayIndex={displayIndex}
              itemWidth={ITEM_WIDTH}
              index={index}
              activeIndex={activeIndex}
              totalItems={data.length}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

export default VideoPreviewCarousel;