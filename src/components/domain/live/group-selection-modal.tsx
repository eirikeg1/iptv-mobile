import React, { useState, useMemo } from 'react';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Input } from '@/components/ui/input';
import { ModalHeader } from '@/components/ui/modal-header';
import { useSelectionColors } from '@/constants/selection-theme';

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
  const [filterText, setFilterText] = useState('');

  // Theme colors
  const borderColor = useThemeColor({ light: '#ddd', dark: '#333' }, 'icon');
  const selectionColors = useSelectionColors();

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
      <ThemedView style={styles.modalContent}>
        <ModalHeader
          title="Select Channel Group"
          onClose={handleClose}
        />

        {/* Filter Input */}
        <ThemedView style={[styles.filterContainer, { borderBottomColor: borderColor }]}>
          <Input
            placeholder="Filter groups..."
            value={filterText}
            onChangeText={setFilterText}
            style={styles.filterInput}
          />
        </ThemedView>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          <ThemedView style={styles.grid}>
            {filteredGroups.map((item) => {
              const isSelected = item.name === selectedGroupName;
              const colors = isSelected ? selectionColors.selected : selectionColors.unselected;

              return (
                <TouchableOpacity
                  key={item.name || 'all-channels'}
                  style={[
                    styles.groupItem,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => handleGroupSelect(item.name)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${item.name || 'All Channels'} group`}
                  accessibilityHint={`${item.channelCount} channels in this group`}
                >
                  <IconSymbol
                    name="folder"
                    size={24}
                    color={colors.icon}
                    style={styles.groupIcon}
                  />

                  <ThemedText
                    style={[
                      styles.groupName,
                      { color: colors.text },
                    ]}
                    numberOfLines={2}
                  >
                    {item.name || 'All Channels'}
                  </ThemedText>

                  <ThemedText
                    style={[
                      styles.channelCount,
                      { color: colors.subtext },
                    ]}
                  >
                    {item.channelCount} channel{item.channelCount !== 1 ? 's' : ''}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ThemedView>
        </ScrollView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
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