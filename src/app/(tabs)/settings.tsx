import { StyleSheet, View } from 'react-native';

import { PlaylistManager } from '@/components/domain/playlist';
import { UserSettings } from '@/components/domain/user/user-settings';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function SettingsScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="gearshape.fill"
          style={styles.headerImage}
        />
      }
    >
      {/* User Settings Section */}
      <ThemedView>
        <UserSettings />
      </ThemedView>

      {/* Playlist Management Section */}
      <ThemedView>
        <View style={styles.playlistContainer}>
          <PlaylistManager />
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  playlistContainer: {
    minHeight: 400,
  },
});
