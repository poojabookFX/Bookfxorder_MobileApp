import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return ((parts[0][0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

// The user's photo (e.g. from Google) or their initials when there is none.
export function Avatar({ name, image, size = 72 }: { name: string; image?: string | null; size?: number }) {
  // Remember which image failed so a newly chosen photo is tried again.
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const failed = !!image && failedImage === image;
  const round = { width: size, height: size, borderRadius: size / 2 };

  if (image && !failed) {
    return (
      <Image
        source={{ uri: image }}
        style={[styles.base, round]}
        contentFit="cover"
        transition={150}
        onError={() => setFailedImage(image)}
        accessibilityLabel={`${name} profile photo`}
      />
    );
  }

  return (
    <View style={[styles.base, styles.fallback, round]}>
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 3,
    borderColor: Colors.white,
  },
  fallback: {
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Colors.white,
    fontWeight: '800',
  },
});
