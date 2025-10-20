import { useState, useCallback, useMemo, memo } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { usePlaylistStore } from '@/states/playlist-store';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface PlaylistFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PlaylistForm = memo(function PlaylistForm({ onSuccess, onCancel }: PlaylistFormProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [useCredentials, setUseCredentials] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addPlaylist = usePlaylistStore((state) => state.addPlaylist);

  const handleSubmit = useCallback(async () => {
    // Reset error
    setError(null);

    // Validate
    if (!name.trim()) {
      setError('Please enter a playlist name');
      return;
    }

    if (!url.trim()) {
      setError('Please enter a playlist URL');
      return;
    }

    if (useCredentials && (!username.trim() || !password.trim())) {
      setError('Please enter both username and password');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('[PlaylistForm] Starting playlist addition:', { name: name.trim(), url: url.trim() });

      await addPlaylist({
        name: name.trim(),
        url: url.trim(),
        credentials: useCredentials
          ? { username: username.trim(), password: password.trim() }
          : undefined,
      });

      console.log('[PlaylistForm] Playlist added successfully');

      // Clear form
      setName('');
      setUrl('');
      setUsername('');
      setPassword('');
      setUseCredentials(false);

      onSuccess?.();
    } catch (err) {
      console.error('[PlaylistForm] Error adding playlist:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add playlist';
      setError(errorMessage);
      // Don't call onSuccess if there's an error - keep form open
    } finally {
      setIsSubmitting(false);
    }
  }, [name, url, useCredentials, username, password, addPlaylist, onSuccess]);

  const inputStyle = useMemo(
    () => [
      styles.input,
      {
        backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
        color: isDark ? '#ffffff' : '#000000',
        borderColor: isDark ? '#444' : '#ddd',
      },
    ],
    [isDark]
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Add New Playlist
      </ThemedText>

      {error && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>⚠️ {error}</ThemedText>
        </View>
      )}

      {isSubmitting && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>
            Fetching and parsing playlist... This may take a moment.
          </ThemedText>
        </View>
      )}

      <View style={styles.formGroup}>
        <ThemedText style={styles.label}>Playlist Name</ThemedText>
        <TextInput
          style={inputStyle}
          value={name}
          onChangeText={setName}
          placeholder="e.g., My IPTV Playlist"
          placeholderTextColor={isDark ? '#888' : '#999'}
          editable={!isSubmitting}
          accessibilityLabel="Playlist name"
          accessibilityHint="Enter a name for your IPTV playlist"
          returnKeyType="next"
        />
      </View>

      <View style={styles.formGroup}>
        <ThemedText style={styles.label}>Playlist URL</ThemedText>
        <TextInput
          style={inputStyle}
          value={url}
          onChangeText={setUrl}
          placeholder="https://example.com/playlist.m3u"
          placeholderTextColor={isDark ? '#888' : '#999'}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isSubmitting}
          accessibilityLabel="Playlist URL"
          accessibilityHint="Enter the M3U playlist URL"
          returnKeyType="next"
          textContentType="URL"
        />
      </View>

      <View style={styles.switchContainer}>
        <ThemedText style={styles.label}>Requires Authentication</ThemedText>
        <Switch
          value={useCredentials}
          onValueChange={setUseCredentials}
          disabled={isSubmitting}
          accessibilityLabel="Requires authentication"
          accessibilityHint="Toggle if the playlist requires username and password"
        />
      </View>

      {useCredentials && (
        <>
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Username</ThemedText>
            <TextInput
              style={inputStyle}
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor={isDark ? '#888' : '#999'}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
              accessibilityLabel="Username"
              accessibilityHint="Enter your playlist username"
              returnKeyType="next"
              textContentType="username"
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Password</ThemedText>
            <TextInput
              style={inputStyle}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={isDark ? '#888' : '#999'}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
              accessibilityLabel="Password"
              accessibilityHint="Enter your playlist password"
              returnKeyType="done"
              textContentType="password"
            />
          </View>
        </>
      )}

      <View style={styles.buttonContainer}>
        {onCancel && (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={isSubmitting}
            accessibilityLabel="Cancel"
            accessibilityHint="Cancel adding playlist"
            accessibilityRole="button"
          >
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          accessibilityLabel="Add playlist"
          accessibilityHint="Submit the playlist form"
          accessibilityRole="button"
          accessibilityState={{ disabled: isSubmitting }}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" accessibilityLabel="Loading" />
          ) : (
            <ThemedText style={styles.submitButtonText}>Add Playlist</ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: '#fee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fcc',
  },
  errorText: {
    color: '#c33',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
