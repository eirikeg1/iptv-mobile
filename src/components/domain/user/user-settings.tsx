import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ActionCard } from '@/components/ui/action-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUserStore } from '@/states/user-store';
import { router } from 'expo-router';
import { memo, useCallback, useState } from 'react';
import { StyleSheet, View, Switch, Alert, Pressable } from 'react-native';

/**
 * User settings and profile management component
 */
export const UserSettings = memo(function UserSettings() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const currentUser = useUserStore((state) => state.currentUser);
  const users = useUserStore((state) => state.users);
  const updateSettings = useUserStore((state) => state.updateSettings);
  const switchUser = useUserStore((state) => state.switchUser);

  const settings = currentUser?.settings;

  const handleToggleSetting = useCallback(
    async (key: keyof NonNullable<typeof settings>, value: any) => {
      if (!currentUser) return;

      try {
        await updateSettings(currentUser.id, { [key]: value });
      } catch (error) {
        console.error('Failed to update setting:', error);
        Alert.alert('Error', 'Failed to update setting. Please try again.');
      }
    },
    [currentUser, updateSettings]
  );

  const handleSwitchUser = useCallback(() => {
    // Navigate to the user selection screen
    router.push('/user-select');
  }, []);

  if (!currentUser) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      {/* Current User Section */}
      <View style={styles.content}>
        <ThemedText type="subtitle" style={styles.header}>
          Profile
        </ThemedText>

        <Pressable
          onPress={handleSwitchUser}
          style={({ pressed }) => [
            styles.userCard,
            {
              backgroundColor: isDark ? '#1a1a1a' : '#f9f9f9',
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: '#007AFF' }]}>
            <ThemedText style={styles.avatarText}>
              {currentUser.username
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </ThemedText>
          </View>
          <View style={styles.userInfo}>
            <ThemedText style={styles.username}>{currentUser.username}</ThemedText>
            {currentUser.isPrimary && (
              <ThemedText style={styles.badge}>Primary Profile</ThemedText>
            )}
          </View>
          <IconSymbol name="chevron.right" size={20} color="#888" />
        </Pressable>

        {users.length > 1 && (
          <ActionCard
            icon="person.2"
            title={`Switch Profile (${users.length} total)`}
            onPress={handleSwitchUser}
            accessibilityLabel="Switch user profile"
          />
        )}
      </View>

      <View style={[styles.separator, { backgroundColor: isDark ? '#333' : '#ddd' }]} />

      {/* App Preferences */}
      <View style={styles.content}>
        <ThemedText type="subtitle" style={styles.header}>
          Preferences
        </ThemedText>

        <View style={styles.settingsList}>
          {/* Autoplay */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Autoplay</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Automatically play next channel
              </ThemedText>
            </View>
            <Switch
              value={settings?.autoplay ?? false}
              onValueChange={(value) => handleToggleSetting('autoplay', value)}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={settings?.autoplay ? '#007AFF' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingDivider, { backgroundColor: isDark ? '#2a2a2a' : '#e8e8e8' }]} />

          {/* Show Channel Logos */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Show Channel Logos</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Display logos in channel list
              </ThemedText>
            </View>
            <Switch
              value={settings?.showChannelLogos ?? true}
              onValueChange={(value) => handleToggleSetting('showChannelLogos', value)}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={settings?.showChannelLogos ? '#007AFF' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingDivider, { backgroundColor: isDark ? '#2a2a2a' : '#e8e8e8' }]} />

          {/* View Mode */}
          <Pressable
            style={styles.settingRow}
            onPress={() =>
              handleToggleSetting(
                'viewMode',
                settings?.viewMode === 'grid' ? 'list' : 'grid'
              )
            }
          >
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>View Mode</ThemedText>
              <ThemedText style={styles.settingDescription}>
                {settings?.viewMode === 'grid' ? 'Grid View' : 'List View'}
              </ThemedText>
            </View>
            <IconSymbol
              name={settings?.viewMode === 'grid' ? 'square.grid.2x2' : 'list.bullet'}
              size={24}
              color="#007AFF"
            />
          </Pressable>

          <View style={[styles.settingDivider, { backgroundColor: isDark ? '#2a2a2a' : '#e8e8e8' }]} />

          {/* Default Quality */}
          <Pressable
            style={styles.settingRow}
            onPress={() => {
              const qualities = ['auto', 'low', 'medium', 'high', 'max'] as const;
              const currentIndex = qualities.indexOf(settings?.defaultQuality ?? 'auto');
              const nextQuality = qualities[(currentIndex + 1) % qualities.length];
              handleToggleSetting('defaultQuality', nextQuality);
            }}
          >
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Default Quality</ThemedText>
              <ThemedText style={styles.settingDescription}>
                {settings?.defaultQuality?.toUpperCase() ?? 'AUTO'}
              </ThemedText>
            </View>
            <IconSymbol name="tv.circle" size={24} color="#007AFF" />
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  separator: {
    height: 1,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  badge: {
    fontSize: 13,
    opacity: 0.6,
  },
  settingsList: {
    gap: 0,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    opacity: 0.6,
  },
  settingDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 8,
  },
});
