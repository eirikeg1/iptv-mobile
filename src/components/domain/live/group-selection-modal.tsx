import { GroupItemComponent, type GroupItem } from '@/components/domain/live/group-item';
import { ModalHeader } from '@/components/ui/containers/modal/modal-header';
import { Input } from '@/components/ui/controls/inputs/input';
import { ThemedView } from '@/components/ui/display/themed-view';
import { useFavoriteGroups } from '@/hooks/live/use-favorite-groups';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useMemo, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
} from 'react-native';


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
  const { favoriteGroups, toggleFavorite } = useFavoriteGroups();

  // Theme colors
  const borderColor = useThemeColor({ light: '#ddd', dark: '#333' }, 'icon');

  // Filter and sort groups
  const displayedGroups = useMemo(() => {
    let result = groups;

    // Filter
    if (filterText.trim()) {
      result = result.filter(group =>
        group.name.toLowerCase().includes(filterText.toLowerCase())
      );
    }

    // Sort: Favorites first, then alphabetical
    return [...result].sort((a, b) => {
      const isAFav = favoriteGroups.includes(a.name);
      const isBFav = favoriteGroups.includes(b.name);

      if (isAFav && !isBFav) return -1;
      if (!isAFav && isBFav) return 1;

      return a.name.localeCompare(b.name);
    });
  }, [groups, filterText, favoriteGroups]);

  // Debug logging
  if (__DEV__ && visible) {
    console.log('Modal is visible, groups:', groups.length);
    console.log('Selected group:', selectedGroupName);
    console.log('Filter text:', filterText);
    console.log('Displayed groups:', displayedGroups.length);
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
            {displayedGroups.map((item) => (
              <GroupItemComponent
                key={item.name || 'all-channels'}
                item={item}
                isSelected={item.name === selectedGroupName}
                onPress={handleGroupSelect}
                isFavorite={favoriteGroups.includes(item.name)}
                onToggleFavorite={toggleFavorite}
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