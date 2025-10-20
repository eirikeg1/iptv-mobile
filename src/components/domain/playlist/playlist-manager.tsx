import { useState, useCallback, memo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PlaylistForm } from './playlist-form';
import { PlaylistList } from './playlist-list';
import { usePlaylistStore } from '@/states/playlist-store';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const PlaylistManager = memo(function PlaylistManager() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [showForm, setShowForm] = useState(false);
  const playlists = usePlaylistStore((state) => state.playlists);
  const isLoading = usePlaylistStore((state) => state.isLoading);
  const error = usePlaylistStore((state) => state.error);

  console.log('[PlaylistManager] Render - playlists count:', playlists.length);

  const handleFormSuccess = useCallback(() => {
    console.log('[PlaylistManager] Form success, closing form');
    setShowForm(false);
  }, []);

  const handleFormCancel = useCallback(() => {
    console.log('[PlaylistManager] Form cancelled');
    setShowForm(false);
  }, []);

  const handleShowForm = useCallback(() => {
    console.log('[PlaylistManager] Opening form');
    setShowForm(true);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View>
          <ThemedText type="subtitle" style={styles.title}>
            IPTV Playlists
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
          </ThemedText>
        </View>

        {!showForm && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleShowForm}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Add playlist"
            accessibilityHint="Open form to add a new IPTV playlist"
            accessibilityState={{ disabled: isLoading }}
          >
            <IconSymbol name="plus" size={20} color="#fff" />
            <ThemedText style={styles.addButtonText}>Add</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {error && !showForm && (
        <View style={[styles.errorBanner, { backgroundColor: isDark ? '#4a1a1a' : '#fee' }]}>
          <IconSymbol name="exclamationmark.triangle" size={20} color="#c33" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      )}

      {isLoading && !showForm && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>Loading playlists...</ThemedText>
        </View>
      )}

      {!isLoading && (
        <>
          {showForm ? (
            <ScrollView style={styles.formContainer}>
              <PlaylistForm onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
            </ScrollView>
          ) : (
            <PlaylistList />
          )}
        </>
      )}
    </ThemedView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
    color: '#c33',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
});
