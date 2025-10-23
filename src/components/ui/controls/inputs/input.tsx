import * as React from 'react';
import { TextInput, type TextInputProps, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface InputProps extends TextInputProps {
  /** Optional error state to change border color */
  error?: boolean;
}

/**
 * Accessible input component with proper text scrolling.
 * Allows horizontal scrolling for long text and proper cursor positioning.
 */
const Input = React.forwardRef<TextInput, InputProps>(
  ({ style, error, editable = true, ...props }, ref) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
      <TextInput
        ref={ref}
        editable={editable}
        placeholderTextColor={isDark ? '#888' : '#999'}
        style={[
          styles.input,
          {
            backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
            color: isDark ? '#ffffff' : '#000000',
            borderColor: error
              ? '#ef4444'
              : isDark
              ? '#444'
              : '#ddd',
          },
          !editable && styles.disabled,
          style,
        ]}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
});

export { Input };
