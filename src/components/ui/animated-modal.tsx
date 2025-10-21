import React, { useEffect, useRef, ReactNode } from 'react';
import { View, Animated, Keyboard, Platform, Easing } from 'react-native';

interface AnimatedModalProps {
  children: ReactNode;
  visible: boolean;
  onClose?: () => void;
}

/**
 * A reusable modal component with smooth entrance/exit animations and keyboard handling
 */
export function AnimatedModal({ children, visible }: AnimatedModalProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Entrance animation
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Exit animation
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, backdropOpacity, opacity, scale]);

  useEffect(() => {
    if (!visible) return;

    const keyboardWillShow = (event: any) => {
      const keyboardHeight = event.endCoordinates.height;
      Animated.spring(translateY, {
        toValue: -keyboardHeight / 3,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }).start();
    };

    const keyboardWillHide = (event: any) => {
      Animated.spring(translateY, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }).start();
    };

    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      keyboardWillShow
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      keyboardWillHide
    );

    return () => {
      showSubscription?.remove();
      hideSubscription?.remove();
    };
  }, [translateY, visible]);

  if (!visible) return null;

  return (
    <Animated.View
      className="absolute inset-0"
      style={{
        opacity: backdropOpacity,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32
      }}
    >
      <View className="absolute inset-0 bg-black/80" />
      <Animated.View
        className="bg-white dark:bg-gray-900 rounded-2xl p-8 w-full max-w-md shadow-2xl"
        style={{
          opacity,
          transform: [
            { scale },
            { translateY }
          ]
        }}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
}