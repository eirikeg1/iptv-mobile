import { Dropdown, type DropdownOption } from '@/components/ui/dropdown';
import { Input } from '@/components/ui/input';
import { StyleSheet, View } from 'react-native';

interface GroupOption {
  name: string;
  channelCount: number;
}

interface TopBarProps {
  groups: GroupOption[];
  selectedGroupName: string;
  onGroupSelect: (groupName: string) => void;
  searchText: string;
  onSearchTextChange: (text: string) => void;
  onSearchClear: () => void;
}

export function TopBar({
  groups,
  selectedGroupName,
  onGroupSelect,
  searchText,
  onSearchTextChange,
  onSearchClear,
}: TopBarProps) {
  // Convert groups to dropdown options
  const groupOptions: DropdownOption[] = groups.map(group => ({
    label: group.name || 'All Channels',
    value: group.name,
    description: `${group.channelCount} channel${group.channelCount !== 1 ? 's' : ''}`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Group Selector Dropdown */}
        <View style={styles.dropdownContainer}>
          <Dropdown
            options={groupOptions}
            value={selectedGroupName}
            onSelect={onGroupSelect as (value: unknown) => void}
            placeholder="All Channels"
            accessibilityLabel="Select channel group"
          />
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Input
            placeholder="Search channels..."
            value={searchText}
            onChangeText={onSearchTextChange}
            style={styles.searchInput}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'column',
    gap: 12,
  },
  dropdownContainer: {
    alignSelf: 'flex-start',
    minWidth: 200,
    maxWidth: '70%',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    height: 36,
    fontSize: 14,
  },
});