import { ThemedText } from '@/components/themed-text';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

interface VideoPreviewGridProps {
  children: ReactNode[];
  title?: string;
}

export function VideoPreviewGrid({ title, children }: VideoPreviewGridProps) {
  return (
    <View style={styles.container}>
      {title && <ThemedText type="title">{title}</ThemedText>}
      <View style={styles.grid}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    rowGap: 8,
  },
});

export default VideoPreviewGrid;
