import * as React from 'react';
import { TextInput, type TextInputProps, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface TextareaProps extends Omit<TextInputProps, 'multiline'> {
  /** Optional error state to change border color */
  error?: boolean;
}

/**
 * Multiline text input with scrolling support for long text.
 * Ideal for URLs and long-form content.
 */
const Textarea = React.forwardRef<TextInput, TextareaProps>(
  ({ style, error, editable = true, ...props }, ref) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
      <TextInput
        ref={ref}
        editable={editable}
        multiline
        textAlignVertical="top"
        scrollEnabled
        placeholderTextColor={isDark ? '#888' : '#999'}
        style={[
          styles.textarea,
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

Textarea.displayName = 'Textarea';

const styles = StyleSheet.create({
  textarea: {
    minHeight: 88,
    maxHeight: 132,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
});

export { Textarea };
