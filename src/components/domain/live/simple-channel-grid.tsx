import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SimpleChannelGridProps {
  selectedGroup?: string;
  searchText?: string;
}

export function SimpleChannelGrid({
  selectedGroup,
  searchText = '',
}: SimpleChannelGridProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Test with simple static data
  const testChannels = [
    { id: '1', name: 'Test Channel 1' },
    { id: '2', name: 'Test Channel 2' },
    { id: '3', name: 'Test Channel 3' },
    { id: '4', name: 'Test Channel 4' },
    { id: '5', name: 'Test Channel 5' },
    { id: '6', name: 'Test Channel 6' },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.debug, { color: isDark ? '#fff' : '#000' }]}>
        Debug: Group: {selectedGroup || 'All'}, Search: "{searchText}"
      </Text>
      <View style={styles.grid}>
        {testChannels.map((channel) => (
          <View key={channel.id} style={styles.gridItem}>
            <TouchableOpacity
              style={[
                styles.channelItem,
                {
                  backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                  borderColor: isDark ? '#444' : '#e5e5e5',
                },
              ]}
              onPress={() => console.log('Test channel pressed:', channel.name)}
            >
              <View style={[styles.icon, { backgroundColor: isDark ? '#444' : '#ddd' }]}>
                <Text style={[styles.iconText, { color: isDark ? '#fff' : '#000' }]}>
                  {channel.name.charAt(0)}
                </Text>
              </View>
              <Text
                style={[styles.channelName, { color: isDark ? '#fff' : '#000' }]}
                numberOfLines={2}
              >
                {channel.name}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  debug: {
    fontSize: 12,
    marginBottom: 16,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '30%',
    marginBottom: 12,
  },
  channelItem: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  icon: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconText: {
    fontSize: 24,
    fontWeight: '600',
  },
  channelName: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 16,
  },
});