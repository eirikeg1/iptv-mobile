import { IconSymbol } from '@/components/ui/display/icon-symbol';
import { ThemedText } from '@/components/ui/display/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Playlist } from '@/types/playlist.types';
import { memo } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { PlaylistForm } from './playlist-form';

interface PlaylistModalProps {
  visible: boolean;
  onClose: () => void;
  playlist?: Playlist;
}

/**
 * Modal for adding or editing a playlist with proper keyboard handling.
 * Ensures input fields are never covered by the keyboard.
 */
export const PlaylistModal = memo(function PlaylistModal({ visible, onClose, playlist }: PlaylistModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isEditing = !!playlist;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={[styles.modalContent, { backgroundColor: isDark ? '#1a1a1a' : '#ffffff' }]}>
          <View style={[styles.header, { borderBottomColor: isDark ? '#333' : '#ddd' }]}>
            <ThemedText type="subtitle" style={styles.headerTitle}>
              {isEditing ? 'Edit Playlist' : 'Add New Playlist'}
            </ThemedText>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close modal"
              accessibilityHint={`Close the ${isEditing ? 'edit' : 'add'} playlist modal`}
            >
              <IconSymbol name="xmark" size={24} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
          >
            <PlaylistForm onSuccess={onClose} onCancel={onClose} playlist={playlist} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
});
