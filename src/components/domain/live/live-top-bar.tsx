import { StyleSheet, View } from 'react-native';
import { Input } from '@/components/ui/input';
import { ChannelGroupButton } from './channel-group-button';

interface GroupOption {
  name: string;
  channelCount: number;
}

interface LiveTopBarProps {
  groups: GroupOption[];
  selectedGroupName: string;
  onGroupSelect: (groupName: string) => void;
  searchText: string;
  onSearchTextChange: (text: string) => void;
}

export function LiveTopBar({
  groups,
  selectedGroupName,
  onGroupSelect,
  searchText,
  onSearchTextChange,
}: LiveTopBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Group Selector Button */}
        <View style={styles.buttonContainer}>
          <ChannelGroupButton
            groups={groups}
            selectedGroupName={selectedGroupName}
            onGroupSelect={onGroupSelect}
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
  buttonContainer: {
    alignSelf: 'flex-start',
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