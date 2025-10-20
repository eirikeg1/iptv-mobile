import { useState, useCallback, memo } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Switch } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { usePlaylistStore } from '@/states/playlist-store';

interface PlaylistFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Form for adding a new IPTV playlist with validation.
 * Supports optional authentication credentials.
 */
export const PlaylistForm = memo(function PlaylistForm({ onSuccess, onCancel }: PlaylistFormProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [useCredentials, setUseCredentials] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addPlaylist = usePlaylistStore((state) => state.addPlaylist);

  const handleSubmit = useCallback(async () => {
    console.log('[PlaylistForm] Submit started');
    setError(null);

    if (!name.trim()) {
      console.warn('[PlaylistForm] Validation failed: name is empty');
      setError('Please enter a playlist name');
      return;
    }

    if (!url.trim()) {
      console.warn('[PlaylistForm] Validation failed: URL is empty');
      setError('Please enter a playlist URL');
      return;
    }

    if (useCredentials && (!username.trim() || !password.trim())) {
      console.warn('[PlaylistForm] Validation failed: credentials incomplete');
      setError('Please enter both username and password');
      return;
    }

    console.log('[PlaylistForm] Validation passed, submitting:', {
      name: name.trim(),
      urlLength: url.trim().length,
      hasCredentials: useCredentials,
    });

    setIsSubmitting(true);

    try {
      await addPlaylist({
        name: name.trim(),
        url: url.trim(),
        credentials: useCredentials
          ? { username: username.trim(), password: password.trim() }
          : undefined,
      });

      console.log('[PlaylistForm] Playlist added successfully, clearing form');
      setName('');
      setUrl('');
      setUsername('');
      setPassword('');
      setUseCredentials(false);

      onSuccess?.();
    } catch (err) {
      console.error('[PlaylistForm] Error adding playlist:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add playlist';
      console.error('[PlaylistForm] Error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
      console.log('[PlaylistForm] Submit completed');
    }
  }, [name, url, useCredentials, username, password, addPlaylist, onSuccess]);

  return (
    <ThemedView style={styles.container}>
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
        <Input
          value={name}
          onChangeText={setName}
          placeholder="e.g., My IPTV Playlist"
          editable={!isSubmitting}
          accessibilityLabel="Playlist name"
          accessibilityHint="Enter a name for your IPTV playlist"
          returnKeyType="next"
          error={!!error && !name.trim()}
        />
      </View>

      <View style={styles.formGroup}>
        <ThemedText style={styles.label}>Playlist URL</ThemedText>
        <Textarea
          value={url}
          onChangeText={setUrl}
          placeholder="https://example.com/playlist.m3u"
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isSubmitting}
          accessibilityLabel="Playlist URL"
          accessibilityHint="Enter the M3U playlist URL"
          returnKeyType="next"
          textContentType="URL"
          error={!!error && !url.trim()}
        />
        <ThemedText style={styles.helpText}>
          If your URL contains username/password parameters, paste the full URL and skip authentication below
        </ThemedText>
      </View>

      <View style={styles.switchContainer}>
        <View style={styles.switchLabelContainer}>
          <ThemedText style={styles.label}>HTTP Basic Auth</ThemedText>
          <ThemedText style={styles.helpText}>Only for HTTP Basic Authentication</ThemedText>
        </View>
        <Switch
          value={useCredentials}
          onValueChange={setUseCredentials}
          disabled={isSubmitting}
          accessibilityLabel="Requires authentication"
          accessibilityHint="Toggle if the playlist requires HTTP Basic Auth"
        />
      </View>

      {useCredentials && (
        <>
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Username</ThemedText>
            <Input
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
              accessibilityLabel="Username"
              accessibilityHint="Enter your playlist username"
              returnKeyType="next"
              textContentType="username"
              error={!!error && useCredentials && !username.trim()}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Password</ThemedText>
            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
              accessibilityLabel="Password"
              accessibilityHint="Enter your playlist password"
              returnKeyType="done"
              textContentType="password"
              error={!!error && useCredentials && !password.trim()}
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
  formGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 6,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  switchLabelContainer: {
    flex: 1,
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
