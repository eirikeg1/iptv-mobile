import React, { useEffect, useRef, ReactNode } from 'react';
import { View, Animated, Keyboard, Platform } from 'react-native';

interface AnimatedModalProps {
  children: ReactNode;
  visible: boolean;
  onClose?: () => void;
}

/**
 * A reusable modal component that smoothly animates when the keyboard appears/disappears
 */
export function AnimatedModal({ children, visible }: AnimatedModalProps) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    const keyboardWillShow = (event: any) => {
      const keyboardHeight = event.endCoordinates.height;
      Animated.timing(translateY, {
        toValue: -keyboardHeight / 2,
        duration: event.duration || 250,
        useNativeDriver: true,
      }).start();
    };

    const keyboardWillHide = (event: any) => {
      Animated.timing(translateY, {
        toValue: 0,
        duration: event.duration || 250,
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
    <View
      className="absolute inset-0 bg-black/80"
      style={{ justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}
    >
      <Animated.View
        className="bg-white dark:bg-gray-900 rounded-2xl p-8 w-full max-w-md"
        style={{ transform: [{ translateY }] }}
      >
        {children}
      </Animated.View>
    </View>
  );
}