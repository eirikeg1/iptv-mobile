import { IconSymbol } from '@/components/ui/icon-symbol';
import { Input } from '@/components/ui/input';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TopBarProps {
  selectedGroupName: string;
  onGroupSelectorPress: () => void;
  searchText: string;
  onSearchTextChange: (text: string) => void;
  onSearchClear: () => void;
}

export function TopBar({
  selectedGroupName,
  onGroupSelectorPress,
  searchText,
  onSearchTextChange,
  onSearchClear,
}: TopBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
          borderBottomColor: isDark ? '#333' : '#e5e5e5',
        },
      ]}
    >
      <View style={styles.content}>
        {/* Group Selector Button */}
        <TouchableOpacity
          style={[
            styles.groupButton,
            {
              backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
              borderColor: isDark ? '#444' : '#ddd',
            },
          ]}
          onPress={onGroupSelectorPress}
          activeOpacity={0.7}
        >
          <View style={styles.groupButtonContent}>
            <IconSymbol
              name="folder"
              size={16}
              color={isDark ? '#ffffff' : '#000000'}
            />
            <View style={styles.groupTextContainer}>
              <Text
                style={[
                  styles.groupText,
                  { color: isDark ? '#ffffff' : '#000000' },
                ]}
                numberOfLines={1}
              >
                {selectedGroupName || 'All Channels'}
              </Text>
            </View>
            <IconSymbol
              name="chevron.down"
              size={14}
              color={isDark ? '#888' : '#666'}
            />
          </View>
        </TouchableOpacity>

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
    borderBottomWidth: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  groupButton: {
    flex: 0,
    minWidth: 120,
    maxWidth: 160,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  groupButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  groupText: {
    fontSize: 14,
    fontWeight: '500',
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
  clearButton: {
    position: 'absolute',
    right: 4,
    padding: 8,
  },
});