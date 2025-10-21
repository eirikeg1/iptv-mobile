import { memo, useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, FlatList, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface DropdownOption<T = string> {
  label: string;
  value: T;
  description?: string;
}

export interface DropdownProps<T = string> {
  /**
   * Available options to select from
   */
  options: DropdownOption<T>[];

  /**
   * Currently selected value
   */
  value: T;

  /**
   * Callback when selection changes
   */
  onSelect: (value: T) => void;

  /**
   * Placeholder text when no value is selected
   */
  placeholder?: string;

  /**
   * Label for the dropdown
   */
  label?: string;

  /**
   * Whether the dropdown is disabled
   */
  disabled?: boolean;

  /**
   * Custom style for the dropdown container
   */
  style?: ViewStyle;

  /**
   * Accessibility label
   */
  accessibilityLabel?: string;
}

/**
 * A reusable dropdown component for selecting from a list of options
 */
export const Dropdown = memo(function Dropdown<T = string>({
  options,
  value,
  onSelect,
  placeholder = 'Select an option',
  label,
  disabled = false,
  style,
  accessibilityLabel,
}: DropdownProps<T>) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen(prev => !prev);
    }
  }, [disabled]);

  const handleSelect = useCallback((optionValue: T) => {
    onSelect(optionValue);
    setIsOpen(false);
  }, [onSelect]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const dropdownStyle = [
    styles.dropdown,
    {
      backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
      borderColor: isDark ? '#444' : '#ddd',
      opacity: disabled ? 0.5 : 1,
    },
    style,
  ];

  const renderOption = useCallback(
    ({ item }: { item: DropdownOption<T> }) => {
      const isSelected = item.value === value;

      return (
        <TouchableOpacity
          style={[
            styles.option,
            {
              backgroundColor: isSelected
                ? isDark ? '#444' : '#e3f2fd'
                : isDark ? '#2a2a2a' : '#ffffff',
            },
          ]}
          onPress={() => handleSelect(item.value)}
          accessibilityRole="button"
          accessibilityLabel={`Select ${item.label}`}
          accessibilityState={{ selected: isSelected }}
        >
          <View style={styles.optionContent}>
            <ThemedText style={[styles.optionLabel, isSelected && styles.selectedOptionLabel]}>
              {item.label}
            </ThemedText>
            {item.description && (
              <ThemedText style={styles.optionDescription}>
                {item.description}
              </ThemedText>
            )}
          </View>
          {isSelected && (
            <IconSymbol name="checkmark" size={18} color="#007AFF" />
          )}
        </TouchableOpacity>
      );
    },
    [value, isDark, handleSelect]
  );

  const keyExtractor = useCallback(
    (item: DropdownOption<T>, index: number) => `${item.value}-${index}`,
    []
  );

  return (
    <View style={styles.container}>
      {label && (
        <ThemedText style={styles.label}>{label}</ThemedText>
      )}

      <TouchableOpacity
        style={dropdownStyle}
        onPress={handleToggle}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || label || 'Open dropdown'}
        accessibilityHint="Tap to open dropdown menu"
        accessibilityState={{ expanded: isOpen, disabled }}
      >
        <ThemedText style={styles.selectedText}>
          {selectedOption?.label || placeholder}
        </ThemedText>
        <IconSymbol
          name={isOpen ? 'chevron.up' : 'chevron.down'}
          size={20}
          color={isDark ? '#888' : '#666'}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
        accessibilityViewIsModal
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <View style={[
            styles.modalContent,
            { backgroundColor: isDark ? '#2a2a2a' : '#ffffff' }
          ]}>
            <FlatList
              data={options}
              renderItem={renderOption}
              keyExtractor={keyExtractor}
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
  },
  selectedText: {
    flex: 1,
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    maxHeight: '60%',
    width: '100%',
    maxWidth: 300,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  optionsList: {
    maxHeight: 250,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
  },
  selectedOptionLabel: {
    fontWeight: '600',
    color: '#007AFF',
  },
  optionDescription: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2,
  },
});