import React, { useState, useMemo } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Input } from '@/components/ui/input';

interface GroupItem {
  name: string;
  channelCount: number;
}

interface GroupSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  groups: GroupItem[];
  selectedGroupName?: string;
  onGroupSelect: (groupName: string) => void;
}

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 64) / 2; // 2 columns with padding

export function GroupSelectionModal({
  visible,
  onClose,
  groups,
  selectedGroupName,
  onGroupSelect,
}: GroupSelectionModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [filterText, setFilterText] = useState('');

  // Filter groups based on search text
  const filteredGroups = useMemo(() => {
    if (!filterText.trim()) {
      return groups;
    }
    return groups.filter(group =>
      group.name.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [groups, filterText]);

  // Debug logging
  if (__DEV__ && visible) {
    console.log('Modal is visible, groups:', groups.length);
    console.log('Selected group:', selectedGroupName);
    console.log('Filter text:', filterText);
    console.log('Filtered groups:', filteredGroups.length);
  }

  const handleGroupSelect = (groupName: string) => {
    onGroupSelect(groupName);
    setFilterText(''); // Clear filter when selecting a group
    onClose();
  };

  const handleClose = () => {
    setFilterText(''); // Clear filter when closing modal
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.modalContent, { backgroundColor: isDark ? '#1a1a1a' : '#ffffff' }]}>
        <View style={[styles.header, { borderBottomColor: isDark ? '#333' : '#ddd' }]}>
          <ThemedText type="subtitle" style={styles.headerTitle}>
            Select Channel Group
          </ThemedText>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close modal"
            accessibilityHint="Close the group selection modal"
          >
            <IconSymbol name="xmark" size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>

        {/* Filter Input */}
        <View style={[styles.filterContainer, { borderBottomColor: isDark ? '#333' : '#e5e5e5' }]}>
          <Input
            placeholder="Filter groups..."
            value={filterText}
            onChangeText={setFilterText}
            style={styles.filterInput}
          />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.grid}>
            {filteredGroups.map((item) => {
              const isSelected = item.name === selectedGroupName;

              return (
                <TouchableOpacity
                  key={item.name || 'all-channels'}
                  style={[
                    styles.groupItem,
                    {
                      backgroundColor: isSelected
                        ? isDark
                          ? '#3b82f6'
                          : '#007AFF'
                        : isDark
                        ? '#2a2a2a'
                        : '#f5f5f5',
                      borderColor: isSelected
                        ? isDark
                          ? '#3b82f6'
                          : '#007AFF'
                        : isDark
                        ? '#444'
                        : '#e5e5e5',
                    },
                  ]}
                  onPress={() => handleGroupSelect(item.name)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${item.name || 'All Channels'} group`}
                  accessibilityHint={`${item.channelCount} channels in this group`}
                >
                  <View style={styles.groupIcon}>
                    <IconSymbol
                      name="folder"
                      size={24}
                      color={
                        isSelected
                          ? '#ffffff'
                          : isDark
                          ? '#888'
                          : '#666'
                      }
                    />
                  </View>

                  <Text
                    style={[
                      styles.groupName,
                      {
                        color: isSelected
                          ? '#ffffff'
                          : isDark
                          ? '#ffffff'
                          : '#000000',
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {item.name || 'All Channels'}
                  </Text>

                  <Text
                    style={[
                      styles.channelCount,
                      {
                        color: isSelected
                          ? '#e5e7eb'
                          : isDark
                          ? '#888'
                          : '#666',
                      },
                    ]}
                  >
                    {item.channelCount} channel{item.channelCount !== 1 ? 's' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
  },
  closeButton: {
    padding: 4,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  filterInput: {
    height: 40,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  groupItem: {
    width: ITEM_WIDTH,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: 'center',
    minHeight: 120,
  },
  groupIcon: {
    marginBottom: 8,
  },
  groupName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
    minHeight: 32,
  },
  channelCount: {
    fontSize: 12,
    textAlign: 'center',
  },
});