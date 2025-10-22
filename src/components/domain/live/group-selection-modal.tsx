import React, { useState, useMemo } from 'react';
import {
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Input } from '@/components/ui/input';
import { ModalHeader } from '@/components/ui/modal-header';
import { GroupItemComponent, type GroupItem } from '@/components/domain/live/group-item';


interface GroupSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  groups: GroupItem[];
  selectedGroupName?: string;
  onGroupSelect: (groupName: string) => void;
}


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
            {filteredGroups.map((item) => (
              <GroupItemComponent
                key={item.name || 'all-channels'}
                item={item}
                isSelected={item.name === selectedGroupName}
                onPress={handleGroupSelect}
              />
            ))}
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
});