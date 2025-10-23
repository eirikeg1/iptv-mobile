import { IconSymbol } from '@/components/ui/display/icon-symbol';
import { ThemedText } from '@/components/ui/display/themed-text';
import { useSelectionColors } from '@/constants/selection-theme';
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 64) / 2; // 2 columns with padding

export interface GroupItem {
  name: string;
  channelCount: number;
}

export interface GroupItemProps {
  /**
   * Group data to display
   */
  item: GroupItem;

  /**
   * Whether this group is currently selected
   */
  isSelected: boolean;

  /**
   * Callback when group is pressed
   */
  onPress: (groupName: string) => void;
}

export function GroupItemComponent({
  item,
  isSelected,
  onPress,
}: GroupItemProps) {
  const selectionColors = useSelectionColors();
  const colors = isSelected ? selectionColors.selected : selectionColors.unselected;

  const handlePress = () => {
    onPress(item.name);
  };

  const displayName = item.name || 'All Channels';
  const channelText = `${item.channelCount} channel${item.channelCount !== 1 ? 's' : ''}`;

  return (
    <TouchableOpacity
      style={[
        styles.groupItem,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Select ${displayName} group`}
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
        {displayName}
      </ThemedText>

      <ThemedText
        style={[
          styles.channelCount,
          { color: colors.subtext },
        ]}
      >
        {channelText}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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